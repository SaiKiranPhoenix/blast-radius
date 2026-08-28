import type { Request, Response } from 'express';
import { getDriver } from '../config/neo4j';
import { env } from '../config/env';

export const getHealth = async (req: Request, res: Response) => {
  const start = Date.now();
  let dbConnected = false;
  let latencyMs: number | null = null;
  
  try {
    const driver = getDriver();
    await driver.verifyConnectivity();
    dbConnected = true;
    latencyMs = Date.now() - start;
  } catch (error) {
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
