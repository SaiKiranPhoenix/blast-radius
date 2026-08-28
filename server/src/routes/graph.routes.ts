import { Router } from 'express';
import { getLongestChain } from '../controllers/graph.controller';
import { asyncWrapper } from '../middleware/asyncWrapper';

const router = Router();

router.get('/longest-chain', asyncWrapper(getLongestChain));

export default router;
