# BlastRadius — Data Model

> Comprehensive definition of all graph nodes, relationships, constraints, indexes, and seed data strategy.

---

## Table of Contents

1. [Node Label Definitions](#1-node-label-definitions)
2. [Relationship Type Definitions](#2-relationship-type-definitions)
3. [Graph Schema ASCII Diagram](#3-graph-schema-ascii-diagram)
4. [Constraints and Indexes](#4-constraints-and-indexes)
5. [Seed Data Generation Strategy](#5-seed-data-generation-strategy)
6. [Example Cypher Seed Snippets](#6-example-cypher-seed-snippets)

---

## 1. Node Label Definitions

### `Service`

The central node type. Represents any independently deployable unit in the microservice architecture.

| Property      | Type     | Required | Constraints | Description                                                                           |
| ------------- | -------- | -------- | ----------- | ------------------------------------------------------------------------------------- |
| `id`          | `String` | ✅ Yes   | Unique      | Kebab-case identifier. Format: `svc-<name>`. Example: `svc-auth`, `svc-redis-session` |
| `name`        | `String` | ✅ Yes   | —           | Human-readable display name. Example: `"Auth Service"`, `"Redis Session Cache"`       |
| `type`        | `String` | ✅ Yes   | Enum        | One of: `api`, `worker`, `database`, `cache`, `queue`, `gateway`                      |
| `tier`        | `String` | ✅ Yes   | Enum        | One of: `critical`, `high`, `medium`, `low`                                           |
| `description` | `String` | ✅ Yes   | —           | One-sentence description of the service's purpose                                     |
| `language`    | `String` | ✅ Yes   | —           | Primary implementation language. `"N/A"` for managed infra like Postgres, Redis       |
| `repo_url`    | `String` | ✅ Yes   | —           | GitHub URL. Empty string `""` for managed infra services                              |

**`type` Enum Values:**

| Value      | Meaning                                   |
| ---------- | ----------------------------------------- |
| `api`      | Synchronous HTTP/gRPC service             |
| `worker`   | Asynchronous background job processor     |
| `database` | Relational or document database           |
| `cache`    | In-memory cache (Redis, Memcached)        |
| `queue`    | Message broker (Kafka, RabbitMQ, SQS)     |
| `gateway`  | API gateway or BFF (Backend for Frontend) |

**`tier` Enum Values:**

| Value      | Meaning                                                    | Visual Color |
| ---------- | ---------------------------------------------------------- | ------------ |
| `critical` | Failure causes immediate user-facing outage at scale       | Red          |
| `high`     | Failure degrades a core user journey                       | Amber        |
| `medium`   | Failure degrades a secondary feature                       | Blue         |
| `low`      | Failure is contained to an internal tool or background job | Slate        |

---

### `Team`

Represents an engineering team that owns one or more services.

| Property        | Type     | Required | Constraints | Description                                                                             |
| --------------- | -------- | -------- | ----------- | --------------------------------------------------------------------------------------- |
| `id`            | `String` | ✅ Yes   | Unique      | Kebab-case identifier. Format: `team-<name>`. Example: `team-platform`, `team-identity` |
| `name`          | `String` | ✅ Yes   | —           | Human-readable team name. Example: `"Platform Engineering"`                             |
| `slack_channel` | `String` | ✅ Yes   | —           | Slack channel for oncall alerts. Example: `"#platform-oncall"`                          |
| `oncall_email`  | `String` | ✅ Yes   | —           | PagerDuty/email alias for the oncall rotation. Example: `"platform-oncall@acme.com"`    |
| `timezone`      | `String` | ✅ Yes   | —           | Team's primary timezone in IANA format. Example: `"America/New_York"`                   |

---

### `Incident`

Represents a production incident, whether active or historical.

| Property      | Type     | Required | Constraints      | Description                                                                           |
| ------------- | -------- | -------- | ---------------- | ------------------------------------------------------------------------------------- |
| `id`          | `String` | ✅ Yes   | Unique           | Format: `inc-<NNN>`. Example: `inc-001`, `inc-020`                                    |
| `title`       | `String` | ✅ Yes   | —                | Short, descriptive title. Example: `"Auth Service Outage - Token Validation Failure"` |
| `severity`    | `String` | ✅ Yes   | Enum             | One of: `SEV1`, `SEV2`, `SEV3`                                                        |
| `status`      | `String` | ✅ Yes   | Enum             | One of: `active`, `resolved`, `monitoring`                                            |
| `started_at`  | `String` | ✅ Yes   | ISO 8601         | When the incident began. Example: `"2024-09-12T02:14:00.000Z"`                        |
| `resolved_at` | `String` | ❌ No    | ISO 8601 or null | When the incident was resolved. `null` for active incidents                           |
| `description` | `String` | ✅ Yes   | —                | Detailed postmortem-style description of the incident                                 |

**`severity` Enum Values:**

| Value  | Meaning                                              |
| ------ | ---------------------------------------------------- |
| `SEV1` | Critical — complete service outage or data loss risk |
| `SEV2` | Major — significant degradation of a core feature    |
| `SEV3` | Minor — non-critical degradation, workaround exists  |

**`status` Enum Values:**

| Value        | Meaning                               |
| ------------ | ------------------------------------- |
| `active`     | Incident is ongoing                   |
| `monitoring` | Fix deployed, watching for recurrence |
| `resolved`   | Incident fully closed                 |

---

### `Deployment`

Represents a production or staging deployment event.

| Property      | Type     | Required | Constraints | Description                                                            |
| ------------- | -------- | -------- | ----------- | ---------------------------------------------------------------------- |
| `id`          | `String` | ✅ Yes   | Unique      | Format: `dep-<NNN>`. Example: `dep-001`                                |
| `version`     | `String` | ✅ Yes   | —           | Semantic version or commit SHA. Example: `"v2.4.1"`, `"sha-a3f9c12"`   |
| `deployed_at` | `String` | ✅ Yes   | ISO 8601    | When the deployment occurred                                           |
| `deployed_by` | `String` | ✅ Yes   | —           | Engineer username who triggered the deploy. Example: `"alice.johnson"` |
| `environment` | `String` | ✅ Yes   | Enum        | One of: `production`, `staging`                                        |

---

## 2. Relationship Type Definitions

### `[:DEPENDS_ON]`

**Pattern:** `(Service)-[:DEPENDS_ON]->(Service)`

Direction: The **consumer** points to the **provider**. Service A depends on Service B means A calls B.

| Property      | Type      | Required | Description                                                                                      |
| ------------- | --------- | -------- | ------------------------------------------------------------------------------------------------ |
| `criticality` | `String`  | ✅ Yes   | `"hard"` if A cannot function without B; `"soft"` if A degrades gracefully when B is unavailable |
| `latency_ms`  | `Integer` | ✅ Yes   | Expected p99 synchronous call latency in milliseconds                                            |

**Design Note:** Blast radius is found by traversing **incoming** edges to the failing service:

```cypher
MATCH (root:Service {id: $id})<-[:DEPENDS_ON*1..5]-(affected:Service)
```

This reads: "Find all services that depend on root, transitively."

---

### `[:OWNS]`

**Pattern:** `(Team)-[:OWNS]->(Service)`

No properties. Each Service has exactly one owning Team. Teams may own multiple Services (3–5 in seed data).

---

### `[:CAUSED_BY]`

**Pattern:** `(Incident)-[:CAUSED_BY]->(Service)`

No properties. Each Incident has exactly one root cause Service. The root cause is the Service whose failure triggered
the incident chain.

---

### `[:AFFECTED]`

**Pattern:** `(Incident)-[:AFFECTED]->(Service)`

No properties. An Incident may have many AFFECTED relationships — one per Service that was degraded or unavailable
during the incident. The root cause Service is also listed as AFFECTED (it was also down). This relationship is what
powers the "has this path failed before?" historical context query.

---

### `[:DEPLOYED_TO]`

**Pattern:** `(Deployment)-[:DEPLOYED_TO]->(Service)`

No properties. Links a deployment event to the service that was deployed. A Deployment has exactly one DEPLOYED_TO
relationship.

---

### `[:TRIGGERED]`

**Pattern:** `(Deployment)-[:TRIGGERED]->(Incident)`

No properties. Optional relationship linking a bad deployment to the incident it caused. Only 5 of the 20 seed incidents
are linked to deployments (the rest are caused by load events, infrastructure failures, or external factors).

---

## 3. Graph Schema ASCII Diagram

```
╔══════════════════════════════════════════════════════════════════╗
║                    BlastRadius Graph Schema                      ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║   ┌────────────┐          [:DEPLOYED_TO]                         ║
║   │ Deployment │─────────────────────────────────┐              ║
║   └─────┬──────┘                                 │              ║
║         │ [:TRIGGERED]                            ▼              ║
║         │                              ┌────────────────┐        ║
║         │         [:DEPENDS_ON]        │    Service     │        ║
║         │      (self-referencing)      │                │        ║
║         │      ┌──────────────────┐    │  id            │        ║
║         │      │                  │    │  name          │        ║
║         │      ▼                  │    │  type          │        ║
║         │   ┌──┴─────────────┐    │    │  tier          │        ║
║         │   │    Service     │────┘    │  description   │        ║
║         │   │                │         │  language      │        ║
║         │   └────────────────┘         │  repo_url      │        ║
║         │          ▲                   └───────┬────────┘        ║
║         │          │ [:OWNS]                   │                 ║
║         │          │                           │                 ║
║         │   ┌──────┴──────┐         [:CAUSED_BY] & [:AFFECTED]   ║
║         │   │    Team     │                   │                  ║
║         │   │             │                   ▼                  ║
║         │   │  id         │         ┌─────────────────┐          ║
║         │   │  name       │         │    Incident     │          ║
║         │   │  slack_channel        │                 │◄─────────┘
║         │   │  oncall_email│        │  id             │
║         │   │  timezone   │         │  title          │
║         │   └─────────────┘         │  severity       │
║         │                           │  status         │
║         └───────────────────────────│  started_at     │
║                 [:TRIGGERED]        │  resolved_at    │
║                                     │  description    │
║                                     └─────────────────┘
╚══════════════════════════════════════════════════════════════════╝

Relationship summary:
  Service ──[:DEPENDS_ON]──► Service    (many-to-many, has properties)
  Team    ──[:OWNS]────────► Service    (many-to-one)
  Incident──[:CAUSED_BY]──► Service    (many-to-one)
  Incident──[:AFFECTED]───► Service    (many-to-many)
  Deployment──[:DEPLOYED_TO]►Service   (many-to-one)
  Deployment──[:TRIGGERED]──►Incident  (optional, one-to-one)
```

---

## 4. Constraints and Indexes

Run these Cypher statements during DB setup (in the seed script's `createConstraints` runner).

### Uniqueness Constraints

```cypher
-- Ensure no two Services share the same id
CREATE CONSTRAINT service_id_unique IF NOT EXISTS
FOR (s:Service) REQUIRE s.id IS UNIQUE;

-- Ensure no two Teams share the same id
CREATE CONSTRAINT team_id_unique IF NOT EXISTS
FOR (t:Team) REQUIRE t.id IS UNIQUE;

-- Ensure no two Incidents share the same id
CREATE CONSTRAINT incident_id_unique IF NOT EXISTS
FOR (i:Incident) REQUIRE i.id IS UNIQUE;

-- Ensure no two Deployments share the same id
CREATE CONSTRAINT deployment_id_unique IF NOT EXISTS
FOR (d:Deployment) REQUIRE d.id IS UNIQUE;
```

### Indexes for Query Performance

```cypher
-- Blast radius query filters on Service.id (already covered by UNIQUE constraint)
-- Additional index on type for filter queries
CREATE INDEX service_type_idx IF NOT EXISTS
FOR (s:Service) ON (s.type);

-- Index on tier for filter queries
CREATE INDEX service_tier_idx IF NOT EXISTS
FOR (s:Service) ON (s.tier);

-- Index on Incident status for filtering active incidents
CREATE INDEX incident_status_idx IF NOT EXISTS
FOR (i:Incident) ON (i.status);

-- Index on Incident started_at for time-ordered queries
CREATE INDEX incident_started_at_idx IF NOT EXISTS
FOR (i:Incident) ON (i.started_at);

-- Index on Incident severity for filtering
CREATE INDEX incident_severity_idx IF NOT EXISTS
FOR (i:Incident) ON (i.severity);
```

---

## 5. Seed Data Generation Strategy

### Overview

The seed data must create a **realistic microservice architecture** with a dependency topology that naturally produces
meaningful blast radius chains. The goal is to have at least one 4-hop chain and demonstrate how shared foundational
services (auth, cache, DB) create wide blast radii.

### The 10 Teams

Each team owns a realistic domain:

| Team ID              | Team Name               | Domain                            | Services Owned |
| -------------------- | ----------------------- | --------------------------------- | -------------- |
| `team-platform`      | Platform Engineering    | Infrastructure, gateways          | 5 services     |
| `team-identity`      | Identity & Access       | Auth, sessions, SSO               | 3 services     |
| `team-commerce`      | Commerce                | Orders, cart, checkout            | 5 services     |
| `team-payments`      | Payments                | Payment processing, billing       | 4 services     |
| `team-notifications` | Notifications           | Email, SMS, push                  | 4 services     |
| `team-search`        | Search & Discovery      | Search, recommendations           | 4 services     |
| `team-inventory`     | Inventory & Fulfillment | Stock, shipping, warehousing      | 4 services     |
| `team-data`          | Data & Analytics        | Events, analytics, ML pipelines   | 5 services     |
| `team-user`          | User Experience         | User profiles, preferences        | 3 services     |
| `team-ml`            | Machine Learning        | Inference, feature store, ranking | 3 services     |

**Total: 40 services**

### The 40 Services (by category)

**Gateways & BFFs (4 services):**

- `svc-api-gateway` — API Gateway (gateway, critical, Go)
- `svc-bff-web` — Web BFF (gateway, high, TypeScript)
- `svc-bff-mobile` — Mobile BFF (gateway, high, TypeScript)
- `svc-graphql-gateway` — GraphQL Gateway (gateway, high, TypeScript)

**Auth & Identity (3 services):**

- `svc-auth` — Auth Service (api, critical, TypeScript)
- `svc-session-store` — Session Store (cache, critical, N/A — Redis)
- `svc-sso` — SSO Service (api, high, Python)

**Commerce (5 services):**

- `svc-order-api` — Order API (api, high, Java)
- `svc-cart` — Cart Service (api, high, TypeScript)
- `svc-checkout` — Checkout Service (api, high, TypeScript)
- `svc-pricing` — Pricing Service (api, medium, Python)
- `svc-coupon` — Coupon Service (api, low, TypeScript)

**Payments (4 services):**

- `svc-payment-gateway` — Payment Gateway (api, critical, Java)
- `svc-payment-processor` — Payment Processor (worker, critical, Java)
- `svc-billing` — Billing Service (api, high, TypeScript)
- `svc-fraud-detection` — Fraud Detection (api, high, Python)

**Notifications (4 services):**

- `svc-notification-api` — Notification API (api, medium, TypeScript)
- `svc-email-worker` — Email Worker (worker, medium, Python)
- `svc-sms-worker` — SMS Worker (worker, low, Python)
- `svc-push-worker` — Push Notification Worker (worker, low, Go)

**Search & Discovery (4 services):**

- `svc-search-api` — Search API (api, high, Go)
- `svc-search-indexer` — Search Indexer (worker, medium, Python)
- `svc-recommendation-api` — Recommendation API (api, medium, Python)
- `svc-catalog` — Product Catalog Service (api, high, TypeScript)

**Inventory & Fulfillment (4 services):**

- `svc-inventory` — Inventory Service (api, high, Python)
- `svc-warehouse` — Warehouse Service (api, medium, Java)
- `svc-shipping` — Shipping Service (api, medium, TypeScript)
- `svc-tracking` — Order Tracking Service (api, low, TypeScript)

**Data & Analytics (5 services):**

- `svc-event-bus` — Event Bus (queue, critical, N/A — Kafka)
- `svc-analytics-api` — Analytics API (api, medium, Python)
- `svc-analytics-worker` — Analytics Worker (worker, low, Python)
- `svc-data-warehouse` — Data Warehouse (database, medium, N/A — BigQuery)
- `svc-stream-processor` — Stream Processor (worker, medium, Scala)

**User Experience (3 services):**

- `svc-user-profile` — User Profile Service (api, high, TypeScript)
- `svc-user-preferences` — User Preferences Service (api, medium, TypeScript)
- `svc-avatar` — Avatar Service (api, low, Go)

**Shared Infrastructure (3 services — owned by Platform):**

- `svc-postgres-main` — Main Postgres (database, critical, N/A)
- `svc-redis-cache` — Redis Cache (cache, critical, N/A)
- `svc-kafka` — Kafka Cluster (queue, critical, N/A)

**ML (3 services):**

- `svc-ml-inference` — ML Inference Service (api, high, Python)
- `svc-feature-store` — Feature Store (database, high, Python)
- `svc-ranking` — Ranking Service (api, medium, Python)

### Dependency Topology Design

The topology is designed in layers, creating a natural cascade from gateways down to shared infrastructure:

```
Layer 0 (Gateways — nothing depends on these externally):
  svc-api-gateway, svc-bff-web, svc-bff-mobile, svc-graphql-gateway

Layer 1 (Domain APIs — depended on by gateways):
  svc-auth, svc-order-api, svc-cart, svc-checkout, svc-search-api,
  svc-user-profile, svc-recommendation-api, svc-catalog, svc-payment-gateway

Layer 2 (Supporting APIs — depended on by Layer 1):
  svc-inventory, svc-pricing, svc-fraud-detection, svc-billing,
  svc-notification-api, svc-ml-inference, svc-ranking

Layer 3 (Workers and secondary APIs — depended on by Layer 2):
  svc-email-worker, svc-sms-worker, svc-push-worker, svc-warehouse,
  svc-shipping, svc-search-indexer, svc-analytics-api, svc-feature-store,
  svc-stream-processor, svc-sso, svc-coupon

Layer 4 (Shared Infrastructure — depended on by everything):
  svc-postgres-main, svc-redis-cache, svc-kafka, svc-session-store,
  svc-event-bus, svc-data-warehouse
```

**Key dependency rules to ensure realistic blast radii:**

1. **`svc-auth`** is depended on by: `svc-api-gateway`, `svc-bff-web`, `svc-bff-mobile`, `svc-graphql-gateway`,
   `svc-order-api`, `svc-checkout`, `svc-payment-gateway`, `svc-user-profile`, `svc-search-api`, `svc-cart`, and more.
   This gives auth a blast radius of 20+ services.

2. **`svc-postgres-main`** is depended on by: `svc-auth`, `svc-order-api`, `svc-user-profile`, `svc-inventory`,
   `svc-billing`, `svc-cart`. This creates chains of depth 4 (postgres → auth → gateway → BFF).

3. **`svc-redis-cache`** is depended on by: `svc-auth`, `svc-session-store` context, `svc-cart`, `svc-catalog`,
   `svc-search-api`. Failure cascades through auth to all auth-dependent services.

4. **`svc-event-bus`** is depended on by workers and stream processors, creating a separate blast radius chain for async
   services.

5. At least two chains of depth ≥ 4 must exist. Example: `svc-bff-mobile` → `svc-checkout` → `svc-auth` →
   `svc-redis-cache` (depth 4).

### Dependency Criticality Rules

- All gateway-to-API dependencies: `criticality: "hard"` (gateways fail without auth/APIs)
- API-to-database dependencies: `criticality: "hard"` (APIs cannot function without their DB)
- API-to-cache dependencies: `criticality: "soft"` (APIs can work without cache, but slower)
- API-to-notification dependencies: `criticality: "soft"` (notifications are fire-and-forget)
- API-to-analytics dependencies: `criticality: "soft"` (analytics is non-critical path)

### The 20 Incidents

| Count | Severity | Status     | Root Cause Domain                                                     |
| ----- | -------- | ---------- | --------------------------------------------------------------------- |
| 3     | SEV1     | resolved   | auth, payment-gateway, postgres-main                                  |
| 2     | SEV1     | active     | auth (current outage), api-gateway                                    |
| 6     | SEV2     | resolved   | order-api, checkout, inventory, search-api, redis-cache, ml-inference |
| 2     | SEV2     | monitoring | notification-api, billing                                             |
| 5     | SEV3     | resolved   | pricing, coupon, avatar, analytics-worker, sms-worker                 |
| 2     | SEV3     | active     | tracking, push-worker                                                 |

**Total: 20 incidents**

Each incident has:

- 1 `CAUSED_BY` relationship to the root cause service
- 2–18 `AFFECTED` relationships depending on severity (SEV1 = many affected, SEV3 = few)

### The 15 Deployments

- 10 clean deployments (no incident triggered)
- 5 deployments with `[:TRIGGERED]` relationships to incidents (the bad deploys)
- Bad deploys are distributed across: auth (1), payment-gateway (1), order-api (1), checkout (1), search-indexer (1)
- Deployments span the past 6 months, from most to least recent

### MERGE Strategy for Idempotency

All seed statements use `MERGE` instead of `CREATE` to allow re-seeding without duplicating data. For nodes, MERGE on
the `id` property. For relationships, MERGE on the pattern.

```cypher
MERGE (s:Service {id: 'svc-auth'})
SET s.name = 'Auth Service',
    s.type = 'api',
    s.tier = 'critical',
    ...

MERGE (svc_checkout:Service {id: 'svc-checkout'})
MERGE (svc_auth:Service {id: 'svc-auth'})
MERGE (svc_checkout)-[r:DEPENDS_ON]->(svc_auth)
SET r.criticality = 'hard',
    r.latency_ms = 45
```

---

## 6. Example Cypher Seed Snippets

### Example 1: Creating a Team Node

```cypher
MERGE (t:Team {id: 'team-platform'})
SET t.name = 'Platform Engineering',
    t.slack_channel = '#platform-oncall',
    t.oncall_email = 'platform-oncall@acme.com',
    t.timezone = 'America/New_York'
RETURN t;
```

### Example 2: Creating a Service Node and Linking to Team

```cypher
MERGE (s:Service {id: 'svc-api-gateway'})
SET s.name = 'API Gateway',
    s.type = 'gateway',
    s.tier = 'critical',
    s.description = 'Primary ingress point for all external traffic. Routes requests to upstream services, enforces rate limiting and TLS termination.',
    s.language = 'Go',
    s.repo_url = 'https://github.com/acme/api-gateway';

MERGE (t:Team {id: 'team-platform'})
MERGE (t)-[:OWNS]->(s);
```

### Example 3: Creating a DEPENDS_ON Relationship

```cypher
MATCH (consumer:Service {id: 'svc-api-gateway'})
MATCH (provider:Service {id: 'svc-auth'})
MERGE (consumer)-[r:DEPENDS_ON]->(provider)
SET r.criticality = 'hard',
    r.latency_ms = 12;
```

### Example 4: Creating an Incident with CAUSED_BY and AFFECTED

```cypher
MERGE (i:Incident {id: 'inc-001'})
SET i.title = 'Auth Service Outage - Token Validation Failure',
    i.severity = 'SEV1',
    i.status = 'resolved',
    i.started_at = '2024-09-12T02:14:00.000Z',
    i.resolved_at = '2024-09-12T04:47:00.000Z',
    i.description = 'Redis cache exhaustion caused auth token validation to fail across all services. Root cause was a missing TTL on session tokens causing unbounded cache growth. Resolved by flushing Redis and deploying hotfix v3.12.1.';

MATCH (root:Service {id: 'svc-auth'})
MERGE (i)-[:CAUSED_BY]->(root);

MATCH (affected:Service)
WHERE affected.id IN [
  'svc-auth',
  'svc-api-gateway',
  'svc-bff-web',
  'svc-bff-mobile',
  'svc-graphql-gateway',
  'svc-order-api',
  'svc-checkout',
  'svc-payment-gateway',
  'svc-search-api',
  'svc-user-profile',
  'svc-cart',
  'svc-recommendation-api',
  'svc-catalog',
  'svc-billing',
  'svc-inventory',
  'svc-notification-api',
  'svc-pricing',
  'svc-fraud-detection'
]
MERGE (i)-[:AFFECTED]->(affected);
```

### Example 5: Creating a Deployment and Linking to Incident

```cypher
MERGE (d:Deployment {id: 'dep-007'})
SET d.version = 'v3.12.0',
    d.deployed_at = '2024-09-12T01:58:00.000Z',
    d.deployed_by = 'alice.johnson',
    d.environment = 'production';

MATCH (s:Service {id: 'svc-auth'})
MERGE (d)-[:DEPLOYED_TO]->(s);

MATCH (i:Incident {id: 'inc-001'})
MERGE (d)-[:TRIGGERED]->(i);
```
