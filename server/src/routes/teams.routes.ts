import { Router } from 'express';
import { getTeams, getTeamById } from '../controllers/teams.controller';
import { asyncWrapper } from '../middleware/asyncWrapper';

const router = Router();

router.get('/', asyncWrapper(getTeams));
router.get('/:id', asyncWrapper(getTeamById));

export default router;
