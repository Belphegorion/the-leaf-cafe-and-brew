import { Request, Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/authService';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const loginSchema = z.object({
  email: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const login = (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError('Invalid credentials format', 400, 'VALIDATION_ERROR', parsed.error.format());
  }

  const { email, password } = parsed.data;
  const result = authService.authenticate(email, password);

  // Set httpOnly cookie for web security
  res.cookie('leaf_access_token', result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 mins
  });

  res.json({
    success: true,
    message: `Welcome back, ${result.user.name}`,
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
  });
};

export const refresh = (req: Request, res: Response) => {
  const token = req.body?.refreshToken || req.headers['x-refresh-token'];
  const parsed = refreshSchema.safeParse({ refreshToken: token });
  if (!parsed.success) {
    throw new AppError('Missing refresh token', 400, 'VALIDATION_ERROR');
  }

  const result = authService.refreshAccessToken(parsed.data.refreshToken);

  res.cookie('leaf_access_token', result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
  });

  res.json({
    success: true,
    data: {
      accessToken: result.accessToken,
      refreshToken: result.newRefreshToken,
    },
  });
};

export const logout = (req: Request, res: Response) => {
  const token = req.body?.refreshToken;
  if (token) {
    authService.revokeRefreshToken(token);
  }

  res.clearCookie('leaf_access_token');
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};

export const getMe = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  }
  const user = authService.getUserById(req.user.userId);
  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }
  res.json({
    success: true,
    data: user,
  });
};
