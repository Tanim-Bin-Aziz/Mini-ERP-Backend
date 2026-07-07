import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';
import { verifyAccessToken } from '../utils/jwt';
import { UserModel } from '../modules/user/user.model';
import { RoleModel } from '../modules/user/role.model';

/**
 * isAuthenticated:
 * - Reads Bearer token from Authorization header
 * - Verifies signature/expiry
 * - Confirms tokenVersion matches (so logout-all / password-change invalidates old tokens)
 * - Resolves the user's current permissions from the DB-driven Role collection
 */
export const isAuthenticated = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token missing or malformed');
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch {
      throw ApiError.unauthorized('Invalid or expired access token');
    }

    const user = await UserModel.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw ApiError.unauthorized('User no longer exists or is deactivated');
    }

    if (user.tokenVersion !== decoded.tokenVersion) {
      throw ApiError.unauthorized('Session expired, please log in again');
    }

    const role = await RoleModel.findOne({ name: user.role });
    if (!role) {
      throw ApiError.forbidden('Role no longer exists — contact an administrator');
    }

    req.user = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: role.permissions,
    };

    next();
  }
);
