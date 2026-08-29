import { env } from '../db/env';
import { getDriver } from '../db/neo4j';

export const schemaStatements = [
  `CREATE CONSTRAINT service_id_unique IF NOT EXISTS
FOR (s:Service) REQUIRE s.id IS UNIQUE`,
  `CREATE CONSTRAINT team_id_unique IF NOT EXISTS
FOR (t:Team) REQUIRE t.id IS UNIQUE`,
  `CREATE CONSTRAINT incident_id_unique IF NOT EXISTS
FOR (i:Incident) REQUIRE i.id IS UNIQUE`,
  `CREATE CONSTRAINT deployment_id_unique IF NOT EXISTS
FOR (d:Deployment) REQUIRE d.id IS UNIQUE`,
  `CREATE INDEX service_type_idx IF NOT EXISTS
FOR (s:Service) ON (s.type)`,
  `CREATE INDEX service_tier_idx IF NOT EXISTS
FOR (s:Service) ON (s.tier)`,
  `CREATE INDEX incident_status_idx IF NOT EXISTS
FOR (i:Incident) ON (i.status)`,
  `CREATE INDEX incident_started_at_idx IF NOT EXISTS
FOR (i:Incident) ON (i.started_at)`,
  `CREATE INDEX incident_severity_idx IF NOT EXISTS
FOR (i:Incident) ON (i.severity)`,
];

export async function createConstraints(): Promise<number> {
  if (env.DRY_RUN) {
    console.log(
      `[createConstraints] DRY RUN: would run ${schemaStatements.length} schema statements.`,
    );
    return schemaStatements.length;
  }

  const session = getDriver().session({ database: env.NEO4J_DATABASE });

  try {
    for (const statement of schemaStatements) {
      await session.run(statement);
    }

    console.log(`[createConstraints] Verified ${schemaStatements.length} constraints and indexes.`);
    return schemaStatements.length;
  } finally {
    await session.close();
  }
}
