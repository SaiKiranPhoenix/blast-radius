import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { app } from '../../../src/app';
import { teamPlatformWithCounts } from '../../fixtures/teams.fixture';
import { AppError } from '../../../src/utils/AppError';

vi.mock('../../../src/services/teams.service', () => ({
  getTeams: vi.fn(),
  getTeamById: vi.fn(),
}));

import * as teamsService from '../../../src/services/teams.service';

describe('team API routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/teams returns teams', async () => {
    vi.mocked(teamsService.getTeams).mockResolvedValueOnce([teamPlatformWithCounts]);

    const response = await request(app).get('/api/teams').expect(200);

    expect(response.body.data.total).toBe(1);
    expect(response.body.data.teams[0].id).toBe('team-platform');
  });

  it('GET /api/teams/:id returns 404 when missing', async () => {
    vi.mocked(teamsService.getTeamById).mockRejectedValueOnce(
      AppError.notFound('team', 'missing'),
    );

    const response = await request(app).get('/api/teams/missing').expect(404);

    expect(response.body.error.code).toBe('TEAM_NOT_FOUND');
  });
});
