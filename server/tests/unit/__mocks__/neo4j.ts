import { vi } from 'vitest';

export const createMockNode = (properties: object) => ({
  properties,
  labels: [],
});

export const createMockRecord = (data: Record<string, unknown>) => ({
  get: vi.fn((key: string) => data[key]),
  keys: Object.keys(data),
});

export const createMockSession = (records: ReturnType<typeof createMockRecord>[] = []) => ({
  run: vi.fn().mockResolvedValue({ records }),
  close: vi.fn().mockResolvedValue(undefined),
});

export const createMockDriver = (session: ReturnType<typeof createMockSession>) => ({
  session: vi.fn().mockReturnValue(session),
  verifyConnectivity: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
});
