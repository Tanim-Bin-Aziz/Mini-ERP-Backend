import { ProductModel } from "../product/product.model";
import { CustomerModel } from "../customer/customer.model";
import { SaleModel } from "../sale/sale.model";

// Default threshold used by the assessment spec ("Stock < 5").
// Kept separate from a product's own `lowStockThreshold` field, since the
// spec explicitly calls out a fixed value for the dashboard stat.
const LOW_STOCK_LIMIT = 5;

export interface DashboardStats {
  totalProducts: number;
  totalCustomers: number;
  totalSales: number;
  totalRevenue: number;
  lowStockCount: number;
  lowStockProducts: {
    _id: string;
    name: string;
    sku: string;
    stock: number;
    category: string;
  }[];
  topSellingProducts: {
    productId: string;
    name: string;
    sku: string;
    unitsSold: number;
    revenue: number;
  }[];
  salesOverview: {
    totalSalesCount: number;
    totalGrandTotal: number;
    totalDiscount: number;
    totalTax: number;
    averageOrderValue: number;
  };
}

export const DashboardService = {
  // Bonus: everything below runs as parallel aggregation pipelines
  // (Promise.all) rather than sequential queries, so the dashboard
  // stays fast even as collections grow.
  getStats: async (): Promise<DashboardStats> => {
    const [
      totalProducts,
      totalCustomers,
      lowStockProducts,
      salesSummary,
      topSellingProducts,
    ] = await Promise.all([
      // Only count active (non soft-deleted) products/customers
      ProductModel.countDocuments({ isActive: true }),
      CustomerModel.countDocuments({ isActive: true }),

      ProductModel.find({ isActive: true, stock: { $lt: LOW_STOCK_LIMIT } })
        .select("name sku stock category")
        .sort({ stock: 1 })
        .limit(20)
        .lean(),

      // Single aggregation pipeline: count of sales + revenue/discount/tax totals
      SaleModel.aggregate([
        { $match: { status: "completed" } },
        {
          $group: {
            _id: null,
            totalSalesCount: { $sum: 1 },
            totalGrandTotal: { $sum: "$grandTotal" },
            totalDiscount: { $sum: "$discount" },
            totalTax: { $sum: "$tax" },
          },
        },
      ]),

      // Bonus: top 5 best-selling products by units sold, computed by
      // unwinding each sale's line items and regrouping by product.
      SaleModel.aggregate([
        { $match: { status: "completed" } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            name: { $first: "$items.name" },
            sku: { $first: "$items.sku" },
            unitsSold: { $sum: "$items.quantity" },
            revenue: { $sum: "$items.lineTotal" },
          },
        },
        { $sort: { unitsSold: -1 } },
        { $limit: 5 },
        {
          $project: {
            _id: 0,
            productId: "$_id",
            name: 1,
            sku: 1,
            unitsSold: 1,
            revenue: 1,
          },
        },
      ]),
    ]);

    const totalSales = salesSummary[0]?.totalSalesCount ?? 0;
    const totalGrandTotal = salesSummary[0]?.totalGrandTotal ?? 0;
    const totalDiscount = salesSummary[0]?.totalDiscount ?? 0;
    const totalTax = salesSummary[0]?.totalTax ?? 0;

    return {
      totalProducts,
      totalCustomers,
      totalSales,
      totalRevenue: totalGrandTotal,
      lowStockCount: lowStockProducts.length,
      lowStockProducts: lowStockProducts.map((p) => ({
        _id: p._id.toString(),
        name: p.name,
        sku: p.sku,
        stock: p.stock,
        category: p.category,
      })),
      topSellingProducts,
      salesOverview: {
        totalSalesCount: totalSales,
        totalGrandTotal,
        totalDiscount,
        totalTax,
        averageOrderValue: totalSales > 0 ? totalGrandTotal / totalSales : 0,
      },
    };
  },

  // Bonus: sales revenue grouped by day for the last N days — powers a
  // simple line/bar chart on the frontend dashboard without extra endpoints.
  getRevenueTrend: async (days = 7) => {
    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    since.setHours(0, 0, 0, 0);

    const trend = await SaleModel.aggregate([
      { $match: { status: "completed", createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$grandTotal" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          revenue: 1,
          orders: 1,
        },
      },
    ]);

    // Fill in the days that had zero sales so the chart shows real daily
    // granularity (a 2-3 point series otherwise renders as a near-straight line).
    const byDate = new Map(trend.map((t) => [t.date, t]));
    const filled: { date: string; revenue: number; orders: number }[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      filled.push(byDate.get(key) ?? { date: key, revenue: 0, orders: 0 });
    }

    return filled;
  },
};
