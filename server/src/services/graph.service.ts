import { getDriver } from '../config/neo4j';
import { env } from '../config/env';
import { Q_LONGEST_CHAIN } from '../utils/cypher';
import type { LongestChainEntry } from '../types/graph.types';
import { toInt } from '../utils/neo4jHelpers';

export const getLongestChain = async (): Promise<LongestChainEntry[]> => {
  const driver = getDriver();
  const session = driver.session({ database: env.NEO4J_DATABASE });
  try {
    const result = await session.run(Q_LONGEST_CHAIN);
    
    return result.records.map((record) => ({
      source: record.get('source'),
      sink: record.get('sink'),
      depth: toInt(record.get('depth')),
    }));
  } finally {
    await session.close();
  }
};
