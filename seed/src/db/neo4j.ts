import neo4j, { type Driver } from 'neo4j-driver';
import { env } from './env';

let driver: Driver | null = null;

function getEncryptionConfig(uri: string): Record<string, string> {
  if (uri.startsWith('bolt+ssc://')) {
    return {
      encrypted: 'ENCRYPTION_ON',
      trust: 'TRUST_ALL_CERTIFICATES',
    };
  }

  if (uri.startsWith('bolt://')) {
    return {
      encrypted: 'ENCRYPTION_OFF',
      trust: 'TRUST_SYSTEM_CA_SIGNED_CERTIFICATES',
    };
  }

  return {};
}

export function getDriver(): Driver {
  if (!driver) {
    driver = neo4j.driver(env.NEO4J_URI, neo4j.auth.basic(env.NEO4J_USERNAME, env.NEO4J_PASSWORD), {
      maxConnectionPoolSize: 10,
      connectionAcquisitionTimeout: 5000,
      ...getEncryptionConfig(env.NEO4J_URI),
    });
  }

  return driver;
}

export async function closeDriver(): Promise<void> {
  if (!driver) {
    return;
  }

  await driver.close();
  driver = null;
}
