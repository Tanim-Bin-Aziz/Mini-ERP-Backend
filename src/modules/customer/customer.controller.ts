import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { ApiResponse } from '../../utils/ApiResponse';
import { CustomerService } from './customer.service';

export const CustomerController = {
  create: catchAsync(async (req: Request, res: Response) => {
    const customer = await CustomerService.create(req.body, req.user!._id);
    res.status(201).json(new ApiResponse(201, 'Customer created successfully', customer));
  }),

  getAll: catchAsync(async (req: Request, res: Response) => {
    const { items, meta } = await CustomerService.getAll(
      req.query as Record<string, unknown>
    );
    res
      .status(200)
      .json(new ApiResponse(200, 'Customers fetched successfully', items, meta));
  }),

  getById: catchAsync(async (req: Request, res: Response) => {
    const customer = await CustomerService.getById(req.params.id);
    res.status(200).json(new ApiResponse(200, 'Customer fetched successfully', customer));
  }),

  update: catchAsync(async (req: Request, res: Response) => {
    const customer = await CustomerService.update(req.params.id, req.body);
    res.status(200).json(new ApiResponse(200, 'Customer updated successfully', customer));
  }),

  remove: catchAsync(async (req: Request, res: Response) => {
    await CustomerService.remove(req.params.id);
    res.status(200).json(new ApiResponse(200, 'Customer deactivated successfully'));
  }),

  restore: catchAsync(async (req: Request, res: Response) => {
    const customer = await CustomerService.restore(req.params.id);
    res.status(200).json(new ApiResponse(200, 'Customer restored successfully', customer));
  }),
};
