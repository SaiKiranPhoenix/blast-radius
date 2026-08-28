import { Router } from 'express';
import { getServices, getServiceById, getBlastRadius, getDependencies } from '../controllers/services.controller';
import { asyncWrapper } from '../middleware/asyncWrapper';

const router = Router();

router.get('/', asyncWrapper(getServices));
router.get('/:id/blast-radius', asyncWrapper(getBlastRadius));
router.get('/:id/dependencies', asyncWrapper(getDependencies));
router.get('/:id', asyncWrapper(getServiceById));

export default router;
