import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { app } from '../../../src/app';

vi.mock('../../../src/services/graph.service', () => ({
  getLongestChain: vi.fn(),
}));

import * as graphService from '../../../src/services/graph.service';

describe('graph API routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/graph/longest-chain returns chain entries', async () => {
    vi.mocked(graphService.getLongestChain).mockResolvedValueOnce([
      { source: 'Mobile BFF', sink: 'Main Postgres', depth: 5 },
    ]);

    const response = await request(app).get('/api/graph/longest-chain').expect(200);

    expect(response.body).toEqual({
      success: true,
      data: {
        chains: [{ source: 'Mobile BFF', sink: 'Main Postgres', depth: 5 }],
      },
    });
  });
});
