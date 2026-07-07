import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { PermissionAction } from '../types';

/**
 * requirePermission — checks the resolved permissions attached by isAuthenticated.
 * Because permissions come from the DB (Role collection) rather than a hardcoded
 * switch statement, admins can change what a "Manager" or a custom role can do
 * at runtime without a code deploy.
 *
 * Usage: router.post('/products', isAuthenticated, requirePermission('product:create'), ctrl.create)
 */
export const requirePermission = (...allowed: PermissionAction[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    const hasPermission = allowed.some((perm) => req.user!.permissions.includes(perm));
    if (!hasPermission) {
      return next(
        ApiError.forbidden(`Requires one of: [${allowed.join(', ')}] permission`)
      );
    }

    next();
  };
};

// Convenience wrapper for simple role-name checks (e.g. Admin-only routes)
export const requireRole = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Requires role: [${roles.join(', ')}]`));
    }
    next();
  };
};
