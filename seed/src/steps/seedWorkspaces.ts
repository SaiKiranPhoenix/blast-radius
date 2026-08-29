import { workspacesData } from '../data/workspaces';
import { env } from '../db/env';
import { getDriver } from '../db/neo4j';

export async function seedWorkspaces(): Promise<number> {
  if (env.DRY_RUN) {
    console.log(`[seedWorkspaces] DRY RUN: would seed ${workspacesData.length} workspaces.`);
    return workspacesData.length;
  }

  const session = getDriver().session({ database: env.NEO4J_DATABASE });

  try {
    for (const ws of workspacesData) {
      await session.run(
        `
        MERGE (w:Workspace {id: $id})
        SET w.name = $name,
            w.slug = $slug,
            w.defaultSeverity = $defaultSeverity,
            w.createdAt = $createdAt
        `,
        ws,
      );
    }

    console.log(`[seedWorkspaces] Seeded ${workspacesData.length} workspaces.`);
    return workspacesData.length;
  } finally {
    await session.close();
  }
}
