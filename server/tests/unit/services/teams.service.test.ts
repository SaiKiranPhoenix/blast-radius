import { beforeEach, describe, expect, it, vi } from 'vitest';
import { incidentActive } from '../../fixtures/incidents.fixture';
import { serviceGateway } from '../../fixtures/services.fixture';
import { teamPlatform, teamPlatformWithCounts } from '../../fixtures/teams.fixture';
import {
  createMockDriver,
  createMockNode,
  createMockRecord,
  createMockSession,
} from '../__mocks__/neo4j';

vi.mock('../../../src/config/neo4j', () => ({
  getDriver: vi.fn(),
}));

import { getDriver } from '../../../src/config/neo4j';
import { getTeamById, getTeams } from '../../../src/services/teams.service';

const mockGetDriver = vi.mocked(getDriver);

describe('teams.service', () => {
  let session: ReturnType<typeof createMockSession>;

  beforeEach(() => {
    vi.clearAllMocks();
    session = createMockSession();
    mockGetDriver.mockReturnValue(createMockDriver(session) as never);
  });

  it('returns teams with service and incident counts', async () => {
    session.run.mockResolvedValueOnce({
      records: [
        createMockRecord({
          team: createMockNode(teamPlatform),
          serviceCount: 2,
          activeIncidentCount: 1,
        }),
      ],
    });

    await expect(getTeams()).resolves.toEqual([teamPlatformWithCounts]);
  });

  it('returns an empty array when no teams exist', async () => {
    session.run.mockResolvedValueOnce({ records: [] });

    await expect(getTeams()).resolves.toEqual([]);
  });

  it('returns a team detail with services and active incidents', async () => {
    session.run.mockResolvedValueOnce({
      records: [
        createMockRecord({
          team: createMockNode(teamPlatform),
          services: [createMockNode(serviceGateway)],
          activeIncidents: [createMockNode(incidentActive)],
        }),
      ],
    });

    await expect(getTeamById('team-platform')).resolves.toEqual({
      ...teamPlatform,
      services: [serviceGateway],
      activeIncidents: [incidentActive],
    });
  });

  it('throws TEAM_NOT_FOUND when no team is returned', async () => {
    session.run.mockResolvedValueOnce({ records: [] });

    await expect(getTeamById('missing')).rejects.toMatchObject({
      code: 'TEAM_NOT_FOUND',
      statusCode: 404,
    });
  });
});
