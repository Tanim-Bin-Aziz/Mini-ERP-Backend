import { Router } from "express";
import { ProductController } from "./product.controller";
import { validate } from "../../middlewares/validate.middleware";

import { isAuthenticated } from "../../middlewares/auth.middleware";
import { requirePermission } from "../../middlewares/permission.middleware";
import { productImageUpload } from "../../config/cloudinary";
import {
  adjustStockSchema,
  createProductSchema,
  productIdParamSchema,
  updateProductSchema,
} from "./product.validation";

const router = Router();

// All product routes require a valid access token
router.use(isAuthenticated);

router.get("/", requirePermission("product:read"), ProductController.getAll);

router.get(
  "/:id",
  requirePermission("product:read"),
  validate(productIdParamSchema),
  ProductController.getById,
);

router.post(
  "/",
  requirePermission("product:create"),
  productImageUpload.array("images", 5),
  validate(createProductSchema),
  ProductController.create,
);

router.patch(
  "/:id",
  requirePermission("product:update"),
  productImageUpload.array("images", 5),
  validate(updateProductSchema),
  ProductController.update,
);

router.patch(
  "/:id/stock",
  requirePermission("product:update"),
  validate(adjustStockSchema),
  ProductController.adjustStock,
);

router.patch(
  "/:id/restore",
  requirePermission("product:update"),
  validate(productIdParamSchema),
  ProductController.restore,
);

// Soft delete
router.delete(
  "/:id",
  requirePermission("product:delete"),
  validate(productIdParamSchema),
  ProductController.remove,
);

export default router;
