import { workspacesData } from '../data/workspaces';
import { env } from '../db/env';
import { getDriver } from '../db/neo4j';

/**
 * Links all existing Team and Service nodes to the demo workspace via CONTAINS
 * relationships. This gives workspace-scoped queries a graph path to filter on.
 *
 * Run AFTER seedTeams and seedServices.
 */
export async function seedWorkspaceLinks(): Promise<void> {
  if (env.DRY_RUN) {
    console.log('[seedWorkspaceLinks] DRY RUN: would link teams and services to workspace.');
    return;
  }

  const session = getDriver().session({ database: env.NEO4J_DATABASE });
  const workspaceId = workspacesData[0].id;

  try {
    // Link all teams
    const teamResult = await session.run(
      `
      MATCH (w:Workspace {id: $workspaceId})
      MATCH (t:Team)
      MERGE (w)-[:CONTAINS]->(t)
      RETURN count(t) AS linked
      `,
      { workspaceId },
    );
    const teamsLinked = teamResult.records[0]?.get('linked')?.toNumber?.() ?? 0;

    // Link all services
    const serviceResult = await session.run(
      `
      MATCH (w:Workspace {id: $workspaceId})
      MATCH (s:Service)
      MERGE (w)-[:CONTAINS]->(s)
      RETURN count(s) AS linked
      `,
      { workspaceId },
    );
    const servicesLinked = serviceResult.records[0]?.get('linked')?.toNumber?.() ?? 0;

    console.log(
      `[seedWorkspaceLinks] Linked ${teamsLinked} teams and ${servicesLinked} services to workspace "${workspaceId}".`,
    );
  } finally {
    await session.close();
  }
}
