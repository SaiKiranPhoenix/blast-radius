import { env } from './db/env';
import { toNumber } from './db/helpers';
import { closeDriver, getDriver } from './db/neo4j';
import { clearDatabase } from './steps/clearDatabase';
import { createConstraints } from './steps/createConstraints';
import { seedDependencies } from './steps/seedDependencies';
import { seedDeployments } from './steps/seedDeployments';
import { seedIncidents } from './steps/seedIncidents';
import { seedServices } from './steps/seedServices';
import { seedTeams } from './steps/seedTeams';
import { seedUsers } from './steps/seedUsers';
import { seedWorkspaceLinks } from './steps/seedWorkspaceLinks';
import { seedWorkspaces } from './steps/seedWorkspaces';

async function printSummary(): Promise<void> {
  if (env.DRY_RUN) {
    return;
  }

  const session = getDriver().session({ database: env.NEO4J_DATABASE });

  try {
    const nodeResult = await session.run(`
      MATCH (n)
      RETURN labels(n)[0] AS label, count(n) AS count
      ORDER BY label
    `);
    const relationshipResult = await session.run(`
      MATCH ()-[r]->()
      RETURN type(r) AS type, count(r) AS count
      ORDER BY type
    `);
    const chainResult = await session.run(`
      MATCH path = (s:Service)-[:DEPENDS_ON*4..]->(t:Service)
      RETURN s.name AS source, t.name AS sink, length(path) AS depth
      ORDER BY depth DESC
      LIMIT 5
    `);

    console.log('');
    console.log('Node counts:');
    for (const record of nodeResult.records) {
      console.log(`  ${record.get('label')}: ${toNumber(record.get('count'))}`);
    }

    console.log('');
    console.log('Relationship counts:');
    for (const record of relationshipResult.records) {
      console.log(`  ${record.get('type')}: ${toNumber(record.get('count'))}`);
    }

    console.log('');
    console.log('Longest verification chains:');
    for (const record of chainResult.records) {
      console.log(
        `  ${record.get('source')} -> ${record.get('sink')} (${toNumber(record.get('depth'))} hops)`,
      );
    }
  } finally {
    await session.close();
  }
}

async function runSeed(): Promise<void> {
  const startedAt = Date.now();

  console.log('BlastRadius Seed Script');
  console.log('=======================');

  if (env.SKIP_CLEAR) {
    console.log('[clearDatabase] Skipped because --no-clear was provided.');
  } else {
    await clearDatabase();
  }
  await createConstraints();
  await seedWorkspaces();
  await seedTeams();
  await seedServices();
  await seedWorkspaceLinks();
  await seedUsers();
  await seedDependencies();
  await seedIncidents();
  await seedDeployments();
  await printSummary();

  console.log('');
  console.log(`Seeding complete in ${((Date.now() - startedAt) / 1000).toFixed(1)}s.`);
}

runSeed()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => closeDriver());
