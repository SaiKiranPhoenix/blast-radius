import { incidentsData } from '../data/incidents';
import { env } from '../db/env';
import { getDriver } from '../db/neo4j';

export async function seedIncidents(): Promise<number> {
  if (env.DRY_RUN) {
    console.log(`[seedIncidents] DRY RUN: would seed ${incidentsData.length} incidents.`);
    return incidentsData.length;
  }

  const session = getDriver().session({ database: env.NEO4J_DATABASE });

  try {
    for (const incident of incidentsData) {
      await session.run(
        `
        MERGE (i:Incident {id: $id})
        SET i.title = $title,
            i.severity = $severity,
            i.status = $status,
            i.started_at = $started_at,
            i.resolved_at = $resolved_at,
            i.description = $description
        WITH i
        MATCH (root:Service {id: $rootCauseServiceId})
        MERGE (i)-[:CAUSED_BY]->(root)
        WITH i
        UNWIND $affectedServiceIds AS serviceId
        MATCH (affected:Service {id: serviceId})
        MERGE (i)-[:AFFECTED]->(affected)
        `,
        incident,
      );
    }

    console.log(`[seedIncidents] Seeded ${incidentsData.length} incidents.`);
    return incidentsData.length;
  } finally {
    await session.close();
  }
}
