import type { Request, Response } from 'express';
import * as incidentsService from '../services/incidents.service';
import type { ApiSuccess } from '../types/api.types';

export const getIncidents = async (req: Request, res: Response) => {
  const incidents = await incidentsService.getIncidents();
  const response: ApiSuccess<{ incidents: typeof incidents; total: number }> = {
    success: true,
    data: {
      incidents,
      total: incidents.length,
    }
  };
  res.json(response);
};

export const getIncidentById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const incident = await incidentsService.getIncidentById(id);
  const response: ApiSuccess<typeof incident> = {
    success: true,
    data: incident,
  };
  res.json(response);
};
