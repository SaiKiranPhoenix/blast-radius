import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { app } from '../../../src/app';
import { serviceAuth } from '../../fixtures/services.fixture';

vi.mock('../../../src/services/services.service', () => ({
  getServices: vi.fn(),
  getServiceById: vi.fn(),
  getBlastRadius: vi.fn(),
  getDependencies: vi.fn(),
}));

import * as servicesService from '../../../src/services/services.service';
import { AppError } from '../../../src/utils/AppError';

describe('service API routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/services returns services in an envelope', async () => {
    vi.mocked(servicesService.getServices).mockResolvedValueOnce([serviceAuth]);

    const response = await request(app).get('/api/services').expect(200);

    expect(response.body).toEqual({
      success: true,
      data: {
        services: [serviceAuth],
        total: 1,
      },
    });
  });

  it('GET /api/services/:id returns a service by id', async () => {
    vi.mocked(servicesService.getServiceById).mockResolvedValueOnce(serviceAuth);

    const response = await request(app).get('/api/services/svc-auth').expect(200);

    expect(response.body.data).toEqual(serviceAuth);
  });

  it('GET /api/services/:id returns 404 for missing services', async () => {
    vi.mocked(servicesService.getServiceById).mockRejectedValueOnce(
      AppError.notFound('service', 'missing'),
    );

    const response = await request(app).get('/api/services/missing').expect(404);

    expect(response.body.error.code).toBe('SERVICE_NOT_FOUND');
  });

  it('GET /api/services/:id/blast-radius reaches the blast radius handler', async () => {
    vi.mocked(servicesService.getBlastRadius).mockResolvedValueOnce({
      rootService: serviceAuth,
      hops: [],
      totalAffected: 0,
      teamsToPage: [],
      historicalIncidents: [],
    });

    await request(app).get('/api/services/svc-auth/blast-radius').expect(200);

    expect(servicesService.getBlastRadius).toHaveBeenCalledWith('svc-auth', 5);
  });

  it('GET /api/services/:id/dependencies returns dependencies', async () => {
    vi.mocked(servicesService.getDependencies).mockResolvedValueOnce({
      service: serviceAuth,
      upstream: [],
      downstream: [],
      team: serviceAuth.team,
      incidents: [],
    });

    const response = await request(app).get('/api/services/svc-auth/dependencies').expect(200);

    expect(response.body.data.service.id).toBe('svc-auth');
  });
});
