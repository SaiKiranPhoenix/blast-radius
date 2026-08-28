import { servicesData } from '../data/services';
import { teamsData } from '../data/teams';
import { env } from '../db/env';
import { getDriver } from '../db/neo4j';

const teamNames = new Map(teamsData.map((team) => [team.id, team.name]));

export async function seedServices(): Promise<number> {
  if (env.DRY_RUN) {
    console.log(`[seedServices] DRY RUN: would seed ${servicesData.length} services.`);
    return servicesData.length;
  }

  const session = getDriver().session({ database: env.NEO4J_DATABASE });

  try {
    for (const service of servicesData) {
      await session.run(
        `
        MERGE (s:Service {id: $id})
        SET s.name = $name,
            s.type = $type,
            s.tier = $tier,
            s.description = $description,
            s.language = $language,
            s.repo_url = $repo_url
        WITH s
        MATCH (t:Team {id: $teamId})
        MERGE (t)-[:OWNS]->(s)
        `,
        service,
      );

      const teamName = teamNames.get(service.teamId) ?? service.teamId;
      console.log(`[seedServices] ${service.name} -> ${teamName}`);
    }

    console.log(`[seedServices] Seeded ${servicesData.length} services.`);
    return servicesData.length;
  } finally {
    await session.close();
  }
}
