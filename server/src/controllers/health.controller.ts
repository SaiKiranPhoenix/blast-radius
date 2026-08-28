import type { Request, Response } from 'express';
import { getDriver } from '../config/neo4j';

export const getHealth = async (_req: Request, res: Response) => {
  const start = Date.now();
  let dbConnected = false;
  let latencyMs: number | null = null;
  
  try {
    const driver = getDriver();
    await driver.verifyConnectivity();
    dbConnected = true;
    latencyMs = Date.now() - start;
  } catch {
    // Database connectivity error, intentionally swallowed for graceful degraded status
  }
  
  const status = dbConnected ? 'ok' : 'degraded';
  
  res.status(200).json({
    status,
    timestamp: new Date().toISOString(),
    database: {
      connected: dbConnected,
      latencyMs,
    },
    uptime: Math.floor(process.uptime()),
  });
};
