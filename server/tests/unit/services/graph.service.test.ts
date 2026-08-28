import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockDriver, createMockRecord, createMockSession } from '../__mocks__/neo4j';

vi.mock('../../../src/config/neo4j', () => ({
  getDriver: vi.fn(),
}));

import { getDriver } from '../../../src/config/neo4j';
import { getLongestChain } from '../../../src/services/graph.service';

const mockGetDriver = vi.mocked(getDriver);

describe('graph.service', () => {
  let session: ReturnType<typeof createMockSession>;

  beforeEach(() => {
    vi.clearAllMocks();
    session = createMockSession();
    mockGetDriver.mockReturnValue(createMockDriver(session) as never);
  });

  it('maps longest chain entries', async () => {
    session.run.mockResolvedValueOnce({
      records: [createMockRecord({ source: 'Mobile BFF', sink: 'Main Postgres', depth: 5 })],
    });

    await expect(getLongestChain()).resolves.toEqual([
      { source: 'Mobile BFF', sink: 'Main Postgres', depth: 5 },
    ]);
  });

  it('returns an empty array when there are no dependency chains', async () => {
    session.run.mockResolvedValueOnce({ records: [] });

    await expect(getLongestChain()).resolves.toEqual([]);
  });
});
