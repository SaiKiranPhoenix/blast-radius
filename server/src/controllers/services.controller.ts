import type { Request, Response } from 'express';
import { z } from 'zod';
import * as servicesService from '../services/services.service';
import { AppError } from '../utils/AppError';
import type { ApiSuccess } from '../types/api.types';

export const getServices = async (req: Request, res: Response) => {
  const { type, tier, teamId } = req.query;

  const filters: Record<string, string> = {};
  if (type) filters.type = type as string;
  if (tier) filters.tier = tier as string;
  if (teamId) filters.teamId = teamId as string;

  const services = await servicesService.getServices(filters);
  const response: ApiSuccess<{ services: typeof services; total: number }> = {
    success: true,
    data: {
      services,
      total: services.length,
    },
  };
  res.json(response);
};

export const getServiceById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const service = await servicesService.getServiceById(id);
  const response: ApiSuccess<typeof service> = {
    success: true,
    data: service,
  };
  res.json(response);
};

const blastRadiusQuerySchema = z.object({
  maxHops: z.coerce.number().int().min(1).max(10).default(5),
});

export const getBlastRadius = async (req: Request, res: Response) => {
  const { id } = req.params;
  const parseResult = blastRadiusQuerySchema.safeParse(req.query);
  if (!parseResult.success) {
    throw AppError.validationError('maxHops must be an integer between 1 and 10');
  }

  const { maxHops } = parseResult.data;
  const result = await servicesService.getBlastRadius(id, maxHops);
  const response: ApiSuccess<typeof result> = {
    success: true,
    data: result,
  };
  res.json(response);
};

export const getDependencies = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await servicesService.getDependencies(id);
  const response: ApiSuccess<typeof result> = {
    success: true,
    data: result,
  };
  res.json(response);
};
