import { Router } from "express";
import { CustomerController } from "./customer.controller";
import { validate } from "../../middlewares/validate.middleware";
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerIdParamSchema,
} from "./customer.validation";
import { isAuthenticated } from "../../middlewares/auth.middleware";
import { requirePermission } from "../../middlewares/permission.middleware";

const router = Router();

router.use(isAuthenticated);

/**
 * @swagger
 * /customers:
 *   get:
 *     tags:
 *       - Customers
 *     summary: Get all customers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customers retrieved successfully
 */
router.get("/", requirePermission("customer:read"), CustomerController.getAll);

/**
 * @swagger
 * /customers/{id}:
 *   get:
 *     tags:
 *       - Customers
 *     summary: Get customer by ID
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
 *         description: Customer found
 *       404:
 *         description: Customer not found
 */
router.get(
  "/:id",
  requirePermission("customer:read"),
  validate(customerIdParamSchema),
  CustomerController.getById,
);

/**
 * @swagger
 * /customers:
 *   post:
 *     tags:
 *       - Customers
 *     summary: Create customer
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       201:
 *         description: Customer created successfully
 */
router.post(
  "/",
  requirePermission("customer:create"),
  validate(createCustomerSchema),
  CustomerController.create,
);

/**
 * @swagger
 * /customers/{id}:
 *   patch:
 *     tags:
 *       - Customers
 *     summary: Update customer
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
 *         description: Customer updated successfully
 */
router.patch(
  "/:id",
  requirePermission("customer:update"),
  validate(updateCustomerSchema),
  CustomerController.update,
);

/**
 * @swagger
 * /customers/{id}/restore:
 *   patch:
 *     tags:
 *       - Customers
 *     summary: Restore deleted customer
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
 *         description: Customer restored successfully
 */
router.patch(
  "/:id/restore",
  requirePermission("customer:update"),
  validate(customerIdParamSchema),
  CustomerController.restore,
);

/**
 * @swagger
 * /customers/{id}:
 *   delete:
 *     tags:
 *       - Customers
 *     summary: Delete customer
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
 *         description: Customer deleted successfully
 */
router.delete(
  "/:id",
  requirePermission("customer:delete"),
  validate(customerIdParamSchema),
  CustomerController.remove,
);

export default router;
