import type { Request, Response } from 'express';
import * as graphService from '../services/graph.service';
import type { ApiSuccess } from '../types/api.types';

export const getLongestChain = async (_req: Request, res: Response) => {
  const chains = await graphService.getLongestChain();
  const response: ApiSuccess<{ chains: typeof chains }> = {
    success: true,
    data: {
      chains,
    },
  };
  res.json(response);
};
