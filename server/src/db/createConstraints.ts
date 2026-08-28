import { closeDriver } from '../config/neo4j';
import { createConstraintsAndIndexes } from './constraints';

export async function runCreateConstraints(): Promise<void> {
  const statementCount = await createConstraintsAndIndexes();
  console.log(`[createConstraints] ${statementCount} constraints and indexes verified.`);
}

if (require.main === module) {
  runCreateConstraints()
    .catch((error: unknown) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(() => closeDriver());
}
