import { env } from '../db/env';
import { getDriver } from '../db/neo4j';
import { toNumber } from '../db/helpers';

export async function clearDatabase(): Promise<number> {
  if (env.DRY_RUN) {
    console.log('[clearDatabase] DRY RUN: would clear all nodes and relationships.');
    return 0;
  }

  const session = getDriver().session({ database: env.NEO4J_DATABASE });

  try {
    const result = await session.run(`
      MATCH (n)
      WITH collect(n) AS nodes, count(n) AS nodeCount
      FOREACH (node IN nodes | DETACH DELETE node)
      RETURN nodeCount
    `);

    const deleted = toNumber(result.records[0]?.get('nodeCount') ?? 0);
    console.log(`[clearDatabase] Cleared ${deleted} existing nodes.`);
    return deleted;
  } finally {
    await session.close();
  }
}
