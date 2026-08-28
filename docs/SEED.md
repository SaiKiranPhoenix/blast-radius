# BlastRadius — Seed Script Specification

> Complete logic walkthrough for populating the CognoDB graph with 40 services, 10 teams, 80+ dependency edges, 20 incidents, and 15 deployments.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Environment Setup](#2-environment-setup)
3. [Order of Operations](#3-order-of-operations)
4. [Phase 1: Clear Database](#4-phase-1-clear-database)
5. [Phase 2: Create Constraints and Indexes](#5-phase-2-create-constraints-and-indexes)
6. [Phase 3: Seed Teams](#6-phase-3-seed-teams)
7. [Phase 4: Seed Services](#7-phase-4-seed-services)
8. [Phase 5: Create Dependencies](#8-phase-5-create-dependencies)
9. [Phase 6: Seed Incidents](#9-phase-6-seed-incidents)
10. [Phase 7: Seed Deployments](#10-phase-7-seed-deployments)
11. [Ensuring 4-Hop Chains Exist](#11-ensuring-4-hop-chains-exist)
12. [Expected Output After Seeding](#12-expected-output-after-seeding)
13. [Idempotency Strategy](#13-idempotency-strategy)
14. [Running the Seed Script](#14-running-the-seed-script)

---

## 1. Overview

The seed script lives in `server/seed/` and is executed as a standalone TypeScript script (not part of the Express application). It uses the same `neo4j-driver` singleton from `server/src/config/neo4j.ts` and the same environment variables from `server/.env`.

**Script entry point:** `server/seed/index.ts`

The script is designed to be:
- **Idempotent:** Running it twice produces the same DB state as running it once (uses `MERGE` throughout).
- **Ordered:** Each phase depends on previous phases completing successfully.
- **Verbose:** Each phase logs progress to stdout so it is easy to diagnose failures.

---

## 2. Environment Setup

Before running the seed script, the following must be true:

1. **CognoDB is running** and accessible at the Bolt URI in your environment
2. **`server/.env` is configured** with valid `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`
3. **Dependencies are installed** in the `server/` workspace: `npm install`
4. **`tsx` is available** for running TypeScript directly: either globally (`npm install -g tsx`) or via `npx`

### `.env` required for seeding

```
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-password
NEO4J_DATABASE=neo4j
```

For Railway-hosted CognoDB, the URI will be `bolt+ssc://<host>:7687` or similar. Use exactly what the CognoDB dashboard provides.

---

## 3. Order of Operations

The seed script executes phases strictly in sequence. Each phase is wrapped in a try/catch. If any phase fails, the script exits with a non-zero code and logs the error.

```
Phase 1: Clear Database        (DELETE all nodes and relationships)
Phase 2: Create Constraints    (Uniqueness + indexes)
Phase 3: Seed Teams            (10 Team nodes)
Phase 4: Seed Services         (40 Service nodes + OWNS relationships)
Phase 5: Create Dependencies   (80+ DEPENDS_ON relationships)
Phase 6: Seed Incidents        (20 Incident nodes + CAUSED_BY + AFFECTED relationships)
Phase 7: Seed Deployments      (15 Deployment nodes + DEPLOYED_TO + TRIGGERED relationships)
```

**Why this order?**
- Constraints must exist before data is inserted to guarantee uniqueness enforcement from the first write.
- Teams must exist before services because the `OWNS` relationship is created during service seeding.
- Services and their dependencies must exist before incidents can reference them via `CAUSED_BY` and `AFFECTED`.
- Deployments are last because they optionally reference incidents via `TRIGGERED`.

---

## 4. Phase 1: Clear Database

**Runner:** `server/seed/runners/clearDb.ts`

**Logic:**

```cypher
MATCH (n)
DETACH DELETE n
```

This single Cypher statement deletes all nodes and all relationships in the database, returning it to an empty state. `DETACH DELETE` removes the node and all its relationships atomically.

**Why clear first?** While `MERGE` handles re-seeding gracefully, a full clear guarantees there is no stale data from old schema versions or manual experiments. This is appropriate for a development/demo database. Do **not** clear a production database containing real operational data.

**Logging:**

```
[clearDb] Clearing all nodes and relationships...
[clearDb] Database cleared. ✓
```

---

## 5. Phase 2: Create Constraints and Indexes

**Runner:** `server/seed/runners/createConstraints.ts`

**Logic:** Runs the following Cypher statements in sequence. Uses `IF NOT EXISTS` so the statements are idempotent even if constraints were already created.

```cypher
CREATE CONSTRAINT service_id_unique IF NOT EXISTS
FOR (s:Service) REQUIRE s.id IS UNIQUE;

CREATE CONSTRAINT team_id_unique IF NOT EXISTS
FOR (t:Team) REQUIRE t.id IS UNIQUE;

CREATE CONSTRAINT incident_id_unique IF NOT EXISTS
FOR (i:Incident) REQUIRE i.id IS UNIQUE;

CREATE CONSTRAINT deployment_id_unique IF NOT EXISTS
FOR (d:Deployment) REQUIRE d.id IS UNIQUE;

CREATE INDEX service_type_idx IF NOT EXISTS
FOR (s:Service) ON (s.type);

CREATE INDEX service_tier_idx IF NOT EXISTS
FOR (s:Service) ON (s.tier);

CREATE INDEX incident_status_idx IF NOT EXISTS
FOR (i:Incident) ON (i.status);

CREATE INDEX incident_started_at_idx IF NOT EXISTS
FOR (i:Incident) ON (i.started_at);

CREATE INDEX incident_severity_idx IF NOT EXISTS
FOR (i:Incident) ON (i.severity);
```

Each statement is run in its own session call. The runner collects results and logs how many constraints/indexes were created vs. already existed.

**Logging:**

```
[createConstraints] Creating constraints and indexes...
[createConstraints] Created: service_id_unique ✓
[createConstraints] Created: team_id_unique ✓
[createConstraints] Created: incident_id_unique ✓
[createConstraints] Created: deployment_id_unique ✓
[createConstraints] Created indexes: service_type_idx, service_tier_idx, incident_status_idx, incident_started_at_idx, incident_severity_idx ✓
```

---

## 6. Phase 3: Seed Teams

**Runner:** `server/seed/runners/seedTeams.ts`  
**Data:** `server/seed/data/teams.ts`

**Data structure:**

The `teams.ts` data file exports an array of 10 plain objects matching the `Team` node schema:

```typescript
export const teamsData = [
  {
    id: 'team-platform',
    name: 'Platform Engineering',
    slack_channel: '#platform-oncall',
    oncall_email: 'platform-oncall@acme.com',
    timezone: 'America/New_York',
  },
  {
    id: 'team-identity',
    name: 'Identity & Access',
    slack_channel: '#identity-oncall',
    oncall_email: 'identity-oncall@acme.com',
    timezone: 'America/Los_Angeles',
  },
  // ... 8 more teams
];
```

**Logic:**

The runner iterates over the `teamsData` array and for each team, runs:

```cypher
MERGE (t:Team {id: $id})
SET t.name = $name,
    t.slack_channel = $slack_channel,
    t.oncall_email = $oncall_email,
    t.timezone = $timezone
```

All 10 inserts run in a single session in sequence. The session is closed after all teams are written.

**Logging:**

```
[seedTeams] Seeding 10 teams...
[seedTeams] Seeded: Platform Engineering (team-platform) ✓
[seedTeams] Seeded: Identity & Access (team-identity) ✓
... (8 more)
[seedTeams] 10 teams seeded. ✓
```

---

## 7. Phase 4: Seed Services

**Runner:** `server/seed/runners/seedServices.ts`  
**Data:** `server/seed/data/services.ts`

**Data structure:**

The `services.ts` data file exports an array of 40 objects:

```typescript
export const servicesData = [
  {
    id: 'svc-api-gateway',
    name: 'API Gateway',
    type: 'gateway',
    tier: 'critical',
    description: 'Primary ingress point for all external traffic...',
    language: 'Go',
    repo_url: 'https://github.com/acme/api-gateway',
    teamId: 'team-platform',   // which team owns this service
  },
  {
    id: 'svc-auth',
    name: 'Auth Service',
    type: 'api',
    tier: 'critical',
    description: 'Handles authentication and authorization for all services...',
    language: 'TypeScript',
    repo_url: 'https://github.com/acme/auth-service',
    teamId: 'team-identity',
  },
  // ... 38 more services
];
```

**Logic:**

For each service, the runner executes two Cypher statements in one transaction:

1. **Merge the Service node:**

```cypher
MERGE (s:Service {id: $id})
SET s.name = $name,
    s.type = $type,
    s.tier = $tier,
    s.description = $description,
    s.language = $language,
    s.repo_url = $repo_url
```

2. **Link the Service to its Team:**

```cypher
MATCH (t:Team {id: $teamId})
MATCH (s:Service {id: $id})
MERGE (t)-[:OWNS]->(s)
```

**Logging:**

```
[seedServices] Seeding 40 services...
[seedServices] Seeded: API Gateway (svc-api-gateway) → Platform Engineering ✓
[seedServices] Seeded: Auth Service (svc-auth) → Identity & Access ✓
... (38 more)
[seedServices] 40 services seeded. ✓
```

---

## 8. Phase 5: Create Dependencies

**Runner:** `server/seed/runners/seedDependencies.ts`  
**Data:** `server/seed/data/dependencies.ts`

**Data structure:**

The `dependencies.ts` data file exports an array of edge definitions:

```typescript
export const dependenciesData = [
  // API Gateway depends on Auth Service (hard dependency)
  { from: 'svc-api-gateway', to: 'svc-auth', criticality: 'hard', latency_ms: 12 },
  // API Gateway depends on BFF Web... no wait, BFF depends on Gateway
  { from: 'svc-bff-web', to: 'svc-api-gateway', criticality: 'hard', latency_ms: 5 },
  { from: 'svc-bff-mobile', to: 'svc-api-gateway', criticality: 'hard', latency_ms: 5 },
  { from: 'svc-graphql-gateway', to: 'svc-api-gateway', criticality: 'hard', latency_ms: 8 },
  // Gateway depends on domain APIs
  { from: 'svc-api-gateway', to: 'svc-order-api', criticality: 'hard', latency_ms: 25 },
  { from: 'svc-api-gateway', to: 'svc-search-api', criticality: 'hard', latency_ms: 18 },
  { from: 'svc-api-gateway', to: 'svc-user-profile', criticality: 'hard', latency_ms: 15 },
  { from: 'svc-api-gateway', to: 'svc-recommendation-api', criticality: 'soft', latency_ms: 30 },
  // Auth depends on its backing store
  { from: 'svc-auth', to: 'svc-postgres-main', criticality: 'hard', latency_ms: 3 },
  { from: 'svc-auth', to: 'svc-redis-cache', criticality: 'soft', latency_ms: 1 },
  // ... 70+ more edges
];
```

**Logic:**

For each dependency edge, the runner executes:

```cypher
MATCH (consumer:Service {id: $from})
MATCH (provider:Service {id: $to})
MERGE (consumer)-[r:DEPENDS_ON]->(provider)
SET r.criticality = $criticality,
    r.latency_ms = $latency_ms
```

If either service is not found (MATCH returns null), the MERGE has nothing to act on and the relationship is silently skipped. The runner logs a warning for any edge where both ends are not found.

**Logging:**

```
[seedDependencies] Creating 84 dependency edges...
[seedDependencies] Created: svc-api-gateway → svc-auth (hard, 12ms) ✓
[seedDependencies] Created: svc-bff-web → svc-api-gateway (hard, 5ms) ✓
... (82 more)
[seedDependencies] 84 dependency edges created. ✓
```

---

## 9. Phase 6: Seed Incidents

**Runner:** `server/seed/runners/seedIncidents.ts`  
**Data:** `server/seed/data/incidents.ts`

**Data structure:**

```typescript
export const incidentsData = [
  {
    id: 'inc-001',
    title: 'Auth Service Outage - Token Validation Failure',
    severity: 'SEV1',
    status: 'resolved',
    started_at: '2024-09-12T02:14:00.000Z',
    resolved_at: '2024-09-12T04:47:00.000Z',
    description: 'Redis cache exhaustion caused auth token validation to fail...',
    rootCauseServiceId: 'svc-auth',
    affectedServiceIds: [
      'svc-auth', 'svc-api-gateway', 'svc-bff-web', 'svc-bff-mobile',
      'svc-graphql-gateway', 'svc-order-api', 'svc-checkout', 'svc-payment-gateway',
      'svc-search-api', 'svc-user-profile', 'svc-cart', 'svc-recommendation-api',
      'svc-catalog', 'svc-billing', 'svc-inventory', 'svc-notification-api',
      'svc-pricing', 'svc-fraud-detection',
    ],
  },
  // ... 19 more incidents
];
```

**Logic for each incident:**

1. **Merge the Incident node:**

```cypher
MERGE (i:Incident {id: $id})
SET i.title = $title,
    i.severity = $severity,
    i.status = $status,
    i.started_at = $started_at,
    i.resolved_at = $resolved_at,
    i.description = $description
```

2. **Create the CAUSED_BY relationship:**

```cypher
MATCH (i:Incident {id: $id})
MATCH (root:Service {id: $rootCauseServiceId})
MERGE (i)-[:CAUSED_BY]->(root)
```

3. **Create all AFFECTED relationships in one query using `UNWIND`:**

```cypher
MATCH (i:Incident {id: $id})
UNWIND $affectedServiceIds AS serviceId
MATCH (s:Service {id: serviceId})
MERGE (i)-[:AFFECTED]->(s)
```

Using `UNWIND` keeps the number of round-trips to the DB minimal — one query creates all AFFECTED edges for a given incident.

**How affected services are determined:**

For SEV1 incidents with a foundational root cause (auth, postgres, redis): affected services are all services that transitively depend on the root cause. This is computed upfront during data file authoring — the data file directly lists the `affectedServiceIds` array. It does not recompute at seed time using a traversal (the graph must be fully seeded first for that to work).

For SEV3 incidents with a leaf-node root cause: affected services are just 1–3 services immediately depending on the root cause.

**Logging:**

```
[seedIncidents] Seeding 20 incidents...
[seedIncidents] Seeded: inc-001 (SEV1, resolved) with 18 affected services ✓
[seedIncidents] Seeded: inc-002 (SEV2, resolved) with 5 affected services ✓
... (18 more)
[seedIncidents] 20 incidents seeded. ✓
```

---

## 10. Phase 7: Seed Deployments

**Runner:** `server/seed/runners/seedDeployments.ts`  
**Data:** `server/seed/data/deployments.ts`

**Data structure:**

```typescript
export const deploymentsData = [
  {
    id: 'dep-001',
    version: 'v4.2.1',
    deployed_at: '2024-11-10T14:22:00.000Z',
    deployed_by: 'bob.smith',
    environment: 'production',
    deployedToServiceId: 'svc-api-gateway',
    triggeredIncidentId: null,   // clean deploy
  },
  {
    id: 'dep-007',
    version: 'v3.12.0',
    deployed_at: '2024-09-12T01:58:00.000Z',
    deployed_by: 'alice.johnson',
    environment: 'production',
    deployedToServiceId: 'svc-auth',
    triggeredIncidentId: 'inc-001',   // this deploy caused the outage
  },
  // ... 13 more deployments
];
```

**Logic for each deployment:**

1. **Merge the Deployment node:**

```cypher
MERGE (d:Deployment {id: $id})
SET d.version = $version,
    d.deployed_at = $deployed_at,
    d.deployed_by = $deployed_by,
    d.environment = $environment
```

2. **Create the DEPLOYED_TO relationship:**

```cypher
MATCH (d:Deployment {id: $id})
MATCH (s:Service {id: $deployedToServiceId})
MERGE (d)-[:DEPLOYED_TO]->(s)
```

3. **Create the TRIGGERED relationship (only if `triggeredIncidentId` is not null):**

```cypher
MATCH (d:Deployment {id: $id})
MATCH (i:Incident {id: $triggeredIncidentId})
MERGE (d)-[:TRIGGERED]->(i)
```

**Logging:**

```
[seedDeployments] Seeding 15 deployments...
[seedDeployments] Seeded: dep-001 (v4.2.1 → API Gateway, clean) ✓
[seedDeployments] Seeded: dep-007 (v3.12.0 → Auth Service, triggered inc-001) ✓
... (13 more)
[seedDeployments] 15 deployments seeded. ✓
```

---

## 11. Ensuring 4-Hop Chains Exist

The dependency topology must produce chains of at least 4 hops for the blast radius simulator to demonstrate meaningful depth. Here are the specific chains verified to exist in the seed data:

### Chain A (depth 4): BFF Mobile → API Gateway → Auth → Postgres

```
svc-bff-mobile
  └──[:DEPENDS_ON]──► svc-api-gateway          (hop 1 from Postgres)
       └──[:DEPENDS_ON]──► svc-auth             (hop 2 from Postgres)
            └──[:DEPENDS_ON]──► svc-postgres-main  (leaf — hop 3)
```

**Blast radius of `svc-postgres-main` includes `svc-bff-mobile` at hop 3.**

### Chain B (depth 5): Mobile BFF → Gateway → Checkout → Order API → Auth → Postgres

```
svc-bff-mobile
  └──[:DEPENDS_ON]──► svc-api-gateway
       └──[:DEPENDS_ON]──► svc-checkout
            └──[:DEPENDS_ON]──► svc-order-api
                 └──[:DEPENDS_ON]──► svc-auth
                      └──[:DEPENDS_ON]──► svc-postgres-main
```

**This is the longest chain — depth 5 from BFF Mobile to Postgres.**

### Chain C (depth 4): Recommendation API → ML Inference → Feature Store → Postgres

```
svc-recommendation-api
  └──[:DEPENDS_ON]──► svc-ml-inference
       └──[:DEPENDS_ON]──► svc-feature-store
            └──[:DEPENDS_ON]──► svc-postgres-main
```

**These chains exist in the `dependenciesData` array in the seed data file. The engineer writing the seed data file must verify that these edges are all present.**

### Verification Query

After seeding, run this to confirm 4+ hop chains exist:

```cypher
MATCH path = (s:Service)-[:DEPENDS_ON*4..]->(t:Service)
RETURN s.name AS source, t.name AS sink, length(path) AS depth
ORDER BY depth DESC
LIMIT 5
```

If this returns results, the chain requirement is satisfied.

---

## 12. Expected Output After Seeding

After a successful seed run, the database should contain:

| Entity | Count |
|--------|-------|
| `Service` nodes | 40 |
| `Team` nodes | 10 |
| `Incident` nodes | 20 |
| `Deployment` nodes | 15 |
| `[:DEPENDS_ON]` relationships | 84 (approximately) |
| `[:OWNS]` relationships | 40 (one per service) |
| `[:CAUSED_BY]` relationships | 20 (one per incident) |
| `[:AFFECTED]` relationships | ~140 (variable per incident severity) |
| `[:DEPLOYED_TO]` relationships | 15 (one per deployment) |
| `[:TRIGGERED]` relationships | 5 (only the bad deploys) |

**Verify with:**

```cypher
MATCH (n) RETURN labels(n)[0] AS label, count(n) AS count ORDER BY count DESC;

MATCH ()-[r]->() RETURN type(r) AS type, count(r) AS count ORDER BY count DESC;
```

**Expected console output from the seed script:**

```
BlastRadius Seed Script
========================
[clearDb] Clearing all nodes and relationships...
[clearDb] Database cleared. ✓

[createConstraints] Creating constraints and indexes...
[createConstraints] 4 constraints created. ✓
[createConstraints] 5 indexes created. ✓

[seedTeams] Seeding 10 teams...
[seedTeams] 10 teams seeded. ✓

[seedServices] Seeding 40 services...
[seedServices] 40 services seeded. ✓
[seedServices] 40 OWNS relationships created. ✓

[seedDependencies] Creating 84 dependency edges...
[seedDependencies] 84 DEPENDS_ON relationships created. ✓

[seedIncidents] Seeding 20 incidents...
[seedIncidents] 20 CAUSED_BY relationships created. ✓
[seedIncidents] 143 AFFECTED relationships created. ✓

[seedDeployments] Seeding 15 deployments...
[seedDeployments] 15 DEPLOYED_TO relationships created. ✓
[seedDeployments] 5 TRIGGERED relationships created. ✓

========================
Seeding complete!
  Nodes:         85 total
  Relationships: 311 total
  Duration:      4.2s
========================
```

---

## 13. Idempotency Strategy

The seed script is idempotent. Running it multiple times produces the same result because:

1. **Phase 1 always clears the database first.** This makes subsequent phases always work with a clean slate.
2. **All node creation uses `MERGE` on the `id` property.** If the node already exists (e.g., after a partial failure followed by a re-run), it is updated with `SET` rather than duplicated.
3. **All relationship creation uses `MERGE` on the pattern.** This prevents duplicate relationships between the same node pairs.

**To re-seed from scratch:**

```bash
cd server && npm run seed
```

This runs the full sequence: clear → constraints → teams → services → dependencies → incidents → deployments.

**To run a partial re-seed** (e.g., only refresh incidents):

The seed runners can be invoked individually if needed. However, for simplicity, the default `npm run seed` always runs the full sequence. For partial re-seeding in production-like environments, skip Phase 1 (the clear phase) and run only the desired runners. The `MERGE` strategy ensures no duplicates.

---

## 14. Running the Seed Script

### Command

```bash
# From the repo root
cd server && npm run seed

# Or from the repo root using workspace shortcut
npm run seed --workspace=server
```

### `package.json` script definition

```json
{
  "scripts": {
    "seed": "tsx seed/index.ts",
    "seed:dry-run": "tsx seed/index.ts --dry-run"
  }
}
```

### Dry-run mode

The `--dry-run` flag (optional to implement) logs all Cypher statements that would be run without actually executing them. Useful for verifying the seed logic without affecting the database.

### Troubleshooting

| Error | Likely Cause | Fix |
|-------|-------------|-----|
| `ServiceUnavailableError` | CognoDB is not running or URI is wrong | Check `NEO4J_URI` in `.env` and verify DB is running |
| `AuthError` | Wrong username or password | Check `NEO4J_USERNAME` and `NEO4J_PASSWORD` |
| `Neo4jError: Already exists` | Constraint creation on existing constraint without `IF NOT EXISTS` | Confirm `IF NOT EXISTS` is in all constraint statements |
| Phase hangs at `seedDependencies` | One of the service IDs in `dependencies.ts` is misspelled | Check for typos in service IDs |
| `MATCH (t:Team {id: $teamId}) ... MERGE` creates nothing | Team not found — seeding services before teams | Verify the order of operations in `seed/index.ts` |
