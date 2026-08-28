import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../server/.env') });

export interface SeedEnv {
  NEO4J_URI: string;
  NEO4J_USERNAME: string;
  NEO4J_PASSWORD: string;
  NEO4J_DATABASE: string;
  DRY_RUN: boolean;
  SKIP_CLEAR: boolean;
}

function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env: SeedEnv = {
  NEO4J_URI: required('NEO4J_URI'),
  NEO4J_USERNAME: required('NEO4J_USERNAME'),
  NEO4J_PASSWORD: required('NEO4J_PASSWORD'),
  NEO4J_DATABASE: process.env.NEO4J_DATABASE ?? 'neo4j',
  DRY_RUN: process.env.DRY_RUN === 'true' || process.argv.includes('--dry-run'),
  SKIP_CLEAR: process.argv.includes('--no-clear'),
};
