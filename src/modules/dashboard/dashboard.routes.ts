import { Router } from "express";
import { DashboardController } from "./dashboard.controller";
import { validate } from "../../middlewares/validate.middleware";
import { revenueTrendQuerySchema } from "./dashboard.validation";
import { isAuthenticated } from "../../middlewares/auth.middleware";
import { requirePermission } from "../../middlewares/permission.middleware";

const router = Router();

// All dashboard routes require authentication + dashboard:read permission
// (Admin & Manager have it by default — see DEFAULT_ROLE_PERMISSIONS)
router.use(isAuthenticated);
router.use(requirePermission("dashboard:read"));

router.get("/stats", DashboardController.getStats);

// Bonus: revenue-by-day trend, e.g. GET /dashboard/revenue-trend?days=14
router.get(
  "/revenue-trend",
  validate(revenueTrendQuerySchema),
  DashboardController.getRevenueTrend,
);

export default router;
