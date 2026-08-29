import type { Request, Response } from 'express';
import { z } from 'zod';
import { asyncWrapper } from '../middleware/asyncWrapper';
import { AppError } from '../utils/AppError';
import { getDemoUser, getUserByEmail, getMeData } from '../services/auth.service';
import type { UserRole } from '../types/auth.types';

const loginSchema = z.object({
  email: z.string().email('A valid email is required.'),
});

/**
 * POST /api/auth/login
 * Accepts { email } and creates a session for the matching demo user.
 */
export const login = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    throw AppError.validationError(parse.error.issues[0]?.message ?? 'Invalid request body.');
  }

  const result = await getUserByEmail(parse.data.email);
  if (!result) {
    throw AppError.validationError(
      'No demo user found for that email. Try sam@demo.blastradius.app.',
    );
  }

  req.session.userId = result.user.id;
  req.session.workspaceId = result.workspaceId;
  req.session.role = result.role;

  const me = await getMeData(result.user.id, result.workspaceId, result.role);
  res.status(200).json({ success: true, data: me });
});

/**
 * POST /api/auth/demo
 * Auto-signs in as the demo responder (sam@demo.blastradius.app).
 * Shortcut used by "Continue with demo workspace" CTA.
 */
export const loginDemo = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const result = await getDemoUser();
  if (!result) {
    throw AppError.notFound('Demo user', 'demo-oncall-eng');
  }

  req.session.userId = result.user.id;
  req.session.workspaceId = result.workspaceId;
  req.session.role = result.role;

  const me = await getMeData(result.user.id, result.workspaceId, result.role);
  res.status(200).json({ success: true, data: me });
});

/**
 * POST /api/auth/logout
 * Destroys the session.
 */
export const logout = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    req.session.destroy((err: unknown) => {
      if (err) reject(err);
      else resolve();
    });
  });
  res.clearCookie('connect.sid');
  res.status(200).json({ success: true, data: { message: 'Signed out.' } });
});

/**
 * GET /api/me
 * Returns current user, workspace, role, and feature flags.
 * Protected by requireAuth middleware.
 */
export const getMe = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { userId, workspaceId, role } = req.session;

  // requireAuth guarantees userId is set — these checks are type-safety guards
  if (!userId || !workspaceId || !role) {
    throw AppError.validationError('Session is incomplete. Please sign in again.');
  }

  const me = await getMeData(userId, workspaceId, role as UserRole);
  res.status(200).json({ success: true, data: me });
});
