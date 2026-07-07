import { Router } from "express";
import { SaleController } from "./sale.controller";
import { validate } from "../../middlewares/validate.middleware";
import { createSaleSchema, saleIdParamSchema } from "./sale.validation";
import { isAuthenticated } from "../../middlewares/auth.middleware";
import { requirePermission } from "../../middlewares/permission.middleware";

const router = Router();

router.use(isAuthenticated);

/**
 * @swagger
 * /sales:
 *   get:
 *     tags:
 *       - Sales
 *     summary: Get all sales
 *     description: Retrieve all sales records
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sales retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", requirePermission("sale:read"), SaleController.getAll);

/**
 * @swagger
 * /sales/{id}:
 *   get:
 *     tags:
 *       - Sales
 *     summary: Get sale by ID
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
 *         description: Sale retrieved successfully
 *       404:
 *         description: Sale not found
 */
router.get(
  "/:id",
  requirePermission("sale:read"),
  validate(saleIdParamSchema),
  SaleController.getById,
);

/**
 * @swagger
 * /sales:
 *   post:
 *     tags:
 *       - Sales
 *     summary: Create sale
 *     description: Create a new sales transaction
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerId:
 *                 type: string
 *                 example: 6868f2f5a123456789abcdef
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     unitPrice:
 *                       type: number
 *               paymentMethod:
 *                 type: string
 *                 example: cash
 *     responses:
 *       201:
 *         description: Sale created successfully
 *       400:
 *         description: Validation error
 */
router.post(
  "/",
  requirePermission("sale:create"),
  validate(createSaleSchema),
  SaleController.create,
);

/**
 * @swagger
 * /sales/{id}/refund:
 *   patch:
 *     tags:
 *       - Sales
 *     summary: Refund sale
 *     description: Refund a completed sale and restore stock
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
 *         description: Sale refunded successfully
 *       404:
 *         description: Sale not found
 *       400:
 *         description: Sale already refunded
 */
router.patch(
  "/:id/refund",
  requirePermission("sale:create"),
  validate(saleIdParamSchema),
  SaleController.refund,
);

export default router;
