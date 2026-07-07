import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { ApiResponse } from '../../utils/ApiResponse';
import { SaleService } from './sale.service';

export const SaleController = {
  create: catchAsync(async (req: Request, res: Response) => {
    const sale = await SaleService.create(req.body, req.user!._id);
    res.status(201).json(new ApiResponse(201, 'Sale created successfully', sale));
  }),

  getAll: catchAsync(async (req: Request, res: Response) => {
    const { items, meta } = await SaleService.getAll(req.query as Record<string, unknown>);
    res.status(200).json(new ApiResponse(200, 'Sales fetched successfully', items, meta));
  }),

  getById: catchAsync(async (req: Request, res: Response) => {
    const sale = await SaleService.getById(req.params.id);
    res.status(200).json(new ApiResponse(200, 'Sale fetched successfully', sale));
  }),

  refund: catchAsync(async (req: Request, res: Response) => {
    const sale = await SaleService.refund(req.params.id);
    res.status(200).json(new ApiResponse(200, 'Sale refunded successfully', sale));
  }),
};
