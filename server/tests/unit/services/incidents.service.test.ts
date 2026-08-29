import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deploymentAuth } from '../../fixtures/deployments.fixture';
import { incidentAuth } from '../../fixtures/incidents.fixture';
import { serviceAuth, serviceGateway } from '../../fixtures/services.fixture';
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
import { getIncidentById, getIncidents } from '../../../src/services/incidents.service';

const mockGetDriver = vi.mocked(getDriver);

describe('incidents.service', () => {
  let session: ReturnType<typeof createMockSession>;

  beforeEach(() => {
    vi.clearAllMocks();
    session = createMockSession();
    mockGetDriver.mockReturnValue(createMockDriver(session) as never);
  });

  it('returns incidents with affected counts and root cause service', async () => {
    session.run.mockResolvedValueOnce({
      records: [
        createMockRecord({
          i: createMockNode({
            id: incidentAuth.id,
            title: incidentAuth.title,
            severity: incidentAuth.severity,
            status: incidentAuth.status,
            started_at: incidentAuth.started_at,
            resolved_at: incidentAuth.resolved_at,
            description: incidentAuth.description,
          }),
          root: createMockNode(serviceAuth),
          affectedServiceCount: 2,
        }),
      ],
    });

    await expect(getIncidents({ status: 'resolved', severity: 'SEV1' })).resolves.toEqual([
      incidentAuth,
    ]);
    expect(session.run).toHaveBeenCalledWith(expect.stringContaining('WHERE'), {
      status: 'resolved',
      severity: 'SEV1',
    });
  });

  it('returns incident detail with affected services and triggering deployment', async () => {
    session.run.mockResolvedValueOnce({
      records: [
        createMockRecord({
          i: createMockNode({
            id: incidentAuth.id,
            title: incidentAuth.title,
            severity: incidentAuth.severity,
            status: incidentAuth.status,
            started_at: incidentAuth.started_at,
            resolved_at: incidentAuth.resolved_at,
            description: incidentAuth.description,
          }),
          root: createMockNode(serviceAuth),
          affectedServices: [createMockNode(serviceAuth), createMockNode(serviceGateway)],
          deployment: createMockNode(deploymentAuth),
        }),
      ],
    });

    await expect(getIncidentById('inc-001')).resolves.toEqual({
      ...incidentAuth,
      affectedServices: [serviceAuth, serviceGateway],
      triggeredBy: deploymentAuth,
    });
  });

  it('sets triggeredBy to null when no deployment is linked', async () => {
    session.run.mockResolvedValueOnce({
      records: [
        createMockRecord({
          i: createMockNode({
            id: incidentAuth.id,
            title: incidentAuth.title,
            severity: incidentAuth.severity,
            status: incidentAuth.status,
            started_at: incidentAuth.started_at,
            resolved_at: incidentAuth.resolved_at,
            description: incidentAuth.description,
          }),
          root: null,
          affectedServices: [],
          deployment: null,
        }),
      ],
    });

    const result = await getIncidentById('inc-001');

    expect(result.rootCauseService).toBeNull();
    expect(result.triggeredBy).toBeNull();
  });

  it('throws INCIDENT_NOT_FOUND when no incident is returned', async () => {
    session.run.mockResolvedValueOnce({ records: [] });

    await expect(getIncidentById('missing')).rejects.toMatchObject({
      code: 'INCIDENT_NOT_FOUND',
      statusCode: 404,
    });
  });
});
