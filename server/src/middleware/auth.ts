import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { AppError } from './errorHandler';
import { StaffRole, TokenPayload } from '../services/authService';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authenticateToken = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers.cookie) {
    // Try extract from cookie
    const match = req.headers.cookie.match(/leaf_access_token=([^;]+)/);
    if (match) token = match[1];
  }

  if (!token) {
    return next(new AppError('Authentication required. Missing Bearer token.', 401, 'UNAUTHORIZED'));
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET, {
      algorithms: ['HS256'],
    }) as TokenPayload;

    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Access token has expired. Please refresh.', 401, 'TOKEN_EXPIRED'));
    }
    return next(new AppError('Invalid or corrupted authentication token.', 401, 'INVALID_TOKEN'));
  }
};

export const requireRoles = (...allowedRoles: StaffRole[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Forbidden: Role '${req.user.role}' lacks permission for this administrative resource. Allowed: ${allowedRoles.join(', ')}`,
          403,
          'FORBIDDEN'
        )
      );
    }

    next();
  };
};
