// ============================================================
// AUTH ROUTES — Register, Login, Refresh Token, Logout
// ============================================================

import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@luxecart/database';
import { loginSchema, registerSchema } from '@luxecart/shared';
import { validate } from '../middleware/validate';
import { authenticate, JwtPayload } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const authRouter = Router();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-in-production-abc123xyz';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production-def456uvw';
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

function generateTokens(user: { id: string; email: string; role: string }) {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRY as any,
  });

  const refreshToken = jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRY as any,
  });

  return { accessToken, refreshToken };
}

// ── Register ────────────────────────────────────────────────

authRouter.post('/register', validate(registerSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError(409, 'Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: 'CUSTOMER',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = generateTokens(user);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    res.status(201).json({
      success: true,
      data: { user, ...tokens },
      message: 'Registration successful',
    });
  } catch (error) {
    next(error);
  }
});

// ── Login ───────────────────────────────────────────────────

authRouter.post('/login', validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    if (user.isBlocked) {
      throw new AppError(403, 'Your account has been blocked. Please contact support.');
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Update last active
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    // Generate tokens
    const tokens = generateTokens(user);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: { user: userWithoutPassword, ...tokens },
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
});

// ── Refresh Token ───────────────────────────────────────────

authRouter.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError(400, 'Refresh token required');
    }

    // Verify token
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as JwtPayload;

    // Check if stored
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new AppError(401, 'Invalid or expired refresh token');
    }

    // Delete old token
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    // Generate new tokens
    const tokens = generateTokens(storedToken.user);

    // Store new refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: storedToken.userId,
        expiresAt,
      },
    });

    res.json({
      success: true,
      data: tokens,
    });
  } catch (error) {
    next(error);
  }
});

// ── Logout ──────────────────────────────────────────────────

authRouter.post('/logout', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

// ── Get Current User ────────────────────────────────────────

authRouter.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});
