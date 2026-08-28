import { Router } from 'express';
import { getIncidents, getIncidentById } from '../controllers/incidents.controller';
import { asyncWrapper } from '../middleware/asyncWrapper';

const router = Router();

router.get('/', asyncWrapper(getIncidents));
router.get('/:id', asyncWrapper(getIncidentById));

export default router;
