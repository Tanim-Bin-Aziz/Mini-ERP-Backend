import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { ApiResponse } from '../../utils/ApiResponse';
import { AuthService } from './auth.service';
import { ApiError } from '../../utils/ApiError';

export const AuthController = {
  login: catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);
    res
      .status(200)
      .json(new ApiResponse(200, 'Login successful', result));
  }),

  refresh: catchAsync(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await AuthService.refresh(refreshToken);
    res.status(200).json(new ApiResponse(200, 'Token refreshed', result));
  }),

  logout: catchAsync(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    await AuthService.logout(req.user._id);
    res.status(200).json(new ApiResponse(200, 'Logged out successfully'));
  }),

  me: catchAsync(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const result = await AuthService.me(req.user._id);
    res.status(200).json(new ApiResponse(200, 'Current user fetched', result));
  }),
};
