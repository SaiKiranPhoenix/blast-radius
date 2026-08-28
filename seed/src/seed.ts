/**
 * seed/src/seed.ts — Database seed orchestrator
 *
 * Execution order:
 *  1. Clear database   (MATCH (n) DETACH DELETE n)
 *  2. Create constraints & indexes
 *  3. Seed teams       (10 Team nodes)
 *  4. Seed services    (40 Service nodes + OWNS relationships)
 *  5. Seed dependencies (~84 DEPENDS_ON relationships)
 *  6. Seed incidents   (20 Incident nodes + CAUSED_BY + AFFECTED)
 *  7. Seed deployments (15 Deployment nodes + DEPLOYED_TO + TRIGGERED)
 *
 * Usage:
 *  npm run seed --workspace=seed
 *  DRY_RUN=true npm run seed --workspace=seed
 *
 * Implementation: Phase 4 — Seed Script
 */

// Minimal stub so TypeScript compilation passes during Phase 0
export {};
