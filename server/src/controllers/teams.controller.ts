import type { Request, Response } from 'express';
import * as teamsService from '../services/teams.service';
import type { ApiSuccess } from '../types/api.types';

export const getTeams = async (_req: Request, res: Response) => {
  const teams = await teamsService.getTeams();
  const response: ApiSuccess<{ teams: typeof teams; total: number }> = {
    success: true,
    data: {
      teams,
      total: teams.length,
    },
  };
  res.json(response);
};

export const getTeamById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const team = await teamsService.getTeamById(id);
  const response: ApiSuccess<typeof team> = {
    success: true,
    data: team,
  };
  res.json(response);
};
