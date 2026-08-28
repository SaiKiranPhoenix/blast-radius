import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  NEO4J_URI: z.string().min(1, 'NEO4J_URI is required'),
  NEO4J_USERNAME: z.string().min(1, 'NEO4J_USERNAME is required'),
  NEO4J_PASSWORD: z.string().min(1, 'NEO4J_PASSWORD is required'),
  NEO4J_DATABASE: z.string().min(1).default('neo4j'),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

function formatEnvError(error: z.ZodError): string {
  return error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
}

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);

  if (!result.success) {
    throw new Error(`Invalid server environment: ${formatEnvError(result.error)}`);
  }

  return result.data;
}

export const env = loadEnv();
