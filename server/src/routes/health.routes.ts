import { Router } from 'express';
import { getHealth } from '../controllers/health.controller';
import { asyncWrapper } from '../middleware/asyncWrapper';

const router = Router();

router.get('/', asyncWrapper(getHealth));

export default router;
