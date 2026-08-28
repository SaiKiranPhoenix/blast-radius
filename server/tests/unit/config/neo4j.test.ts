import { beforeEach, describe, expect, it, vi } from 'vitest';

const close = vi.fn().mockResolvedValue(undefined);
const driver = vi.fn(() => ({ close }));
const basic = vi.fn(() => ({ scheme: 'basic' }));

vi.mock('neo4j-driver', () => ({
  default: {
    auth: { basic },
    driver,
  },
}));

vi.mock('../../../src/config/env', () => ({
  env: {
    NEO4J_URI: 'bolt://localhost:7687',
    NEO4J_USERNAME: 'neo4j',
    NEO4J_PASSWORD: 'password',
  },
}));

describe('neo4j config', () => {
  beforeEach(async () => {
    const module = await import('../../../src/config/neo4j');
    await module.closeDriver();
    vi.clearAllMocks();
  });

  it('returns the same driver instance on repeated calls', async () => {
    const { getDriver } = await import('../../../src/config/neo4j');

    const first = getDriver();
    const second = getDriver();

    expect(first).toBe(second);
    expect(driver).toHaveBeenCalledTimes(1);
  });

  it('closes the driver and creates a new one after closeDriver', async () => {
    const { closeDriver, getDriver } = await import('../../../src/config/neo4j');

    const first = getDriver();
    await closeDriver();
    const second = getDriver();

    expect(close).toHaveBeenCalledTimes(1);
    expect(second).not.toBe(first);
    expect(driver).toHaveBeenCalledTimes(2);
  });

  it('uses self-signed certificate trust settings for bolt+ssc URIs', async () => {
    const { neo4jInternals } = await import('../../../src/config/neo4j');

    expect(neo4jInternals.getEncryptionConfig('bolt+ssc://example.com:7687')).toEqual({
      encrypted: 'ENCRYPTION_ON',
      trust: 'TRUST_ALL_CERTIFICATES',
    });
  });
});
