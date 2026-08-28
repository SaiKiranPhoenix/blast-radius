# BlastRadius — API Reference

> All endpoints return JSON. All responses are wrapped in `{ "success": boolean, "data": T }` on success, or `{ "success": false, "error": { "code": string, "message": string } }` on failure.

**Base URL (development):** `http://localhost:3001`  
**Base URL (production):** `https://blast-radius-api.railway.app`

---

## Table of Contents

1. [Common Types](#1-common-types)
2. [GET /health](#2-get-health)
3. [GET /api/services](#3-get-apiservices)
4. [GET /api/services/:id](#4-get-apiservicesid)
5. [GET /api/services/:id/blast-radius](#5-get-apiservicesidblast-radius)
6. [GET /api/services/:id/dependencies](#6-get-apiservicesiddependencies)
7. [GET /api/teams](#7-get-apiteams)
8. [GET /api/teams/:id](#8-get-apiteamsid)
9. [GET /api/incidents](#9-get-apiincidents)
10. [GET /api/incidents/:id](#10-get-apiincidentsid)
11. [GET /api/graph/longest-chain](#11-get-apigraphlongest-chain)
12. [Error Reference](#12-error-reference)

---

## 1. Common Types

These TypeScript interfaces are used across multiple endpoints. They represent the shapes returned by the API.

```typescript
// ─── Shared wrapper types ───────────────────────────────────────

interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Service types ───────────────────────────────────────────────

type ServiceType = 'api' | 'worker' | 'database' | 'cache' | 'queue' | 'gateway';
type ServiceTier = 'critical' | 'high' | 'medium' | 'low';

interface ServiceSummary {
  id: string;
  name: string;
  type: ServiceType;
  tier: ServiceTier;
  description: string;
  language: string;
  repo_url: string;
  dependencyCount: number;      // number of services this service directly depends on
  dependentCount: number;       // number of services that directly depend on this service
  team: TeamSummary | null;
}

interface ServiceDetail extends ServiceSummary {
  // All fields from ServiceSummary plus inline team detail
}

// ─── Team types ──────────────────────────────────────────────────

interface TeamSummary {
  id: string;
  name: string;
  slack_channel: string;
  oncall_email: string;
  timezone: string;
}

interface TeamDetail extends TeamSummary {
  services: ServiceSummary[];
  activeIncidents: IncidentSummary[];
}

// ─── Incident types ──────────────────────────────────────────────

type IncidentSeverity = 'SEV1' | 'SEV2' | 'SEV3';
type IncidentStatus = 'active' | 'resolved' | 'monitoring';

interface IncidentSummary {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  started_at: string;           // ISO 8601
  resolved_at: string | null;   // ISO 8601, null if not resolved
  description: string;
  affectedServiceCount: number;
  rootCauseService: ServiceSummary | null;
}

interface IncidentDetail extends IncidentSummary {
  affectedServices: ServiceSummary[];
  triggeredBy: DeploymentSummary | null;
}

// ─── Deployment types ────────────────────────────────────────────

interface DeploymentSummary {
  id: string;
  version: string;
  deployed_at: string;          // ISO 8601
  deployed_by: string;
  environment: 'production' | 'staging';
}

// ─── Blast radius types ──────────────────────────────────────────

interface BlastRadiusHop {
  hop: number;                  // 1-indexed hop distance from failing service
  services: ServiceSummary[];
}

interface BlastRadiusResult {
  rootService: ServiceSummary;
  hops: BlastRadiusHop[];
  totalAffected: number;
  teamsToPage: TeamWithAffectedServices[];
  historicalIncidents: IncidentSummary[];
}

interface TeamWithAffectedServices {
  team: TeamSummary;
  affectedServices: string[];   // service names
}

// ─── Dependency types ────────────────────────────────────────────

interface DependencyResult {
  service: ServiceSummary;
  upstream: ServiceSummary[];   // services this one depends on (outgoing DEPENDS_ON)
  downstream: ServiceSummary[]; // services that depend on this one (incoming DEPENDS_ON)
  team: TeamSummary | null;
  incidents: IncidentSummary[]; // incidents this service caused
}

// ─── Graph analytics types ───────────────────────────────────────

interface LongestChainEntry {
  source: string;               // service name at the top of the chain
  sink: string;                 // leaf service name at the bottom
  depth: number;                // number of hops
}
```

---

## 2. GET /health

**Description:** Health check. Returns server status and database connectivity.  
**Auth:** None  
**Use case:** Railway health check probe, uptime monitoring.

### Request

```
GET /health
```

No parameters.

### Response (200 — Healthy)

```typescript
interface HealthResponse {
  status: 'ok' | 'degraded';
  timestamp: string;            // ISO 8601
  database: {
    connected: boolean;
    latencyMs: number | null;
  };
  uptime: number;               // process uptime in seconds
}
```

```json
{
  "status": "ok",
  "timestamp": "2024-11-15T14:30:00.000Z",
  "database": {
    "connected": true,
    "latencyMs": 12
  },
  "uptime": 3842
}
```

### Response (503 — DB Unreachable)

```json
{
  "status": "degraded",
  "timestamp": "2024-11-15T14:30:00.000Z",
  "database": {
    "connected": false,
    "latencyMs": null
  },
  "uptime": 3842
}
```

> Note: The health endpoint always returns 200 with `status: "degraded"` when the DB is unreachable rather than returning 503, so Railway does not restart the pod unnecessarily. Railway's health check only fails if the endpoint itself is unreachable (process crash).

---

## 3. GET /api/services

**Description:** Returns all 40 services with their owning team and dependency counts. Suitable for rendering the Service Map.  
**Auth:** None

### Request

```
GET /api/services
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | `ServiceType` | No | Filter by service type |
| `tier` | `ServiceTier` | No | Filter by service tier |
| `teamId` | `string` | No | Filter by owning team ID |

**Example request:**
```
GET /api/services?tier=critical
GET /api/services?type=database
GET /api/services?teamId=team-platform
```

### Response (200)

```typescript
interface GetServicesResponse {
  services: ServiceSummary[];
  total: number;
}
```

```json
{
  "success": true,
  "data": {
    "services": [
      {
        "id": "svc-api-gateway",
        "name": "API Gateway",
        "type": "gateway",
        "tier": "critical",
        "description": "Primary ingress point for all external traffic",
        "language": "Go",
        "repo_url": "https://github.com/acme/api-gateway",
        "dependencyCount": 4,
        "dependentCount": 0,
        "team": {
          "id": "team-platform",
          "name": "Platform Engineering",
          "slack_channel": "#platform-oncall",
          "oncall_email": "platform-oncall@acme.com",
          "timezone": "America/New_York"
        }
      },
      {
        "id": "svc-auth",
        "name": "Auth Service",
        "type": "api",
        "tier": "critical",
        "description": "Handles authentication and authorization for all services",
        "language": "TypeScript",
        "repo_url": "https://github.com/acme/auth-service",
        "dependencyCount": 2,
        "dependentCount": 18,
        "team": {
          "id": "team-identity",
          "name": "Identity & Access",
          "slack_channel": "#identity-oncall",
          "oncall_email": "identity-oncall@acme.com",
          "timezone": "America/Los_Angeles"
        }
      }
    ],
    "total": 40
  }
}
```

### Error Responses

| Status | Code | Condition |
|--------|------|-----------|
| 400 | `VALIDATION_ERROR` | Invalid `type` or `tier` filter value |
| 503 | `DB_CONNECTION_ERROR` | Database is unavailable |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

---

## 4. GET /api/services/:id

**Description:** Returns full details for a single service, including its team.  
**Auth:** None

### Request

```
GET /api/services/:id
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Service ID (e.g. `svc-auth`) |

**Example request:**
```
GET /api/services/svc-auth
```

### Response (200)

```typescript
type GetServiceResponse = ServiceDetail;
```

```json
{
  "success": true,
  "data": {
    "id": "svc-auth",
    "name": "Auth Service",
    "type": "api",
    "tier": "critical",
    "description": "Handles authentication and authorization for all services",
    "language": "TypeScript",
    "repo_url": "https://github.com/acme/auth-service",
    "dependencyCount": 2,
    "dependentCount": 18,
    "team": {
      "id": "team-identity",
      "name": "Identity & Access",
      "slack_channel": "#identity-oncall",
      "oncall_email": "identity-oncall@acme.com",
      "timezone": "America/Los_Angeles"
    }
  }
}
```

### Error Responses

| Status | Code | Condition |
|--------|------|-----------|
| 404 | `SERVICE_NOT_FOUND` | No service with given ID exists |
| 503 | `DB_CONNECTION_ERROR` | Database is unavailable |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

```json
{
  "success": false,
  "error": {
    "code": "SERVICE_NOT_FOUND",
    "message": "No service found with id: svc-nonexistent"
  }
}
```

---

## 5. GET /api/services/:id/blast-radius

**Description:** Computes the full blast radius for a failing service. Returns affected services grouped by hop, teams to page, and historical incidents that followed the same failure path. This is the core query of the application.  
**Auth:** None

### Request

```
GET /api/services/:id/blast-radius
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | ID of the failing service |

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `maxHops` | `number` | No | `5` | Maximum traversal depth (1–10) |

**Example request:**
```
GET /api/services/svc-auth/blast-radius
GET /api/services/svc-auth/blast-radius?maxHops=3
```

### Response (200)

```typescript
type GetBlastRadiusResponse = BlastRadiusResult;
```

```json
{
  "success": true,
  "data": {
    "rootService": {
      "id": "svc-auth",
      "name": "Auth Service",
      "type": "api",
      "tier": "critical",
      "description": "Handles authentication and authorization for all services",
      "language": "TypeScript",
      "repo_url": "https://github.com/acme/auth-service",
      "dependencyCount": 2,
      "dependentCount": 18,
      "team": {
        "id": "team-identity",
        "name": "Identity & Access",
        "slack_channel": "#identity-oncall",
        "oncall_email": "identity-oncall@acme.com",
        "timezone": "America/Los_Angeles"
      }
    },
    "hops": [
      {
        "hop": 1,
        "services": [
          {
            "id": "svc-api-gateway",
            "name": "API Gateway",
            "type": "gateway",
            "tier": "critical",
            "description": "Primary ingress point for all external traffic",
            "language": "Go",
            "repo_url": "https://github.com/acme/api-gateway",
            "dependencyCount": 4,
            "dependentCount": 0,
            "team": {
              "id": "team-platform",
              "name": "Platform Engineering",
              "slack_channel": "#platform-oncall",
              "oncall_email": "platform-oncall@acme.com",
              "timezone": "America/New_York"
            }
          },
          {
            "id": "svc-order-api",
            "name": "Order API",
            "type": "api",
            "tier": "high",
            "description": "Manages order creation and lifecycle",
            "language": "Java",
            "repo_url": "https://github.com/acme/order-api",
            "dependencyCount": 5,
            "dependentCount": 3,
            "team": {
              "id": "team-commerce",
              "name": "Commerce",
              "slack_channel": "#commerce-oncall",
              "oncall_email": "commerce-oncall@acme.com",
              "timezone": "America/Chicago"
            }
          }
        ]
      },
      {
        "hop": 2,
        "services": [
          {
            "id": "svc-checkout",
            "name": "Checkout Service",
            "type": "api",
            "tier": "high",
            "description": "Orchestrates the checkout flow",
            "language": "TypeScript",
            "repo_url": "https://github.com/acme/checkout-service",
            "dependencyCount": 6,
            "dependentCount": 1,
            "team": {
              "id": "team-commerce",
              "name": "Commerce",
              "slack_channel": "#commerce-oncall",
              "oncall_email": "commerce-oncall@acme.com",
              "timezone": "America/Chicago"
            }
          }
        ]
      }
    ],
    "totalAffected": 23,
    "teamsToPage": [
      {
        "team": {
          "id": "team-platform",
          "name": "Platform Engineering",
          "slack_channel": "#platform-oncall",
          "oncall_email": "platform-oncall@acme.com",
          "timezone": "America/New_York"
        },
        "affectedServices": ["API Gateway", "BFF Web"]
      },
      {
        "team": {
          "id": "team-commerce",
          "name": "Commerce",
          "slack_channel": "#commerce-oncall",
          "oncall_email": "commerce-oncall@acme.com",
          "timezone": "America/Chicago"
        },
        "affectedServices": ["Order API", "Checkout Service", "Cart Service"]
      }
    ],
    "historicalIncidents": [
      {
        "id": "inc-001",
        "title": "Auth Service Outage - Token Validation Failure",
        "severity": "SEV1",
        "status": "resolved",
        "started_at": "2024-09-12T02:14:00.000Z",
        "resolved_at": "2024-09-12T04:47:00.000Z",
        "description": "Redis cache exhaustion caused auth token validation to fail",
        "affectedServiceCount": 18,
        "rootCauseService": {
          "id": "svc-auth",
          "name": "Auth Service",
          "type": "api",
          "tier": "critical",
          "description": "Handles authentication and authorization",
          "language": "TypeScript",
          "repo_url": "https://github.com/acme/auth-service",
          "dependencyCount": 2,
          "dependentCount": 18,
          "team": null
        }
      }
    ]
  }
}
```

### Error Responses

| Status | Code | Condition |
|--------|------|-----------|
| 404 | `SERVICE_NOT_FOUND` | No service with given ID exists |
| 400 | `VALIDATION_ERROR` | `maxHops` is not between 1 and 10 |
| 503 | `DB_CONNECTION_ERROR` | Database is unavailable |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

---

## 6. GET /api/services/:id/dependencies

**Description:** Returns the immediate upstream dependencies and downstream dependents for a service, plus its owning team and incidents it caused. Used by the Dependency Explorer.  
**Auth:** None

### Request

```
GET /api/services/:id/dependencies
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Service ID |

**Example request:**
```
GET /api/services/svc-order-api/dependencies
```

### Response (200)

```typescript
type GetDependenciesResponse = DependencyResult;
```

```json
{
  "success": true,
  "data": {
    "service": {
      "id": "svc-order-api",
      "name": "Order API",
      "type": "api",
      "tier": "high",
      "description": "Manages order creation and lifecycle",
      "language": "Java",
      "repo_url": "https://github.com/acme/order-api",
      "dependencyCount": 5,
      "dependentCount": 3,
      "team": {
        "id": "team-commerce",
        "name": "Commerce",
        "slack_channel": "#commerce-oncall",
        "oncall_email": "commerce-oncall@acme.com",
        "timezone": "America/Chicago"
      }
    },
    "upstream": [
      {
        "id": "svc-auth",
        "name": "Auth Service",
        "type": "api",
        "tier": "critical",
        "description": "Handles authentication and authorization",
        "language": "TypeScript",
        "repo_url": "https://github.com/acme/auth-service",
        "dependencyCount": 2,
        "dependentCount": 18,
        "team": null
      },
      {
        "id": "svc-postgres-orders",
        "name": "Orders Postgres",
        "type": "database",
        "tier": "critical",
        "description": "Primary relational store for order data",
        "language": "N/A",
        "repo_url": "",
        "dependencyCount": 0,
        "dependentCount": 4,
        "team": null
      }
    ],
    "downstream": [
      {
        "id": "svc-checkout",
        "name": "Checkout Service",
        "type": "api",
        "tier": "high",
        "description": "Orchestrates the checkout flow",
        "language": "TypeScript",
        "repo_url": "https://github.com/acme/checkout-service",
        "dependencyCount": 6,
        "dependentCount": 1,
        "team": null
      }
    ],
    "team": {
      "id": "team-commerce",
      "name": "Commerce",
      "slack_channel": "#commerce-oncall",
      "oncall_email": "commerce-oncall@acme.com",
      "timezone": "America/Chicago"
    },
    "incidents": [
      {
        "id": "inc-008",
        "title": "Order API DB Connection Pool Exhaustion",
        "severity": "SEV2",
        "status": "resolved",
        "started_at": "2024-10-03T11:22:00.000Z",
        "resolved_at": "2024-10-03T12:45:00.000Z",
        "description": "DB connection pool exhausted under Black Friday load",
        "affectedServiceCount": 4,
        "rootCauseService": null
      }
    ]
  }
}
```

### Error Responses

| Status | Code | Condition |
|--------|------|-----------|
| 404 | `SERVICE_NOT_FOUND` | No service with given ID |
| 503 | `DB_CONNECTION_ERROR` | Database is unavailable |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

---

## 7. GET /api/teams

**Description:** Returns all 10 teams with their service counts and active incident counts.  
**Auth:** None

### Request

```
GET /api/teams
```

No parameters.

### Response (200)

```typescript
interface GetTeamsResponse {
  teams: TeamSummaryWithCounts[];
  total: number;
}

interface TeamSummaryWithCounts extends TeamSummary {
  serviceCount: number;
  activeIncidentCount: number;
}
```

```json
{
  "success": true,
  "data": {
    "teams": [
      {
        "id": "team-platform",
        "name": "Platform Engineering",
        "slack_channel": "#platform-oncall",
        "oncall_email": "platform-oncall@acme.com",
        "timezone": "America/New_York",
        "serviceCount": 5,
        "activeIncidentCount": 1
      },
      {
        "id": "team-identity",
        "name": "Identity & Access",
        "slack_channel": "#identity-oncall",
        "oncall_email": "identity-oncall@acme.com",
        "timezone": "America/Los_Angeles",
        "serviceCount": 3,
        "activeIncidentCount": 0
      },
      {
        "id": "team-commerce",
        "name": "Commerce",
        "slack_channel": "#commerce-oncall",
        "oncall_email": "commerce-oncall@acme.com",
        "timezone": "America/Chicago",
        "serviceCount": 5,
        "activeIncidentCount": 2
      }
    ],
    "total": 10
  }
}
```

### Error Responses

| Status | Code | Condition |
|--------|------|-----------|
| 503 | `DB_CONNECTION_ERROR` | Database is unavailable |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

---

## 8. GET /api/teams/:id

**Description:** Returns full detail for a team, including all owned services and active incidents.  
**Auth:** None

### Request

```
GET /api/teams/:id
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Team ID (e.g. `team-platform`) |

**Example request:**
```
GET /api/teams/team-commerce
```

### Response (200)

```typescript
type GetTeamResponse = TeamDetail;
```

```json
{
  "success": true,
  "data": {
    "id": "team-commerce",
    "name": "Commerce",
    "slack_channel": "#commerce-oncall",
    "oncall_email": "commerce-oncall@acme.com",
    "timezone": "America/Chicago",
    "services": [
      {
        "id": "svc-order-api",
        "name": "Order API",
        "type": "api",
        "tier": "high",
        "description": "Manages order creation and lifecycle",
        "language": "Java",
        "repo_url": "https://github.com/acme/order-api",
        "dependencyCount": 5,
        "dependentCount": 3,
        "team": null
      },
      {
        "id": "svc-checkout",
        "name": "Checkout Service",
        "type": "api",
        "tier": "high",
        "description": "Orchestrates the checkout flow",
        "language": "TypeScript",
        "repo_url": "https://github.com/acme/checkout-service",
        "dependencyCount": 6,
        "dependentCount": 1,
        "team": null
      }
    ],
    "activeIncidents": [
      {
        "id": "inc-015",
        "title": "Checkout latency spike - P99 > 5s",
        "severity": "SEV2",
        "status": "active",
        "started_at": "2024-11-15T09:12:00.000Z",
        "resolved_at": null,
        "description": "Downstream inventory service degradation causing checkout timeouts",
        "affectedServiceCount": 3,
        "rootCauseService": null
      }
    ]
  }
}
```

### Error Responses

| Status | Code | Condition |
|--------|------|-----------|
| 404 | `TEAM_NOT_FOUND` | No team with given ID |
| 503 | `DB_CONNECTION_ERROR` | Database is unavailable |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

---

## 9. GET /api/incidents

**Description:** Returns all 20 incidents sorted by `started_at` descending. Includes affected service count and root cause service.  
**Auth:** None

### Request

```
GET /api/incidents
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | `IncidentStatus` | No | Filter by status (`active`, `resolved`, `monitoring`) |
| `severity` | `IncidentSeverity` | No | Filter by severity (`SEV1`, `SEV2`, `SEV3`) |

**Example request:**
```
GET /api/incidents
GET /api/incidents?status=active
GET /api/incidents?severity=SEV1
GET /api/incidents?status=resolved&severity=SEV2
```

### Response (200)

```typescript
interface GetIncidentsResponse {
  incidents: IncidentSummary[];
  total: number;
}
```

```json
{
  "success": true,
  "data": {
    "incidents": [
      {
        "id": "inc-015",
        "title": "Checkout latency spike - P99 > 5s",
        "severity": "SEV2",
        "status": "active",
        "started_at": "2024-11-15T09:12:00.000Z",
        "resolved_at": null,
        "description": "Downstream inventory service degradation causing checkout timeouts",
        "affectedServiceCount": 3,
        "rootCauseService": {
          "id": "svc-inventory",
          "name": "Inventory Service",
          "type": "api",
          "tier": "high",
          "description": "Tracks product stock levels",
          "language": "Python",
          "repo_url": "https://github.com/acme/inventory-service",
          "dependencyCount": 2,
          "dependentCount": 5,
          "team": null
        }
      },
      {
        "id": "inc-001",
        "title": "Auth Service Outage - Token Validation Failure",
        "severity": "SEV1",
        "status": "resolved",
        "started_at": "2024-09-12T02:14:00.000Z",
        "resolved_at": "2024-09-12T04:47:00.000Z",
        "description": "Redis cache exhaustion caused auth token validation to fail",
        "affectedServiceCount": 18,
        "rootCauseService": {
          "id": "svc-auth",
          "name": "Auth Service",
          "type": "api",
          "tier": "critical",
          "description": "Handles authentication and authorization",
          "language": "TypeScript",
          "repo_url": "https://github.com/acme/auth-service",
          "dependencyCount": 2,
          "dependentCount": 18,
          "team": null
        }
      }
    ],
    "total": 20
  }
}
```

### Error Responses

| Status | Code | Condition |
|--------|------|-----------|
| 400 | `VALIDATION_ERROR` | Invalid `status` or `severity` filter value |
| 503 | `DB_CONNECTION_ERROR` | Database is unavailable |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

---

## 10. GET /api/incidents/:id

**Description:** Returns full detail for an incident, including all affected services and the deployment that triggered it (if any).  
**Auth:** None

### Request

```
GET /api/incidents/:id
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Incident ID (e.g. `inc-001`) |

**Example request:**
```
GET /api/incidents/inc-001
```

### Response (200)

```typescript
type GetIncidentResponse = IncidentDetail;
```

```json
{
  "success": true,
  "data": {
    "id": "inc-001",
    "title": "Auth Service Outage - Token Validation Failure",
    "severity": "SEV1",
    "status": "resolved",
    "started_at": "2024-09-12T02:14:00.000Z",
    "resolved_at": "2024-09-12T04:47:00.000Z",
    "description": "Redis cache exhaustion caused auth token validation to fail across all services. Root cause was a missing TTL on session tokens causing unbounded cache growth.",
    "affectedServiceCount": 18,
    "rootCauseService": {
      "id": "svc-auth",
      "name": "Auth Service",
      "type": "api",
      "tier": "critical",
      "description": "Handles authentication and authorization",
      "language": "TypeScript",
      "repo_url": "https://github.com/acme/auth-service",
      "dependencyCount": 2,
      "dependentCount": 18,
      "team": {
        "id": "team-identity",
        "name": "Identity & Access",
        "slack_channel": "#identity-oncall",
        "oncall_email": "identity-oncall@acme.com",
        "timezone": "America/Los_Angeles"
      }
    },
    "affectedServices": [
      {
        "id": "svc-api-gateway",
        "name": "API Gateway",
        "type": "gateway",
        "tier": "critical",
        "description": "Primary ingress point for all external traffic",
        "language": "Go",
        "repo_url": "https://github.com/acme/api-gateway",
        "dependencyCount": 4,
        "dependentCount": 0,
        "team": null
      },
      {
        "id": "svc-order-api",
        "name": "Order API",
        "type": "api",
        "tier": "high",
        "description": "Manages order creation and lifecycle",
        "language": "Java",
        "repo_url": "https://github.com/acme/order-api",
        "dependencyCount": 5,
        "dependentCount": 3,
        "team": null
      }
    ],
    "triggeredBy": {
      "id": "dep-007",
      "version": "v3.12.0",
      "deployed_at": "2024-09-12T01:58:00.000Z",
      "deployed_by": "alice.johnson",
      "environment": "production"
    }
  }
}
```

### Error Responses

| Status | Code | Condition |
|--------|------|-----------|
| 404 | `INCIDENT_NOT_FOUND` | No incident with given ID |
| 503 | `DB_CONNECTION_ERROR` | Database is unavailable |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

---

## 11. GET /api/graph/longest-chain

**Description:** Returns the top 10 longest dependency chains in the graph, measured from any service to its deepest leaf dependency. Used as a graph analytics feature to surface architectural risk.  
**Auth:** None

### Request

```
GET /api/graph/longest-chain
```

No parameters.

### Response (200)

```typescript
interface GetLongestChainResponse {
  chains: LongestChainEntry[];
}
```

```json
{
  "success": true,
  "data": {
    "chains": [
      {
        "source": "Mobile BFF",
        "sink": "Primary Postgres",
        "depth": 6
      },
      {
        "source": "Checkout Service",
        "sink": "Primary Postgres",
        "depth": 5
      },
      {
        "source": "Recommendation Engine",
        "sink": "ML Feature Store",
        "depth": 5
      },
      {
        "source": "API Gateway",
        "sink": "Redis Session Cache",
        "depth": 4
      },
      {
        "source": "Notification Worker",
        "sink": "Email Queue",
        "depth": 4
      }
    ]
  }
}
```

### Error Responses

| Status | Code | Condition |
|--------|------|-----------|
| 503 | `DB_CONNECTION_ERROR` | Database is unavailable |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

---

## 12. Error Reference

### Error Response Shape

All errors follow this shape:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description of the error"
  }
}
```

### Error Codes

| Code | HTTP Status | When it Occurs |
|------|-------------|----------------|
| `SERVICE_NOT_FOUND` | 404 | `GET /api/services/:id` when no Service node with that ID exists in the graph |
| `TEAM_NOT_FOUND` | 404 | `GET /api/teams/:id` when no Team node with that ID exists |
| `INCIDENT_NOT_FOUND` | 404 | `GET /api/incidents/:id` when no Incident node with that ID exists |
| `VALIDATION_ERROR` | 400 | Query parameter has an invalid value (e.g. `tier=super-critical`) |
| `DB_CONNECTION_ERROR` | 503 | The Neo4j driver cannot reach CognoDB (Bolt connection refused or timed out) |
| `QUERY_ERROR` | 500 | A Cypher query was syntactically valid but failed at runtime |
| `INTERNAL_ERROR` | 500 | Any other unclassified server error |

### Example Error Responses

**404 Not Found:**
```json
{
  "success": false,
  "error": {
    "code": "SERVICE_NOT_FOUND",
    "message": "No service found with id: svc-nonexistent"
  }
}
```

**400 Validation Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid tier value 'super-critical'. Must be one of: critical, high, medium, low"
  }
}
```

**503 Database Unavailable:**
```json
{
  "success": false,
  "error": {
    "code": "DB_CONNECTION_ERROR",
    "message": "Database is currently unavailable. Please try again later."
  }
}
```

**500 Internal Error:**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```
