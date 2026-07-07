import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";

// Product, customer, sale, dashboard routers will be added here in the next milestones:
import productRoutes from "../modules/product/product.routes";
import customerRoutes from "../modules/customer/customer.routes";
import saleRoutes from "../modules/sale/sale.routes";
import dashboardRoutes from "../modules/dashboard/dashboard.routes";
import userRoutes from "../modules/user/user.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/customers", customerRoutes);
router.use("/sales", saleRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/users", userRoutes);

export default router;
