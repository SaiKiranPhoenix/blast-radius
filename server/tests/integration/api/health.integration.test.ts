import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { app } from '../../../src/app';

const verifyConnectivity = vi.fn();

vi.mock('../../../src/config/neo4j', () => ({
  getDriver: vi.fn(() => ({ verifyConnectivity })),
}));

describe('GET /health', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns ok when database connectivity succeeds', async () => {
    verifyConnectivity.mockResolvedValueOnce(undefined);

    const response = await request(app).get('/health').expect(200);

    expect(response.body.status).toBe('ok');
    expect(response.body.database.connected).toBe(true);
  });

  it('returns degraded with HTTP 200 when database connectivity fails', async () => {
    verifyConnectivity.mockRejectedValueOnce(new Error('offline'));

    const response = await request(app).get('/health').expect(200);

    expect(response.body.status).toBe('degraded');
    expect(response.body.database.connected).toBe(false);
  });
});
