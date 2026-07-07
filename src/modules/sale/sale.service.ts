import mongoose from "mongoose";
import { SaleModel, ISale, PaymentMethod } from "./sale.model";
import { ProductModel } from "../product/product.model";
import { CustomerModel } from "../customer/customer.model";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { buildPaginationMeta } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { emitNewSale, emitLowStockAlert } from "../../config/socket";

interface SaleItemInput {
  product: string;
  quantity: number;
}

interface CreateSaleInput {
  customer: string;
  items: SaleItemInput[];
  discount?: number;
  tax?: number;
  paymentMethod?: PaymentMethod;
}

const generateInvoiceNumber = (): string => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `INV-${datePart}-${randomPart}`;
};

export const SaleService = {
  // Bonus: wrapped in a Mongoose transaction so stock deduction + sale
  // creation + customer total update either all succeed or all roll back —
  // prevents a half-completed sale from corrupting inventory counts.
  create: async (input: CreateSaleInput, soldBy: string): Promise<ISale> => {
    const customer = await CustomerModel.findById(input.customer);
    if (!customer || !customer.isActive) {
      throw ApiError.notFound("Customer not found or inactive");
    }

    const session = await mongoose.startSession();
    let lowStockAlerts: { productId: string; name: string; stock: number }[] =
      [];

    try {
      const sale = await session.withTransaction(async () => {
        const saleItems = [];
        let subtotal = 0;

        for (const item of input.items) {
          const product = await ProductModel.findById(item.product).session(
            session,
          );
          if (!product || !product.isActive) {
            throw ApiError.notFound(`Product not found: ${item.product}`);
          }
          if (product.stock < item.quantity) {
            throw ApiError.badRequest(
              `Insufficient stock for '${product.name}'. Available: ${product.stock}, requested: ${item.quantity}`,
            );
          }

          product.stock -= item.quantity;
          await product.save({ session });

          if (product.stock <= product.lowStockThreshold) {
            lowStockAlerts.push({
              productId: product._id.toString(),
              name: product.name,
              stock: product.stock,
            });
          }

          const lineTotal = product.price * item.quantity;
          subtotal += lineTotal;

          saleItems.push({
            product: product._id,
            name: product.name,
            sku: product.sku,
            unitPrice: product.price,
            quantity: item.quantity,
            lineTotal,
          });
        }

        const discount = input.discount ?? 0;
        const tax = input.tax ?? 0;
        const grandTotal = Math.max(subtotal - discount + tax, 0);

        const [createdSale] = await SaleModel.create(
          [
            {
              invoiceNumber: generateInvoiceNumber(),
              customer: customer._id,
              items: saleItems,
              subtotal,
              discount,
              tax,
              grandTotal,
              paymentMethod: input.paymentMethod ?? "cash",
              soldBy,
            },
          ],
          { session },
        );

        await CustomerModel.findByIdAndUpdate(
          customer._id,
          { $inc: { totalPurchases: grandTotal } },
          { session },
        );

        return createdSale;
      });

      // Emit real-time events only after the transaction has committed successfully
      emitNewSale({
        saleId: sale._id.toString(),
        grandTotal: sale.grandTotal,
        customer: customer.name,
      });
      lowStockAlerts.forEach((alert) => emitLowStockAlert(alert));

      return sale;
    } finally {
      await session.endSession();
    }
  },

  // Search matches invoiceNumber directly, and customer name indirectly (Sale only
  // stores a customer ref, so matching customers are resolved first, then OR'd in).
  getAll: async (queryParams: Record<string, unknown>) => {
    const searchTerm =
      typeof queryParams.search === "string" ? queryParams.search.trim() : "";

    let baseFilter: Record<string, unknown> = {};
    if (searchTerm) {
      const matchingCustomers = await CustomerModel.find({
        name: { $regex: searchTerm, $options: "i" },
      }).select("_id");

      baseFilter = {
        $or: [
          { invoiceNumber: { $regex: searchTerm, $options: "i" } },
          { customer: { $in: matchingCustomers.map((c) => c._id) } },
        ],
      };
    }

    // search() is skipped here since the search term is already folded into baseFilter above
    const builder = new QueryBuilder<ISale>(
      SaleModel.find(baseFilter)
        .populate("customer", "name phone")
        .populate("soldBy", "name"),
      queryParams,
    );

    const builtQuery = builder.filter().sort().paginate();
    const [items, total] = await Promise.all([
      builtQuery.query.exec(),
      SaleModel.countDocuments(builtQuery.query.getFilter()),
    ]);

    return {
      items,
      meta: buildPaginationMeta(
        builder.getPaginationInfo().page,
        builder.getPaginationInfo().limit,
        total,
      ),
    };
  },

  getById: async (id: string): Promise<ISale> => {
    const sale = await SaleModel.findById(id)
      .populate("customer", "name phone email")
      .populate("soldBy", "name email");
    if (!sale) throw ApiError.notFound("Sale not found");
    return sale;
  },

  // Bonus: refund restores product stock and reverses the customer's total
  refund: async (id: string): Promise<ISale> => {
    const sale = await SaleModel.findById(id);
    if (!sale) throw ApiError.notFound("Sale not found");
    if (sale.status === "refunded") {
      throw ApiError.badRequest("Sale has already been refunded");
    }

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        for (const item of sale.items) {
          await ProductModel.findByIdAndUpdate(
            item.product,
            { $inc: { stock: item.quantity } },
            { session },
          );
        }
        await CustomerModel.findByIdAndUpdate(
          sale.customer,
          { $inc: { totalPurchases: -sale.grandTotal } },
          { session },
        );
        sale.status = "refunded";
        await sale.save({ session });
      });
      return sale;
    } finally {
      await session.endSession();
    }
  },
};
