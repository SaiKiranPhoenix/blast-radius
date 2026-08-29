import { beforeEach, describe, expect, it, vi } from 'vitest';
import { serviceAuth, serviceGateway, servicePostgres } from '../../fixtures/services.fixture';
import { teamIdentity, teamPlatform } from '../../fixtures/teams.fixture';
import {
  createMockDriver,
  createMockNode,
  createMockRecord,
  createMockSession,
} from '../__mocks__/neo4j';
import type { AppError } from '../../../src/utils/AppError';

vi.mock('../../../src/config/neo4j', () => ({
  getDriver: vi.fn(),
}));

import { getDriver } from '../../../src/config/neo4j';
import {
  getBlastRadius,
  getDependencies,
  getServiceById,
  getServices,
} from '../../../src/services/services.service';

const mockGetDriver = vi.mocked(getDriver);

describe('services.service', () => {
  let session: ReturnType<typeof createMockSession>;

  beforeEach(() => {
    vi.clearAllMocks();
    session = createMockSession();
    mockGetDriver.mockReturnValue(createMockDriver(session) as never);
  });

  it('returns an empty array when no services exist', async () => {
    session.run.mockResolvedValueOnce({ records: [] });

    await expect(getServices()).resolves.toEqual([]);
    expect(session.close).toHaveBeenCalledOnce();
  });

  it('maps services with counts and team details', async () => {
    session.run.mockResolvedValueOnce({
      records: [
        createMockRecord({
          s: createMockNode(serviceAuth),
          team: createMockNode(teamIdentity),
          dependencyCount: 2,
          dependentCount: 18,
        }),
      ],
    });

    await expect(getServices({ tier: 'critical' })).resolves.toEqual([serviceAuth]);
  });

  it('returns a service by id', async () => {
    session.run.mockResolvedValueOnce({
      records: [
        createMockRecord({
          s: createMockNode(serviceGateway),
          team: createMockNode(teamPlatform),
          dependencyCount: 4,
          dependentCount: 0,
        }),
      ],
    });

    await expect(getServiceById('svc-api-gateway')).resolves.toEqual(serviceGateway);
  });

  it('throws SERVICE_NOT_FOUND when no service is returned', async () => {
    session.run.mockResolvedValueOnce({ records: [] });

    await expect(getServiceById('missing')).rejects.toMatchObject({
      code: 'SERVICE_NOT_FOUND',
      statusCode: 404,
    } satisfies Partial<AppError>);
  });

  it('groups blast radius results by hop and includes teams and incidents', async () => {
    session.run
      .mockResolvedValueOnce({
        records: [
          createMockRecord({
            s: createMockNode(serviceAuth),
            team: createMockNode(teamIdentity),
            dependencyCount: 2,
            dependentCount: 18,
          }),
        ],
      })
      .mockResolvedValueOnce({
        records: [
          createMockRecord({ affected: createMockNode(serviceGateway), hops: 1 }),
          createMockRecord({ affected: createMockNode(servicePostgres), hops: 2 }),
        ],
      })
      .mockResolvedValueOnce({
        records: [
          createMockRecord({
            team: createMockNode(teamPlatform),
            affectedServices: ['API Gateway', 'Main Postgres'],
          }),
        ],
      })
      .mockResolvedValueOnce({
        records: [
          createMockRecord({
            i: createMockNode({
              id: 'inc-001',
              title: 'Auth Service Outage',
              severity: 'SEV1',
              status: 'resolved',
              started_at: '2024-09-12T02:14:00.000Z',
              resolved_at: '2024-09-12T04:47:00.000Z',
              description: 'Token validation failed.',
            }),
            affectedServices: ['API Gateway'],
          }),
        ],
      });

    const result = await getBlastRadius('svc-auth');

    expect(result.totalAffected).toBe(2);
    expect(result.hops).toEqual([
      { hop: 1, services: [serviceGateway] },
      { hop: 2, services: [servicePostgres] },
    ]);
    expect(result.teamsToPage[0]?.team).toEqual(teamPlatform);
    expect(result.historicalIncidents[0]?.affectedServiceCount).toBe(1);
  });

  it('returns dependencies with upstream, downstream, team, and incidents', async () => {
    session.run
      .mockResolvedValueOnce({
        records: [
          createMockRecord({
            s: createMockNode(serviceAuth),
            team: createMockNode(teamIdentity),
            upstream: [createMockNode(servicePostgres)],
            downstream: [createMockNode(serviceGateway)],
          }),
        ],
      })
      .mockResolvedValueOnce({
        records: [
          createMockRecord({
            i: createMockNode({
              id: 'inc-001',
              title: 'Auth Service Outage',
              severity: 'SEV1',
              status: 'resolved',
              started_at: '2024-09-12T02:14:00.000Z',
              resolved_at: '2024-09-12T04:47:00.000Z',
              description: 'Token validation failed.',
            }),
          }),
        ],
      });

    const result = await getDependencies('svc-auth');

    expect(result.service.dependencyCount).toBe(1);
    expect(result.service.dependentCount).toBe(1);
    expect(result.upstream).toEqual([servicePostgres]);
    expect(result.downstream).toEqual([serviceGateway]);
    expect(result.incidents).toHaveLength(1);
  });
});
