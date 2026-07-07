import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";
import { DashboardService } from "./dashboard.service";

export const DashboardController = {
  getStats: catchAsync(async (_req: Request, res: Response) => {
    const stats = await DashboardService.getStats();
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Dashboard statistics fetched successfully",
          stats,
        ),
      );
  }),

  getRevenueTrend: catchAsync(async (req: Request, res: Response) => {
    const days = req.query.days ? Number(req.query.days) : 7;
    const trend = await DashboardService.getRevenueTrend(days);
    res
      .status(200)
      .json(new ApiResponse(200, "Revenue trend fetched successfully", trend));
  }),
};
