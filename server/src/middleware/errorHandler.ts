import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  statusCode: number;
  code?: string;
  details?: any;

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || (err instanceof ZodError ? 400 : 500);
  const message = err.message || 'Internal Server Error';
  const code = err.code || (err instanceof ZodError ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR');

  let details = err.details;
  if (err instanceof ZodError) {
    details = err.errors.map(e => ({
      path: e.path.join('.'),
      message: e.message,
    }));
  }

  // Avoid logging health checks or 404s as errors
  if (statusCode >= 500) {
    console.error(`[${new Date().toISOString()}] ❌ 500 Error on ${req.method} ${req.originalUrl}:`, err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
      ...(details ? { details } : {}),
    },
  });
};
