import { dependenciesData } from '../data/dependencies';
import { env } from '../db/env';
import { toNumber } from '../db/helpers';
import { getDriver } from '../db/neo4j';

export async function seedDependencies(): Promise<number> {
  if (env.DRY_RUN) {
    console.log(`[seedDependencies] DRY RUN: would create ${dependenciesData.length} dependencies.`);
    return dependenciesData.length;
  }

  const session = getDriver().session({ database: env.NEO4J_DATABASE });
  let created = 0;

  try {
    for (const dependency of dependenciesData) {
      const result = await session.run(
        `
        MATCH (consumer:Service {id: $from})
        MATCH (provider:Service {id: $to})
        MERGE (consumer)-[r:DEPENDS_ON]->(provider)
        SET r.criticality = $criticality,
            r.latency_ms = $latency_ms
        RETURN count(r) AS relationshipCount
        `,
        dependency,
      );

      const relationshipCount = toNumber(result.records[0]?.get('relationshipCount') ?? 0);

      if (relationshipCount === 0) {
        console.warn(`[seedDependencies] Skipped missing edge ${dependency.from} -> ${dependency.to}`);
      } else {
        created += 1;
      }
    }

    console.log(`[seedDependencies] Created ${created} dependency edges.`);
    return created;
  } finally {
    await session.close();
  }
}
