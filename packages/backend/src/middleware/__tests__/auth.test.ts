import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { loginHandler, logoutHandler, authStatusHandler, requireAdmin } from '../auth.js';

const TEST_JWT_SECRET = 'test-jwt-secret';
const TEST_ADMIN_PIN = '4321';
const COOKIE_NAME = 'fk_auth_token';

function mockRequest(overrides: { body?: unknown; cookies?: Record<string, string> } = {}) {
  return {
    body: overrides.body ?? {},
    cookies: overrides.cookies ?? {},
  } as unknown as Request;
}

function mockResponse() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
    cookie: vi.fn(),
    clearCookie: vi.fn(),
  };
  // status() returns `this` in Express to allow chaining (e.g. res.status(401).json(...))
  res.status.mockReturnValue(res);
  return res as unknown as Response & {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
    cookie: ReturnType<typeof vi.fn>;
    clearCookie: ReturnType<typeof vi.fn>;
  };
}

beforeEach(() => {
  vi.stubEnv('JWT_SECRET', TEST_JWT_SECRET);
  vi.stubEnv('ADMIN_PIN', TEST_ADMIN_PIN);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('loginHandler', () => {
  it('returns 400 for a malformed PIN body', () => {
    const req = mockRequest({ body: { pin: 'abcd' } });
    const res = mockResponse();

    loginHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 401 for an incorrect PIN', () => {
    const req = mockRequest({ body: { pin: '0000' } });
    const res = mockResponse();

    loginHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('sets an auth cookie and returns success for the correct PIN', () => {
    const req = mockRequest({ body: { pin: TEST_ADMIN_PIN } });
    const res = mockResponse();

    loginHandler(req, res);

    expect(res.cookie).toHaveBeenCalledWith(
      COOKIE_NAME,
      expect.any(String),
      expect.objectContaining({ httpOnly: true }),
    );
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe('logoutHandler', () => {
  it('clears the auth cookie and returns success', () => {
    const req = mockRequest();
    const res = mockResponse();

    logoutHandler(req, res);

    expect(res.clearCookie).toHaveBeenCalledWith(COOKIE_NAME, { path: '/' });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});

describe('authStatusHandler', () => {
  it('reports unauthenticated when no cookie is present', () => {
    const req = mockRequest({ cookies: {} });
    const res = mockResponse();

    authStatusHandler(req, res);

    expect(res.json).toHaveBeenCalledWith({ authenticated: false });
  });

  it('reports authenticated for a valid token', () => {
    const token = jwt.sign({ role: 'admin' }, TEST_JWT_SECRET);
    const req = mockRequest({ cookies: { [COOKIE_NAME]: token } });
    const res = mockResponse();

    authStatusHandler(req, res);

    expect(res.json).toHaveBeenCalledWith({ authenticated: true });
  });

  it('reports unauthenticated for an invalid token', () => {
    const req = mockRequest({ cookies: { [COOKIE_NAME]: 'not-a-real-token' } });
    const res = mockResponse();

    authStatusHandler(req, res);

    expect(res.json).toHaveBeenCalledWith({ authenticated: false });
  });
});

describe('requireAdmin', () => {
  it('returns 401 when no cookie is present', () => {
    const req = mockRequest({ cookies: {} });
    const res = mockResponse();
    const next: NextFunction = vi.fn();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() and populates req.adminAuth for a valid token', () => {
    const token = jwt.sign({ role: 'admin' }, TEST_JWT_SECRET);
    const req = mockRequest({ cookies: { [COOKIE_NAME]: token } });
    const res = mockResponse();
    const next: NextFunction = vi.fn();

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.adminAuth).toMatchObject({ role: 'admin' });
  });

  it('clears the cookie and returns 401 for an invalid/expired token', () => {
    const req = mockRequest({ cookies: { [COOKIE_NAME]: 'not-a-real-token' } });
    const res = mockResponse();
    const next: NextFunction = vi.fn();

    requireAdmin(req, res, next);

    expect(res.clearCookie).toHaveBeenCalledWith(COOKIE_NAME, { path: '/' });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
