import { usersData } from '../data/users';
import { workspacesData } from '../data/workspaces';
import { env } from '../db/env';
import { getDriver } from '../db/neo4j';

export async function seedUsers(): Promise<number> {
  if (env.DRY_RUN) {
    console.log(`[seedUsers] DRY RUN: would seed ${usersData.length} users.`);
    return usersData.length;
  }

  const session = getDriver().session({ database: env.NEO4J_DATABASE });
  const workspaceId = workspacesData[0].id;

  try {
    for (const user of usersData) {
      // Merge User node
      await session.run(
        `
        MERGE (u:User {id: $id})
        SET u.name = $name,
            u.email = $email,
            u.role = $role,
            u.title = $title
        `,
        user,
      );

      // Link user to the demo workspace with their role
      await session.run(
        `
        MATCH (u:User {id: $userId})
        MATCH (w:Workspace {id: $workspaceId})
        MERGE (u)-[m:MEMBER_OF]->(w)
        SET m.role = $role
        `,
        { userId: user.id, workspaceId, role: user.role },
      );
    }

    console.log(`[seedUsers] Seeded ${usersData.length} users with workspace memberships.`);
    return usersData.length;
  } finally {
    await session.close();
  }
}
