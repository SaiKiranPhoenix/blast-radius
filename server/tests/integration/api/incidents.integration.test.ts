import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { app } from '../../../src/app';
import { incidentAuth } from '../../fixtures/incidents.fixture';
import { AppError } from '../../../src/utils/AppError';

vi.mock('../../../src/services/incidents.service', () => ({
  getIncidents: vi.fn(),
  getIncidentById: vi.fn(),
}));

import * as incidentsService from '../../../src/services/incidents.service';

describe('incident API routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/incidents returns incidents with filters', async () => {
    vi.mocked(incidentsService.getIncidents).mockResolvedValueOnce([incidentAuth]);

    const response = await request(app)
      .get('/api/incidents?status=resolved&severity=SEV1')
      .expect(200);

    expect(incidentsService.getIncidents).toHaveBeenCalledWith({
      status: 'resolved',
      severity: 'SEV1',
    });
    expect(response.body.data.total).toBe(1);
  });

  it('GET /api/incidents/:id returns 404 when missing', async () => {
    vi.mocked(incidentsService.getIncidentById).mockRejectedValueOnce(
      AppError.notFound('incident', 'missing'),
    );

    const response = await request(app).get('/api/incidents/missing').expect(404);

    expect(response.body.error.code).toBe('INCIDENT_NOT_FOUND');
  });
});
