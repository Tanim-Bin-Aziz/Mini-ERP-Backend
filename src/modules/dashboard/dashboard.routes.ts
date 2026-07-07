import { Router } from "express";
import { DashboardController } from "./dashboard.controller";
import { validate } from "../../middlewares/validate.middleware";
import { revenueTrendQuerySchema } from "./dashboard.validation";
import { isAuthenticated } from "../../middlewares/auth.middleware";
import { requirePermission } from "../../middlewares/permission.middleware";

const router = Router();

router.use(isAuthenticated);
router.use(requirePermission("dashboard:read"));

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get dashboard statistics
 *     description: Returns overall dashboard metrics such as total sales, revenue, customers and products.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/stats", DashboardController.getStats);

/**
 * @swagger
 * /dashboard/revenue-trend:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get revenue trend
 *     description: Returns revenue trend data for the specified number of days.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         required: false
 *         schema:
 *           type: number
 *           example: 14
 *         description: Number of days to analyze revenue trend
 *     responses:
 *       200:
 *         description: Revenue trend retrieved successfully
 *       400:
 *         description: Invalid query parameter
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/revenue-trend",
  validate(revenueTrendQuerySchema),
  DashboardController.getRevenueTrend,
);

export default router;
