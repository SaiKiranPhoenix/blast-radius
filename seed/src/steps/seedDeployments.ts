import { deploymentsData } from '../data/deployments';
import { env } from '../db/env';
import { getDriver } from '../db/neo4j';

export async function seedDeployments(): Promise<number> {
  if (env.DRY_RUN) {
    console.log(`[seedDeployments] DRY RUN: would seed ${deploymentsData.length} deployments.`);
    return deploymentsData.length;
  }

  const session = getDriver().session({ database: env.NEO4J_DATABASE });

  try {
    for (const deployment of deploymentsData) {
      await session.run(
        `
        MERGE (d:Deployment {id: $id})
        SET d.version = $version,
            d.deployed_at = $deployed_at,
            d.deployed_by = $deployed_by,
            d.environment = $environment
        WITH d
        MATCH (service:Service {id: $deployedToServiceId})
        MERGE (d)-[:DEPLOYED_TO]->(service)
        WITH d
        OPTIONAL MATCH (incident:Incident {id: $triggeredIncidentId})
        FOREACH (_ IN CASE WHEN incident IS NULL THEN [] ELSE [1] END |
          MERGE (d)-[:TRIGGERED]->(incident)
        )
        `,
        deployment,
      );
    }

    console.log(`[seedDeployments] Seeded ${deploymentsData.length} deployments.`);
    return deploymentsData.length;
  } finally {
    await session.close();
  }
}
