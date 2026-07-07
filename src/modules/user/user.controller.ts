import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { ApiResponse } from '../../utils/ApiResponse';
import { UserService } from './user.service';

export const UserController = {
  create: catchAsync(async (req: Request, res: Response) => {
    const user = await UserService.create(req.body);
    const { password: _password, ...safeUser } = user.toObject();
    res.status(201).json(new ApiResponse(201, 'User created successfully', safeUser));
  }),

  getAll: catchAsync(async (_req: Request, res: Response) => {
    const users = await UserService.getAll();
    res.status(200).json(new ApiResponse(200, 'Users fetched successfully', users));
  }),

  getById: catchAsync(async (req: Request, res: Response) => {
    const user = await UserService.getById(req.params.id);
    res.status(200).json(new ApiResponse(200, 'User fetched successfully', user));
  }),

  update: catchAsync(async (req: Request, res: Response) => {
    const user = await UserService.update(req.params.id, req.body);
    res.status(200).json(new ApiResponse(200, 'User updated successfully', user));
  }),

  deactivate: catchAsync(async (req: Request, res: Response) => {
    await UserService.deactivate(req.params.id);
    res.status(200).json(new ApiResponse(200, 'User deactivated successfully'));
  }),
};
