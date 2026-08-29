import type { Request, Response, NextFunction } from 'express';

/**
 * Requires a valid session (set by POST /api/auth/login or /api/auth/demo).
 * Returns 401 if the session is missing or expired.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.userId) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHENTICATED',
        message: 'You must be signed in to access this resource.',
      },
    });
    return;
  }
  next();
}
