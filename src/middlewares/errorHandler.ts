import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

/**
 * Global Error Handler — Bonus Feature
 * Normalizes Mongoose, JWT, Multer, Zod and custom ApiErrors into one
 * consistent JSON response shape across the whole API.
 */
export const globalErrorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: unknown;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof Error) {
    // Mongoose duplicate key error
    if ((err as any).code === 11000) {
      statusCode = 409;
      const field = Object.keys((err as any).keyValue ?? {})[0] ?? 'field';
      message = `Duplicate value for '${field}'. Please use another value.`;
    }
    // Mongoose validation error
    else if (err.name === 'ValidationError') {
      statusCode = 400;
      message = 'Validation failed';
      errors = Object.values((err as any).errors ?? {}).map((e: any) => e.message);
    }
    // Mongoose invalid ObjectId
    else if (err.name === 'CastError') {
      statusCode = 400;
      message = `Invalid value for '${(err as any).path}'`;
    }
    // JWT errors
    else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Invalid or expired token';
    } else {
      message = err.message || message;
    }
  }

  console.error(`[Error] ${statusCode} - ${message}`, env.nodeEnv === 'development' ? err : '');

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
    ...(env.nodeEnv === 'development' && err instanceof Error ? { stack: err.stack } : {}),
  });
};

// 404 handler for unmatched routes
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};
