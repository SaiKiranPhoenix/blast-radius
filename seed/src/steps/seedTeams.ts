import { teamsData } from '../data/teams';
import { env } from '../db/env';
import { getDriver } from '../db/neo4j';

export async function seedTeams(): Promise<number> {
  if (env.DRY_RUN) {
    console.log(`[seedTeams] DRY RUN: would seed ${teamsData.length} teams.`);
    return teamsData.length;
  }

  const session = getDriver().session({ database: env.NEO4J_DATABASE });

  try {
    for (const team of teamsData) {
      await session.run(
        `
        MERGE (t:Team {id: $id})
        SET t.name = $name,
            t.slack_channel = $slack_channel,
            t.oncall_email = $oncall_email,
            t.timezone = $timezone
        `,
        team,
      );
    }

    console.log(`[seedTeams] Seeded ${teamsData.length} teams.`);
    return teamsData.length;
  } finally {
    await session.close();
  }
}
