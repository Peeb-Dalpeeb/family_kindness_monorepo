/**
 * JWT Authentication Middleware
 *
 * Production-ready auth flow:
 * 1. Frontend sends 4-digit PIN to POST /api/auth/login
 * 2. Backend validates PIN against server-side ADMIN_PIN env var
 * 3. On success, backend issues a signed JWT stored in an HttpOnly cookie
 * 4. Protected routes use requireAdmin() middleware to verify the JWT
 *
 * Security decisions:
 * - JWT stored in HttpOnly, Secure, SameSite=Strict cookie (not accessible via JS)
 * - Token payload contains only role claim (no sensitive data)
 * - ADMIN_PIN is never sent to or stored on the frontend
 */

import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AdminPinSchema } from '@family-kindness/shared';

// ── Environment Configuration ────────────────────────────────

function getJwtSecret(): string {
  const secret = process.env['JWT_SECRET'];
  if (!secret || secret === 'CHANGE_ME_TO_A_STRONG_RANDOM_SECRET') {
    throw new Error(
      '[auth] JWT_SECRET is not configured. Generate one with:\n' +
        "  node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"",
    );
  }
  return secret;
}

/** Returns JWT expiry in seconds. Parses env JWT_EXPIRY (e.g. '2h', '7d'). */
function getJwtExpirySeconds(): number {
  const expiry = process.env['JWT_EXPIRY'] ?? '2h';
  const match = /^(\d+)([smhd])$/.exec(expiry);
  if (!match) return 7200; // default 2h
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 3600;
    case 'd':
      return value * 86400;
    default:
      return 7200;
  }
}

function getAdminPin(): string {
  const pin = process.env['ADMIN_PIN'];
  if (!pin) {
    throw new Error('[auth] ADMIN_PIN is not configured in environment variables.');
  }
  return pin;
}

// ── JWT Token Payload ────────────────────────────────────────

interface JwtPayload {
  role: 'admin';
  iat?: number;
  exp?: number;
}

// ── Cookie Configuration ─────────────────────────────────────

const COOKIE_NAME = 'fk_auth_token';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env['NODE_ENV'] === 'production',
  sameSite: 'strict' as const,
  maxAge: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
  path: '/',
};

// ── Extend Express Request ───────────────────────────────────

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Populated by requireAdmin middleware when JWT is valid. */
      adminAuth?: JwtPayload;
    }
  }
}

// ── Login Handler ────────────────────────────────────────────

/**
 * POST /api/auth/login
 *
 * Accepts { pin: "1234" } and returns an HttpOnly JWT cookie
 * if the PIN matches the server-side ADMIN_PIN.
 */
export function loginHandler(req: Request, res: Response): void {
  const parsed = AdminPinSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: 'Invalid PIN format.',
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  if (parsed.data.pin !== getAdminPin()) {
    res.status(401).json({
      success: false,
      message: 'Invalid PIN code.',
    });
    return;
  }

  const token = jwt.sign({ role: 'admin' } satisfies JwtPayload, getJwtSecret(), {
    expiresIn: getJwtExpirySeconds(),
  });

  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

  res.json({
    success: true,
    message: 'Authentication successful.',
  });
}

// ── Logout Handler ───────────────────────────────────────────

/**
 * POST /api/auth/logout
 *
 * Clears the authentication cookie.
 */
export function logoutHandler(_req: Request, res: Response): void {
  res.clearCookie(COOKIE_NAME, { path: '/' });
  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
}

// ── Auth Status Handler ──────────────────────────────────────

/**
 * GET /api/auth/status
 *
 * Returns whether the current request has a valid admin session.
 * Does not require authentication — returns { authenticated: false }
 * if no valid token is present.
 */
export function authStatusHandler(req: Request, res: Response): void {
  const token = (req.cookies as Record<string, string | undefined>)[COOKIE_NAME];

  if (!token) {
    res.json({ authenticated: false });
    return;
  }

  try {
    jwt.verify(token, getJwtSecret());
    res.json({ authenticated: true });
  } catch {
    res.json({ authenticated: false });
  }
}

// ── Middleware: Require Admin ─────────────────────────────────

/**
 * Express middleware that protects admin-only routes.
 *
 * Reads the JWT from the HttpOnly cookie, verifies it,
 * and attaches the decoded payload to req.adminAuth.
 *
 * Returns 401 if the token is missing, expired, or invalid.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = (req.cookies as Record<string, string | undefined>)[COOKIE_NAME];

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
    req.adminAuth = decoded;
    next();
  } catch {
    res.clearCookie(COOKIE_NAME, { path: '/' });
    res.status(401).json({
      success: false,
      message: 'Session expired or invalid. Please log in again.',
    });
  }
}
