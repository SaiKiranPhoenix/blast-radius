import session from 'express-session';
import { env } from '../config/env';

/**
 * Express-session middleware.
 *
 * v1 uses the default MemoryStore — acceptable for a single-instance demo.
 * Upgrade path: swap MemoryStore for connect-redis when multi-instance is needed.
 */
export const sessionMiddleware = session({
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: env.SESSION_MAX_AGE_MS,
  },
});
