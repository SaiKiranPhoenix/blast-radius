import { Router } from 'express';
import { login, loginDemo, logout } from '../controllers/auth.controller';

const router = Router();

// POST /api/auth/login — sign in by email (matches seeded demo user)
router.post('/login', login);

// POST /api/auth/demo — auto-sign in as demo responder (no email required)
router.post('/demo', loginDemo);

// POST /api/auth/logout — destroy session
router.post('/logout', logout);

export default router;
