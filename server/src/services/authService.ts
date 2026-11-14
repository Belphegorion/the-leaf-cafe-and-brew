import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { AppError } from '../middleware/errorHandler';

export type StaffRole = 'owner' | 'manager' | 'kitchen' | 'waiter';

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  passwordHash: string;
  salt: string;
  failedAttempts: number;
  lockoutUntil?: number;
}

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: StaffRole;
}

class AuthService {
  private users: Map<string, StaffUser> = new Map();
  private activeRefreshTokens: Set<string> = new Set();

  constructor() {
    this.seedDefaultUsers();
  }

  private hashPassword(password: string, salt: string): string {
    return crypto.scryptSync(password, salt, 64).toString('hex');
  }

  private seedDefaultUsers() {
    const defaultStaff = [
      { id: 'staff_1', name: 'Kabir Verma (Owner)', email: 'owner@theleaf.cafe', password: 'Leaf@Owner2026', role: 'owner' as StaffRole },
      { id: 'staff_2', name: 'Ananya Sharma (General Manager)', email: 'manager@theleaf.cafe', password: 'Leaf@Mgr2026', role: 'manager' as StaffRole },
      { id: 'staff_3', name: 'Chef Rakesh (Head Barista & KDS)', email: 'kitchen@theleaf.cafe', password: 'Leaf@Kds2026', role: 'kitchen' as StaffRole },
      { id: 'staff_4', name: 'Vikas Kumar (Floor Steward)', email: 'waiter@theleaf.cafe', password: 'Leaf@Floor2026', role: 'waiter' as StaffRole },
    ];

    for (const u of defaultStaff) {
      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = this.hashPassword(u.password, salt);
      this.users.set(u.email.toLowerCase(), {
        id: u.id,
        name: u.name,
        email: u.email.toLowerCase(),
        role: u.role,
        passwordHash,
        salt,
        failedAttempts: 0,
      });
    }
  }

  authenticate(identifier: string, password: string): { user: Omit<StaffUser, 'passwordHash' | 'salt'>; accessToken: string; refreshToken: string } {
    const key = identifier.toLowerCase().trim();
    // Allow lookup by role shorthand (e.g. "owner", "manager", "kitchen", "waiter") or email
    let user = this.users.get(key);
    if (!user) {
      for (const u of this.users.values()) {
        if (u.role === key || u.email.startsWith(key)) {
          user = u;
          break;
        }
      }
    }

    if (!user) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Check lockout
    const now = Date.now();
    if (user.lockoutUntil && user.lockoutUntil > now) {
      const waitMins = Math.ceil((user.lockoutUntil - now) / 60000);
      throw new AppError(`Account temporarily locked due to repeated failed logins. Please retry in ${waitMins} minute(s).`, 429, 'ACCOUNT_LOCKED');
    }

    const testHash = this.hashPassword(password, user.salt);
    const hashBuf = Buffer.from(user.passwordHash, 'hex');
    const testBuf = Buffer.from(testHash, 'hex');

    if (hashBuf.length !== testBuf.length || !crypto.timingSafeEqual(hashBuf, testBuf)) {
      user.failedAttempts += 1;
      if (user.failedAttempts >= 5) {
        user.lockoutUntil = now + 15 * 60 * 1000; // 15 mins
        user.failedAttempts = 0;
      }
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Reset failed attempts on success
    user.failedAttempts = 0;
    user.lockoutUntil = undefined;

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, ENV.JWT_SECRET, {
      expiresIn: '15m',
      algorithm: 'HS256',
    });

    const refreshToken = jwt.sign({ userId: user.id, tokenType: 'refresh' }, ENV.REFRESH_TOKEN_SECRET, {
      expiresIn: '7d',
      algorithm: 'HS256',
    });

    this.activeRefreshTokens.add(refreshToken);

    const { passwordHash: _, salt: __, ...safeUser } = user;
    return { user: safeUser, accessToken, refreshToken };
  }

  refreshAccessToken(refreshToken: string): { accessToken: string; newRefreshToken: string } {
    if (!this.activeRefreshTokens.has(refreshToken)) {
      throw new AppError('Refresh token revoked or invalid', 401, 'INVALID_TOKEN');
    }

    try {
      const decoded = jwt.verify(refreshToken, ENV.REFRESH_TOKEN_SECRET, { algorithms: ['HS256'] }) as { userId: string };
      let user: StaffUser | undefined;
      for (const u of this.users.values()) {
        if (u.id === decoded.userId) {
          user = u;
          break;
        }
      }

      if (!user) {
        throw new AppError('User not found', 401, 'USER_NOT_FOUND');
      }

      // Rotate refresh token
      this.activeRefreshTokens.delete(refreshToken);

      const payload: TokenPayload = {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };

      const newAccessToken = jwt.sign(payload, ENV.JWT_SECRET, {
        expiresIn: '15m',
        algorithm: 'HS256',
      });

      const newRefreshToken = jwt.sign({ userId: user.id, tokenType: 'refresh' }, ENV.REFRESH_TOKEN_SECRET, {
        expiresIn: '7d',
        algorithm: 'HS256',
      });

      this.activeRefreshTokens.add(newRefreshToken);

      return { accessToken: newAccessToken, newRefreshToken };
    } catch (err: any) {
      this.activeRefreshTokens.delete(refreshToken);
      throw new AppError('Invalid or expired refresh token', 401, 'INVALID_TOKEN');
    }
  }

  revokeRefreshToken(refreshToken: string) {
    this.activeRefreshTokens.delete(refreshToken);
  }

  getUserById(id: string): Omit<StaffUser, 'passwordHash' | 'salt'> | undefined {
    for (const u of this.users.values()) {
      if (u.id === id) {
        const { passwordHash: _, salt: __, ...safeUser } = u;
        return safeUser;
      }
    }
    return undefined;
  }
}

export const authService = new AuthService();
