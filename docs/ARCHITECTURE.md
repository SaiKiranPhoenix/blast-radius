# BlastRadius — Architecture Document

> **See what breaks when something breaks.**

---

## Table of Contents

1. [Monorepo Structure](#1-monorepo-structure)
2. [Technology Decisions](#2-technology-decisions)
3. [Frontend ↔ Backend Communication](#3-frontend--backend-communication)
4. [Environment Variable Schema](#4-environment-variable-schema)
5. [Database Connection Strategy](#5-database-connection-strategy)
6. [Error Handling Philosophy](#6-error-handling-philosophy)
7. [Graph Data Model](#7-graph-data-model)
8. [Cypher Queries](#8-cypher-queries)

---

## 1. Monorepo Structure

The project is a monorepo with two top-level workspaces: `server/` and `client/`. A root `package.json` orchestrates shared scripts. The `docs/` folder lives at the repo root. The seed script lives inside `server/` because it shares the DB driver config.

```
blast-radius/
├── README.md
├── package.json                        # root: workspaces, shared dev scripts
├── .gitignore
├── .env.example                        # root env example (not used at runtime)
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DATA_MODEL.md
│   ├── FRONTEND.md
│   ├── TESTING.md
│   ├── SEED.md
│   └── DEPLOYMENT.md
│
├── server/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.build.json             # excludes test files for production build
│   ├── vitest.config.ts
│   ├── .env                            # server environment variables (gitignored)
│   ├── .env.example
│   │
│   ├── src/
│   │   ├── index.ts                    # Express app entry point
│   │   ├── app.ts                      # Express app factory (for testing)
│   │   ├── config/
│   │   │   ├── env.ts                  # Validated env vars (throws on missing)
│   │   │   └── neo4j.ts               # Neo4j driver singleton
│   │   │
│   │   ├── routes/
│   │   │   ├── index.ts               # Mounts all routers
│   │   │   ├── services.routes.ts
│   │   │   ├── teams.routes.ts
│   │   │   ├── incidents.routes.ts
│   │   │   ├── graph.routes.ts
│   │   │   └── health.routes.ts
│   │   │
│   │   ├── controllers/
│   │   │   ├── services.controller.ts
│   │   │   ├── teams.controller.ts
│   │   │   ├── incidents.controller.ts
│   │   │   ├── graph.controller.ts
│   │   │   └── health.controller.ts
│   │   │
│   │   ├── services/
│   │   │   ├── services.service.ts     # Cypher queries for Service nodes
│   │   │   ├── teams.service.ts        # Cypher queries for Team nodes
│   │   │   ├── incidents.service.ts    # Cypher queries for Incident nodes
│   │   │   └── graph.service.ts        # Cross-entity graph traversal queries
│   │   │
│   │   ├── types/
│   │   │   ├── service.types.ts        # Service, BlastRadiusHop, etc.
│   │   │   ├── team.types.ts
│   │   │   ├── incident.types.ts
│   │   │   ├── graph.types.ts
│   │   │   └── api.types.ts            # ApiResponse<T>, ApiError wrappers
│   │   │
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts         # Global Express error handler
│   │   │   ├── asyncWrapper.ts         # Wraps async route handlers
│   │   │   └── requestLogger.ts        # Morgan-based request logging
│   │   │
│   │   └── utils/
│   │       ├── neo4jHelpers.ts         # Record to plain object mappers
│   │       └── AppError.ts             # Custom error class
│   │
│   ├── seed/
│   │   ├── index.ts                    # Seed script entry point
│   │   ├── data/
│   │   │   ├── teams.ts               # Raw team seed data
│   │   │   ├── services.ts            # Raw service seed data (40 services)
│   │   │   ├── dependencies.ts        # Dependency edge definitions
│   │   │   ├── incidents.ts           # Incident seed data (20 incidents)
│   │   │   └── deployments.ts         # Deployment seed data (15 deployments)
│   │   └── runners/
│   │       ├── clearDb.ts
│   │       ├── createConstraints.ts
│   │       ├── seedTeams.ts
│   │       ├── seedServices.ts
│   │       ├── seedDependencies.ts
│   │       ├── seedIncidents.ts
│   │       └── seedDeployments.ts
│   │
│   └── tests/
│       ├── unit/
│       │   ├── services/
│       │   │   ├── services.service.test.ts
│       │   │   ├── teams.service.test.ts
│       │   │   ├── incidents.service.test.ts
│       │   │   └── graph.service.test.ts
│       │   └── utils/
│       │       └── neo4jHelpers.test.ts
│       └── integration/
│           ├── services.integration.test.ts
│           ├── teams.integration.test.ts
│           ├── incidents.integration.test.ts
│           └── graph.integration.test.ts
│
└── client/
    ├── package.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── vite.config.ts
    ├── vitest.config.ts
    ├── tailwind.config.ts
    ├── postcss.config.js
    ├── index.html
    ├── .env                            # VITE_API_BASE_URL (gitignored)
    ├── .env.example
    │
    ├── public/
    │   └── favicon.svg
    │
    └── src/
        ├── main.tsx                    # React root, QueryClient setup
        ├── App.tsx                     # Router setup
        ├── index.css                   # Tailwind base + custom animations
        │
        ├── api/
        │   ├── client.ts              # Axios instance with base URL + interceptors
        │   ├── services.api.ts        # API calls for service endpoints
        │   ├── teams.api.ts
        │   ├── incidents.api.ts
        │   └── graph.api.ts
        │
        ├── hooks/
        │   ├── useServices.ts         # React Query hooks wrapping services.api
        │   ├── useTeams.ts
        │   ├── useIncidents.ts
        │   └── useGraph.ts
        │
        ├── pages/
        │   ├── ServiceMapPage.tsx      # Route: /
        │   ├── ServiceDetailPage.tsx   # Route: /services/:id
        │   ├── TeamsPage.tsx           # Route: /teams
        │   ├── TeamDetailPage.tsx      # Route: /teams/:id
        │   ├── IncidentsPage.tsx       # Route: /incidents
        │   └── IncidentDetailPage.tsx  # Route: /incidents/:id
        │
        ├── components/
        │   ├── layout/
        │   │   ├── AppShell.tsx        # Nav + main content wrapper
        │   │   ├── Sidebar.tsx
        │   │   └── TopBar.tsx
        │   │
        │   ├── service/
        │   │   ├── ServiceCard.tsx
        │   │   ├── ServiceBadge.tsx     # type + tier badges
        │   │   ├── ServiceGrid.tsx      # Grouped by team
        │   │   └── ServiceSkeleton.tsx  # Loading skeleton
        │   │
        │   ├── blast-radius/
        │   │   ├── BlastRadiusPanel.tsx  # Root component for the simulator
        │   │   ├── HopGroup.tsx          # One hop level (labeled container)
        │   │   ├── AffectedServiceCard.tsx
        │   │   └── TeamAlertBanner.tsx   # "Page these teams" section
        │   │
        │   ├── incident/
        │   │   ├── IncidentList.tsx
        │   │   ├── IncidentCard.tsx
        │   │   ├── IncidentBadge.tsx     # severity + status badges
        │   │   └── IncidentSkeleton.tsx
        │   │
        │   ├── team/
        │   │   ├── TeamCard.tsx
        │   │   ├── TeamGrid.tsx
        │   │   └── TeamSkeleton.tsx
        │   │
        │   ├── dependency/
        │   │   ├── DependencyExplorer.tsx
        │   │   ├── UpstreamList.tsx
        │   │   └── DownstreamList.tsx
        │   │
        │   └── common/
        │       ├── ErrorBoundary.tsx
        │       ├── EmptyState.tsx
        │       ├── ErrorState.tsx
        │       ├── Spinner.tsx
        │       ├── Badge.tsx
        │       ├── Card.tsx
        │       └── PageHeader.tsx
        │
        ├── types/
        │   ├── service.types.ts
        │   ├── team.types.ts
        │   ├── incident.types.ts
        │   └── graph.types.ts
        │
        ├── store/
        │   └── uiStore.ts              # useContext store: selected service, sidebar state
        │
        └── tests/
            ├── unit/
            │   ├── components/
            │   │   ├── ServiceCard.test.tsx
            │   │   ├── BlastRadiusPanel.test.tsx
            │   │   ├── IncidentCard.test.tsx
            │   │   └── TeamCard.test.tsx
            │   └── hooks/
            │       └── useServices.test.ts
            └── integration/
                ├── ServiceMapPage.test.tsx
                ├── ServiceDetailPage.test.tsx
                └── IncidentsPage.test.tsx
```

---

## 2. Technology Decisions

### Backend: Node.js + Express + TypeScript

**Why Node.js + Express?**
Express is the lowest-friction choice for building a JSON REST API that acts as a thin orchestration layer between the graph DB and the frontend. The query patterns here are all read-heavy graph traversals — the backend doesn't do heavy CPU work; it translates HTTP requests into Cypher queries and shapes the results. Node's async I/O model is ideal for this.

**Why TypeScript?**
Graph query results from the Neo4j driver return loosely-typed `Record` objects. TypeScript interfaces act as contracts that enforce shape mapping between raw driver results and API responses, catching bugs at compile time rather than in production.

### Frontend: React + Vite + TypeScript + Tailwind CSS

**Why React?**
The blast radius simulator requires component-level animation state: each hop group mounts progressively. React's declarative model makes staggered-mount animations straightforward to reason about. React Query handles caching so repeated blast radius queries for the same service don't re-fetch.

**Why Vite?**
Fast HMR during development. Native ESM. First-class TypeScript and Tailwind support without additional configuration.

**Why Tailwind CSS?**
The design system requires consistent color tokens (slate-950 for dark backgrounds, red-500 for critical indicators). Tailwind's utility classes co-locate styles with components, making the design system enforceable without a separate CSS architecture.

### Database: CognoDB (Neo4j-compatible, openCypher over Bolt)

**Why a graph database?**
The core problem — "what is the blast radius of this failure?" — is fundamentally a graph traversal problem. In a relational DB, computing a 4-hop dependency chain requires 4 self-joins on a `service_dependencies` table. In a graph DB, this is a single `MATCH path = (root)<-[:DEPENDS_ON*1..4]-(affected)` query. The data model naturally maps to nodes and edges.

**Why CognoDB specifically?**
CognoDB is Neo4j-compatible (openCypher + Bolt protocol), which means the official `neo4j-driver` npm package works unchanged. It has a hosted free tier suitable for demo/development deployments.

**Why the official `neo4j-driver`?**
It handles connection pooling, session management, and Bolt protocol details. It supports async/await natively and has first-class TypeScript types.

### Testing: Vitest

**Why Vitest instead of Jest?**
Vitest shares the Vite build pipeline, so TypeScript transforms are handled by the same config already in use. No separate `ts-jest` or `babel-jest` configuration needed. It is API-compatible with Jest so test authors familiar with Jest have no learning curve.

### Deployment: Railway (backend) + Vercel (frontend)

**Why Railway for the backend?**
Railway provides environment variables, automatic redeploys from Git, and a health check system. It can run the Node.js server with a simple `npm start` command and exposes a public URL that Vercel's frontend can call.

**Why Vercel for the frontend?**
Vercel is the canonical host for Vite/React SPAs. It handles the SPA rewrite rule (all routes to `index.html`) out of the box and provides automatic preview deployments per branch.

---

## 3. Frontend ↔ Backend Communication

### Protocol

All communication is over **HTTPS REST**. No WebSockets. The blast radius simulation is driven by client-side state using the hop data returned in a single API response, not a streaming connection.

### Base URLs

| Environment | Frontend Origin | Backend Base URL |
|-------------|-----------------|------------------|
| Development | `http://localhost:5173` | `http://localhost:3001` |
| Production | `https://blast-radius.vercel.app` | `https://blast-radius-api.railway.app` |

The frontend reads `VITE_API_BASE_URL` from its environment. The Axios client is initialized with this base URL.

```typescript
// client/src/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});
```

### CORS Setup

The backend uses the `cors` npm package. In development it allows `http://localhost:5173`. In production it allows the Vercel origin. The allowed origin is controlled by the `CLIENT_ORIGIN` environment variable.

```typescript
// server/src/app.ts
import cors from 'cors';

app.use(cors({
  origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  methods: ['GET'],
  allowedHeaders: ['Content-Type'],
}));
```

All API endpoints are read-only (GET). No mutation endpoints exist in v1.

### Response Envelope

Every API response is wrapped in a consistent envelope:

```json
// Success
{ "success": true, "data": {} }

// Error
{ "success": false, "error": { "code": "SERVICE_NOT_FOUND", "message": "No service with id xyz" } }
```

---

## 4. Environment Variable Schema

### Server (`server/.env`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | No | HTTP port to listen on | `3001` |
| `NEO4J_URI` | **Yes** | Bolt URI to CognoDB | `bolt://localhost:7687` |
| `NEO4J_USERNAME` | **Yes** | DB username | `neo4j` |
| `NEO4J_PASSWORD` | **Yes** | DB password | `s3cr3t` |
| `NEO4J_DATABASE` | No | DB name (default: `neo4j`) | `neo4j` |
| `CLIENT_ORIGIN` | No | Allowed CORS origin | `http://localhost:5173` |
| `NODE_ENV` | No | `development` or `production` | `development` |
| `LOG_LEVEL` | No | `info`, `debug`, or `error` | `info` |

The `server/src/config/env.ts` module reads and validates these at startup, throwing immediately if required variables are missing.

### Client (`client/.env`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_BASE_URL` | **Yes** | Backend base URL | `http://localhost:3001` |

Vite injects only variables prefixed with `VITE_` into the browser bundle.

---

## 5. Database Connection Strategy

### Singleton Driver

The Neo4j driver is expensive to instantiate (it establishes a connection pool). It must be created **once** at application startup and reused across all requests.

```typescript
// server/src/config/neo4j.ts
import neo4j, { Driver } from 'neo4j-driver';
import { env } from './env';

let _driver: Driver | null = null;

export function getDriver(): Driver {
  if (!_driver) {
    _driver = neo4j.driver(
      env.NEO4J_URI,
      neo4j.auth.basic(env.NEO4J_USERNAME, env.NEO4J_PASSWORD),
      {
        maxConnectionPoolSize: 10,
        connectionAcquisitionTimeout: 5000,
      }
    );
  }
  return _driver;
}

export async function closeDriver(): Promise<void> {
  if (_driver) {
    await _driver.close();
    _driver = null;
  }
}
```

### Session Management

Each service function opens a **session**, executes queries, and closes the session in a `finally` block. Sessions are lightweight and are meant to be short-lived.

```typescript
export async function getServices(): Promise<ServiceSummary[]> {
  const driver = getDriver();
  const session = driver.session({ database: env.NEO4J_DATABASE });
  try {
    const result = await session.run(QUERY, params);
    return result.records.map(mapRecord);
  } finally {
    await session.close();
  }
}
```

### Health Check

The `/health` endpoint calls `driver.verifyConnectivity()` to confirm the DB is reachable. This is the Railway health check path.

### Graceful Shutdown

`process.on('SIGTERM')` and `process.on('SIGINT')` close the driver before the process exits.

---

## 6. Error Handling Philosophy

### Custom Error Class

```typescript
// server/src/utils/AppError.ts
export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

### Error Codes

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `SERVICE_NOT_FOUND` | 404 | No Service node with given ID |
| `TEAM_NOT_FOUND` | 404 | No Team node with given ID |
| `INCIDENT_NOT_FOUND` | 404 | No Incident node with given ID |
| `DB_CONNECTION_ERROR` | 503 | Neo4j driver cannot connect |
| `QUERY_ERROR` | 500 | Cypher query failed unexpectedly |
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `INTERNAL_ERROR` | 500 | Unclassified server error |

### Global Error Handler (Express)

The 4-argument Express error middleware catches all errors thrown or passed to `next()`. It maps `AppError` instances to their status codes, detects Neo4j `ServiceUnavailableError`, and falls back to 500 for unknown errors.

### Async Wrapper

All route handlers are wrapped with `asyncWrapper` to prevent unhandled promise rejections from crashing Express:

```typescript
// server/src/middleware/asyncWrapper.ts
export const asyncWrapper = (fn: RequestHandler): RequestHandler =>
  (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
```

### Frontend Error Handling

- **React Query** automatically retries failed requests up to 3 times with exponential backoff.
- **`isError` state** from `useQuery` triggers `<ErrorState>` components with human-readable messages.
- **React `ErrorBoundary`** wraps each page to catch rendering errors and show a fallback UI.
- **Axios interceptors** on the client detect 5xx responses and normalize them into a consistent `ApiError` shape before React Query sees them.

---

## 7. Graph Data Model

### Node Labels and Properties

```
┌─────────────────────────────────────────────────────┐
│  Service                                             │
│  ─────────────────────────────────────────────────  │
│  id          : String  (unique, required)            │
│  name        : String  (required)                    │
│  type        : String  (api|worker|database|         │
│                         cache|queue|gateway)         │
│  tier        : String  (critical|high|medium|low)    │
│  description : String                                │
│  language    : String  (e.g. "TypeScript", "Python") │
│  repo_url    : String                                │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Team                                                │
│  ─────────────────────────────────────────────────  │
│  id            : String  (unique, required)          │
│  name          : String  (required)                  │
│  slack_channel : String                              │
│  oncall_email  : String                              │
│  timezone      : String  (e.g. "America/New_York")   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Incident                                            │
│  ─────────────────────────────────────────────────  │
│  id          : String  (unique, required)            │
│  title       : String  (required)                    │
│  severity    : String  (SEV1|SEV2|SEV3)              │
│  status      : String  (active|resolved|monitoring)  │
│  started_at  : String  (ISO 8601 datetime)           │
│  resolved_at : String  (ISO 8601 datetime, nullable) │
│  description : String                                │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Deployment                                          │
│  ─────────────────────────────────────────────────  │
│  id          : String  (unique, required)            │
│  version     : String  (e.g. "v2.4.1")              │
│  deployed_at : String  (ISO 8601 datetime)           │
│  deployed_by : String  (engineer username)           │
│  environment : String  (production|staging)          │
└─────────────────────────────────────────────────────┘
```

### Relationship Types and Properties

```
(Service)-[:DEPENDS_ON {criticality: "hard"|"soft", latency_ms: Integer}]->(Service)
(Team)-[:OWNS]->(Service)
(Incident)-[:CAUSED_BY]->(Service)
(Incident)-[:AFFECTED]->(Service)
(Deployment)-[:DEPLOYED_TO]->(Service)
(Deployment)-[:TRIGGERED]->(Incident)
```

### ASCII Graph Schema Diagram

```
                    ┌─────────────┐
                    │  Deployment │
                    └──────┬──────┘
                           │
              ┌────────────┼──────────────┐
              │:DEPLOYED_TO│              │:TRIGGERED
              ▼            │              ▼
        ┌─────────┐        │       ┌──────────┐
        │ Service │◄───────┘       │ Incident │
        └────┬────┘                └────┬─────┘
             │                          │
   ┌─────────┼─────────────┐            │
   │         │             │            │
:OWNS   :DEPENDS_ON  :CAUSED_BY    :AFFECTED
   │      (self)     ◄──────────────────┘
   ▼         │                     │
┌──────┐     └──────────────────────┘
│ Team │      Service depends on Service
└──────┘      (directed: consumer → provider)
```

### Relationship Direction Convention

`(A)-[:DEPENDS_ON]->(B)` means **A calls B** (A is the consumer, B is the provider). When B fails, A is affected. The blast radius query traverses **incoming** `DEPENDS_ON` edges from the failing service to find affected services:

```cypher
MATCH (root)<-[:DEPENDS_ON*1..5]-(affected)
```

This reads: "Find all services that depend on `root`, transitively up to 5 hops."

---

## 8. Cypher Queries

All queries are housed in service functions in `server/src/services/`.

### Q1 — Blast Radius (Multi-Hop Traversal)

```cypher
MATCH path = (root:Service {id: $serviceId})<-[:DEPENDS_ON*1..5]-(affected:Service)
WITH affected, length(path) AS hops
ORDER BY hops
RETURN affected, hops
```

**Why graph-native:** The `*1..5` variable-length path pattern is a core graph primitive. In a relational database this would require 5 self-joins on a `dependencies` table with UNION ALL to deduplicate services appearing at multiple depths. The graph engine evaluates this with a depth-first traversal and memoizes visited nodes automatically.

**What it returns:** Each unique affected service paired with the minimum hop distance from the root. This is how the frontend groups cards into hop levels (Hop 1, Hop 2, ...).

---

### Q2 — Teams to Page

```cypher
MATCH (root:Service {id: $serviceId})<-[:DEPENDS_ON*1..5]-(affected:Service)
MATCH (team:Team)-[:OWNS]->(affected)
RETURN DISTINCT team, collect(affected.name) AS affectedServices
```

**Why graph-native:** This query composes two graph patterns: a traversal and a relationship lookup. In one pass, it finds all affected services AND their owning teams, grouping affected service names per team using `collect()`. In SQL this would require a multi-table join with a recursive CTE.

**What it returns:** Each unique team that has at least one affected service, with the list of their affected service names. Used to render the "Page These Teams" banner in the blast radius UI.

---

### Q3 — Historical Incidents on This Path

```cypher
MATCH (i:Incident)-[:CAUSED_BY]->(root:Service {id: $serviceId})
MATCH (i)-[:AFFECTED]->(s:Service)
RETURN i, collect(s.name) AS affectedServices
ORDER BY i.started_at DESC
```

**Why graph-native:** Incident linkage is stored as relationships, not foreign keys. The graph can answer "which incidents were caused by this service AND what did they affect?" in a single traversal across three node types.

**What it returns:** All incidents caused by the given service, each with the list of services it affected, ordered newest first. Used in the "Historical Context" section of the blast radius simulator.

---

### Q4 — Longest Dependency Chain

```cypher
MATCH path = (s:Service)-[:DEPENDS_ON*]->(t:Service)
WHERE NOT (t)-[:DEPENDS_ON]->()
RETURN s.name AS source, t.name AS sink, length(path) AS depth
ORDER BY depth DESC
LIMIT 10
```

**Why graph-native:** Finding the longest path in a graph is a graph-native problem. The `WHERE NOT (t)-[:DEPENDS_ON]->()` clause identifies **leaf nodes** (services that depend on nothing — typically databases, caches, and queues). The variable-length traversal without an upper bound finds all paths to leaves.

**What it returns:** The top 10 longest paths from any service to a leaf dependency, useful for identifying architectural depth and blast radius risk.

---

### Q5 — Service Dependency Summary

```cypher
MATCH (s:Service {id: $serviceId})
OPTIONAL MATCH (s)-[:DEPENDS_ON]->(upstream:Service)
OPTIONAL MATCH (downstream:Service)-[:DEPENDS_ON]->(s)
OPTIONAL MATCH (team:Team)-[:OWNS]->(s)
RETURN s, collect(DISTINCT upstream) AS upstream, 
       collect(DISTINCT downstream) AS downstream, team
```

**Why graph-native:** Four conceptually separate queries in SQL collapse into a single Cypher statement using `OPTIONAL MATCH`. The graph engine evaluates all four patterns in one execution plan. `collect(DISTINCT ...)` deduplicates nodes that appear in multiple matched paths.

**What it returns:** The service node itself, its direct upstream dependencies, its direct downstream dependents, and its owning team. Used in the Dependency Explorer feature.
