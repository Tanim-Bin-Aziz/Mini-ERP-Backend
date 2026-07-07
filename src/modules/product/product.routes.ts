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

router.use(isAuthenticated);

/**
 * @swagger
 * /products:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get all products
 *     description: Retrieve all products
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get("/", requirePermission("product:read"), ProductController.getAll);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get product by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get(
  "/:id",
  requirePermission("product:read"),
  validate(productIdParamSchema),
  ProductController.getById,
);

/**
 * @swagger
 * /products:
 *   post:
 *     tags:
 *       - Products
 *     summary: Create product
 *     description: Create a new product with optional images
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - sku
 *               - category
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: Samsung 4K TV
 *               sku:
 *                 type: string
 *                 example: TV-SAM-55
 *               category:
 *                 type: string
 *                 example: Electronics
 *               price:
 *                 type: number
 *                 example: 45000
 *               costPrice:
 *                 type: number
 *                 example: 40000
 *               stock:
 *                 type: number
 *                 example: 25
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Product created successfully
 */
router.post(
  "/",
  requirePermission("product:create"),
  productImageUpload.array("images", 5),
  validate(createProductSchema),
  ProductController.create,
);

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     tags:
 *       - Products
 *     summary: Update product
 *     description: Update existing product information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               sku:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *               costPrice:
 *                 type: number
 *               stock:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Product updated successfully
 */
router.patch(
  "/:id",
  requirePermission("product:update"),
  productImageUpload.array("images", 5),
  validate(updateProductSchema),
  ProductController.update,
);

/**
 * @swagger
 * /products/{id}/stock:
 *   patch:
 *     tags:
 *       - Products
 *     summary: Adjust product stock
 *     description: Increase or decrease product inventory
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *                 example: 5
 *               operation:
 *                 type: string
 *                 example: increase
 *     responses:
 *       200:
 *         description: Stock adjusted successfully
 */
router.patch(
  "/:id/stock",
  requirePermission("product:update"),
  validate(adjustStockSchema),
  ProductController.adjustStock,
);

/**
 * @swagger
 * /products/{id}/restore:
 *   patch:
 *     tags:
 *       - Products
 *     summary: Restore deleted product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product restored successfully
 */
router.patch(
  "/:id/restore",
  requirePermission("product:update"),
  validate(productIdParamSchema),
  ProductController.restore,
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     tags:
 *       - Products
 *     summary: Delete product
 *     description: Soft delete a product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 */
router.delete(
  "/:id",
  requirePermission("product:delete"),
  validate(productIdParamSchema),
  ProductController.remove,
);

export default router;
