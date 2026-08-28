# BlastRadius — Testing Strategy

> Test plan for the full stack: backend unit tests, backend integration tests, frontend unit tests, and frontend
> integration tests.

---

## Table of Contents

1. [Overview and Philosophy](#1-overview-and-philosophy)
2. [Coverage Targets](#2-coverage-targets)
3. [Test File Naming and Folder Structure](#3-test-file-naming-and-folder-structure)
4. [Backend: Mocking the Neo4j Driver](#4-backend-mocking-the-neo4j-driver)
5. [Backend Unit Tests](#5-backend-unit-tests)
6. [Backend Integration Tests](#6-backend-integration-tests)
7. [Frontend Unit Tests](#7-frontend-unit-tests)
8. [Frontend Integration Tests](#8-frontend-integration-tests)
9. [Test Scripts](#9-test-scripts)
10. [CI Configuration Notes](#10-ci-configuration-notes)

---

## 1. Overview and Philosophy

**Test what behavior matters, not implementation details.**

- Backend service functions are tested against their Cypher query outputs, not against the Express routing layer.
- Frontend components are tested for what the user sees and can interact with, not for internal state.
- Mocking is used only at the boundary (neo4j-driver for backend unit tests; the API client for frontend tests).
  Integration tests talk to real infrastructure when available.

**Testing pyramid:**

```
          /\
         /  \  E2E (not in scope for v1)
        /────\
       /      \  Integration (API routes + real DB or MSW mocks)
      /────────\
     /          \  Unit (service functions, components, hooks)
    /────────────\
```

---

## 2. Coverage Targets

| Layer                                       | Target                                  | Measurement     |
| ------------------------------------------- | --------------------------------------- | --------------- |
| Backend service functions (`src/services/`) | **80%** line + branch coverage          | Vitest coverage |
| Backend utils (`src/utils/`)                | **90%**                                 | Vitest coverage |
| Frontend components (`src/components/`)     | **60%**                                 | Vitest coverage |
| Frontend hooks (`src/hooks/`)               | **70%**                                 | Vitest coverage |
| Frontend pages (`src/pages/`)               | **50%** (integration tests cover pages) | Vitest coverage |

Coverage is measured with `@vitest/coverage-v8`. Reports are generated in `coverage/` at the root of each workspace.

---

## 3. Test File Naming and Folder Structure

### Server

```
server/
└── tests/
    ├── unit/
    │   ├── services/
    │   │   ├── services.service.test.ts
    │   │   ├── teams.service.test.ts
    │   │   ├── incidents.service.test.ts
    │   │   └── graph.service.test.ts
    │   └── utils/
    │       └── neo4jHelpers.test.ts
    └── integration/
        ├── services.integration.test.ts
        ├── teams.integration.test.ts
        ├── incidents.integration.test.ts
        └── graph.integration.test.ts
```

**Naming convention:**

- Unit tests: `<module-name>.test.ts`
- Integration tests: `<feature>.integration.test.ts`
- Test files live outside `src/` in a dedicated `tests/` directory

### Client

```
client/
└── src/
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

**Naming convention:**

- Unit tests: `<ComponentName>.test.tsx` or `<hookName>.test.ts`
- Integration tests: `<PageName>.test.tsx`

---

## 4. Backend: Mocking the Neo4j Driver

All backend **unit** tests mock the `neo4j-driver` module. The mock replaces `getDriver()` from `src/config/neo4j.ts`
with a factory that returns a fake driver whose `session()` method returns a fake session with controllable `run()`
behavior.

### Mock Setup (`server/tests/unit/__mocks__/neo4j.ts`)

```typescript
import { vi } from 'vitest';

// A factory to create a mock session with predefined run() results
export const createMockSession = (records: any[]) => ({
  run: vi.fn().mockResolvedValue({ records }),
  close: vi.fn().mockResolvedValue(undefined),
});

// A factory to create a mock driver
export const createMockDriver = (session: ReturnType<typeof createMockSession>) => ({
  session: vi.fn().mockReturnValue(session),
  verifyConnectivity: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
});
```

### Mock Neo4j Record

The `neo4j-driver` returns `Record` objects with a `.get(key)` method. In tests, simulate this with a plain object that
has a `.get()` method:

```typescript
// Helper to create a mock Neo4j Record
export const createMockRecord = (data: Record<string, any>) => ({
  get: (key: string) => data[key],
  keys: Object.keys(data),
});

// Example: mock a Service node as it appears in a Record
export const createMockServiceNode = (overrides = {}) => ({
  properties: {
    id: 'svc-auth',
    name: 'Auth Service',
    type: 'api',
    tier: 'critical',
    description: 'Handles auth',
    language: 'TypeScript',
    repo_url: 'https://github.com/acme/auth',
    ...overrides,
  },
  labels: ['Service'],
});
```

### Wiring the Mock into a Service Test

```typescript
// In each test file, mock the neo4j module before importing the service
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../../src/config/neo4j', () => ({
  getDriver: vi.fn(),
}));

import { getDriver } from '../../../src/config/neo4j';
import { getServices } from '../../../src/services/services.service';
import { createMockDriver, createMockSession, createMockRecord, createMockServiceNode } from '../__mocks__/neo4j';

describe('services.service', () => {
  let mockSession: ReturnType<typeof createMockSession>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSession = createMockSession([]);
    (getDriver as vi.Mock).mockReturnValue(createMockDriver(mockSession));
  });

  // ... tests
});
```

---

## 5. Backend Unit Tests

### `services.service.test.ts`

**Module under test:** `src/services/services.service.ts`

**Functions to test:**

- `getServices(filters?)` — returns all services with team and dependency counts
- `getServiceById(id)` — returns single service or throws `AppError(404)`
- `getBlastRadius(id, maxHops?)` — returns hops array and team/incident data
- `getDependencies(id)` — returns upstream, downstream, team, incidents

**Test cases for `getServices`:**

```
✓ returns an empty array when the DB returns no records
✓ maps DB records to ServiceSummary objects correctly
✓ correctly maps integer.low values from neo4j Integer type
✓ includes dependencyCount and dependentCount from the query
✓ includes team object when team is present on the record
✓ sets team to null when no team is found in the record
✓ opens a DB session and closes it in the finally block (session.close called)
✓ throws DB_CONNECTION_ERROR when driver throws ServiceUnavailableError
```

**Test cases for `getServiceById`:**

```
✓ returns a ServiceDetail when the service exists
✓ throws AppError with code SERVICE_NOT_FOUND and status 404 when no record is returned
✓ correctly maps all fields including nested team object
```

**Test cases for `getBlastRadius`:**

```
✓ returns rootService correctly
✓ groups services into hop arrays by hop number
✓ deduplicates services that appear in multiple paths (same service, shortest hop wins)
✓ returns empty hops array when no services depend on the root
✓ returns teamsToPage with affectedServices grouped by team
✓ returns historicalIncidents ordered by started_at DESC
✓ respects the maxHops parameter by passing it to the Cypher query
✓ throws SERVICE_NOT_FOUND when the root service ID doesn't exist
```

**Test cases for `getDependencies`:**

```
✓ returns service with upstream and downstream as arrays
✓ returns empty arrays when no upstream/downstream exist
✓ includes team object in the response
✓ includes incidents caused by this service
✓ returns empty incidents array when none exist
```

---

### `teams.service.test.ts`

**Module under test:** `src/services/teams.service.ts`

**Functions to test:**

- `getTeams()` — all teams with serviceCount and activeIncidentCount
- `getTeamById(id)` — team with owned services and active incidents

**Test cases:**

```
getTeams:
✓ returns array of TeamSummaryWithCounts objects
✓ serviceCount is correctly extracted from query result
✓ activeIncidentCount is correctly extracted from query result
✓ returns empty array when no teams exist

getTeamById:
✓ returns TeamDetail with services array
✓ returns TeamDetail with activeIncidents array
✓ services array is empty when team owns no services
✓ activeIncidents array is empty when team has no active incidents
✓ throws TEAM_NOT_FOUND when team does not exist
```

---

### `incidents.service.test.ts`

**Module under test:** `src/services/incidents.service.ts`

**Functions to test:**

- `getIncidents(filters?)` — all incidents with optional filters
- `getIncidentById(id)` — single incident with full detail

**Test cases:**

```
getIncidents:
✓ returns all incidents sorted by started_at DESC
✓ filters by status when status filter is provided
✓ filters by severity when severity filter is provided
✓ combines status and severity filters correctly
✓ computes affectedServiceCount from the query
✓ includes rootCauseService when present
✓ sets rootCauseService to null when no CAUSED_BY relationship exists

getIncidentById:
✓ returns IncidentDetail with affectedServices array
✓ returns IncidentDetail with triggeredBy deployment when TRIGGERED exists
✓ sets triggeredBy to null when no deployment triggered it
✓ throws INCIDENT_NOT_FOUND when incident does not exist
```

---

### `graph.service.test.ts`

**Module under test:** `src/services/graph.service.ts`

**Functions to test:**

- `getLongestChain()` — top 10 longest dependency chains

**Test cases:**

```
getLongestChain:
✓ returns an array of LongestChainEntry objects
✓ entries are sorted by depth DESC (deepest first)
✓ result is limited to 10 entries
✓ returns empty array when graph has no dependencies
✓ correctly maps source, sink, and depth from record
```

---

### `neo4jHelpers.test.ts`

**Module under test:** `src/utils/neo4jHelpers.ts`

**Functions to test:**

- `toInt(value)` — converts neo4j Integer to JS number
- `nodeToPlainObject(node)` — converts a neo4j Node to a plain JS object
- `recordToObject(record, key)` — extracts a named value from a Record and converts it

**Test cases:**

```
toInt:
✓ converts neo4j Integer { low: 42, high: 0 } to 42
✓ converts regular JS number passthrough unchanged
✓ handles zero correctly
✓ handles large integers (uses neo4j.integer.toNumber())

nodeToPlainObject:
✓ converts a node's properties to a plain JS object
✓ converts nested Integer properties to JS numbers
✓ returns empty object for node with no properties
```

---

## 6. Backend Integration Tests

Integration tests run against the **actual Cypher queries** to validate that query logic is correct. They require a
running CognoDB instance.

### Strategy

Two options depending on environment:

**Option A (CI with real DB):** Set `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD` as CI secrets. Run the seed script
before tests. Tests use a dedicated `test` database (set `NEO4J_DATABASE=test`).

**Option B (Local development without DB):** Use `nock` or `msw` at the HTTP level, or use a partial mock that
intercepts at the driver level but tests the full query string logic.

**Recommended for CI:** Option A. Tests should connect to a real CognoDB test instance seeded with a minimal dataset (2
teams, 5 services, 3 dependencies, 2 incidents, 1 deployment).

### Integration Test Setup

```typescript
// server/tests/integration/setup.ts
import { getDriver, closeDriver } from '../../src/config/neo4j';

beforeAll(async () => {
  // Verify DB connectivity
  const driver = getDriver();
  await driver.verifyConnectivity();

  // Seed minimal test data
  await seedTestData();
});

afterAll(async () => {
  // Clean up test data
  await clearTestData();
  await closeDriver();
});
```

### `services.integration.test.ts`

```
✓ GET /api/services returns 200 with all seeded services
✓ GET /api/services?tier=critical filters correctly
✓ GET /api/services/:id returns the correct service by ID
✓ GET /api/services/:id returns 404 for non-existent ID
✓ GET /api/services/:id/blast-radius returns correct hop groups
✓ GET /api/services/:id/blast-radius returns empty hops for a leaf service
✓ GET /api/services/:id/dependencies returns upstream and downstream
✓ dependencyCount and dependentCount are computed correctly
```

### `teams.integration.test.ts`

```
✓ GET /api/teams returns all seeded teams
✓ GET /api/teams/:id returns the team with its services
✓ GET /api/teams/:id returns 404 for non-existent ID
✓ activeIncidentCount is 0 for a team with no active incidents
✓ activeIncidentCount is > 0 for a team with active incidents
```

### `incidents.integration.test.ts`

```
✓ GET /api/incidents returns all seeded incidents ordered by started_at DESC
✓ GET /api/incidents?status=active returns only active incidents
✓ GET /api/incidents?severity=SEV1 returns only SEV1 incidents
✓ GET /api/incidents/:id returns the incident with affectedServices
✓ GET /api/incidents/:id includes triggeredBy when a deployment triggered it
✓ GET /api/incidents/:id sets triggeredBy to null when no deployment triggered it
✓ GET /api/incidents/:id returns 404 for non-existent ID
```

### `graph.integration.test.ts`

```
✓ GET /api/graph/longest-chain returns at most 10 entries
✓ Results are sorted by depth descending
✓ Entries have source, sink, and depth fields
✓ Returns empty array when graph has no dependencies (edge case)
```

---

## 7. Frontend Unit Tests

Frontend unit tests use `vitest` + `@testing-library/react` + `@testing-library/user-event`. The API layer is mocked
using `vi.mock` on the `api/client.ts` module.

### Vitest Setup (`client/vitest.config.ts`)

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
  },
});
```

### Test Setup File (`client/src/tests/setup.ts`)

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

---

### `ServiceCard.test.tsx`

```
✓ renders the service name
✓ renders the type badge with the correct label
✓ renders the tier badge with the correct label
✓ renders the team name when team is present
✓ renders "No team" or similar when team is null
✓ renders dependencyCount and dependentCount
✓ calls onClick when the card is clicked
✓ applies the 'affected' variant styles when variant="affected"
✓ applies the highlighted styles when isHighlighted=true
✓ applies animation-related className when animationDelay is provided
✓ renders as a link to /services/:id when no onClick is provided
```

**Snapshot test:**

```
✓ matches snapshot for default variant
✓ matches snapshot for affected variant
```

---

### `BlastRadiusPanel.test.tsx`

This is the most complex component test because of the timing-based animation.

```
Setup: Use vi.useFakeTimers() to control setTimeout

✓ renders a loading state (spinner) while data is being fetched
✓ renders the root service name in the header
✓ renders no HopGroups initially (revealedHops starts at 0)
✓ renders the first HopGroup after 700ms (vi.advanceTimersByTime(700))
✓ renders the second HopGroup after 1400ms
✓ renders all HopGroups after (700 * totalHops)ms
✓ does not render TeamAlertBanner until all hops are revealed
✓ renders TeamAlertBanner after all hops are revealed
✓ renders the historical incidents section when historicalIncidents is non-empty
✓ renders the empty blast radius state when hops is empty
✓ renders ErrorState when the query fails
✓ resets revealedHops to 0 when serviceId prop changes
✓ calls onClose when the close button is clicked
```

---

### `IncidentCard.test.tsx`

```
✓ renders the incident title
✓ renders the severity badge (SEV1 / SEV2 / SEV3)
✓ renders the status badge (active / monitoring / resolved)
✓ renders the affected service count
✓ renders the root cause service name when present
✓ renders "Unknown cause" when rootCauseService is null
✓ renders started_at as a relative time string (e.g., "3 days ago")
✓ renders duration (resolved_at - started_at) when resolved
✓ renders "Ongoing" when resolved_at is null
✓ applies SEV1 active styles (red left border + pulsing dot) for active SEV1
✓ applies resolved styles (reduced opacity) for resolved incidents
✓ compact variant renders only title, severity, status, and date
✓ calls onClick when the card is clicked
```

---

### `TeamCard.test.tsx`

```
✓ renders team name
✓ renders slack channel
✓ renders timezone
✓ renders service count
✓ renders active incident count
✓ shows amber pulsing dot when activeIncidentCount > 0
✓ does not show alert indicator when activeIncidentCount is 0
✓ calls onClick when clicked
✓ renders link to /teams/:id
```

---

### `useServices.test.ts`

```
Setup: Wrap hook usage in a QueryClientProvider with a fresh QueryClient per test.
Mock: vi.mock the API module (services.api.ts).

✓ useServices: returns isLoading true initially
✓ useServices: returns data after successful fetch
✓ useServices: returns isError true after failed fetch
✓ useServices: passes filter parameters to the API call
✓ useService: does not fetch when id is empty string (enabled: !!id)
✓ useService: fetches when id is provided
✓ useBlastRadius: staleTime is 0 (always refetches)
✓ useDependencies: uses correct query key
```

---

## 8. Frontend Integration Tests

Frontend integration tests use React Testing Library + Mock Service Worker (`msw`) to intercept HTTP calls. Tests render
full pages and simulate user interactions.

### MSW Setup (`client/src/tests/msw/handlers.ts`)

```typescript
import { http, HttpResponse } from 'msw';
import { mockServices } from '../fixtures/services';
import { mockTeams } from '../fixtures/teams';
import { mockIncidents } from '../fixtures/incidents';

export const handlers = [
  http.get('*/api/services', () =>
    HttpResponse.json({ success: true, data: { services: mockServices, total: mockServices.length } }),
  ),
  http.get('*/api/services/:id', ({ params }) =>
    HttpResponse.json({ success: true, data: mockServices.find((s) => s.id === params.id) ?? null }),
  ),
  http.get('*/api/services/:id/blast-radius', ({ params }) =>
    HttpResponse.json({ success: true, data: mockBlastRadius[params.id as string] }),
  ),
  http.get('*/api/services/:id/dependencies', ({ params }) =>
    HttpResponse.json({ success: true, data: mockDependencies[params.id as string] }),
  ),
  http.get('*/api/teams', () =>
    HttpResponse.json({ success: true, data: { teams: mockTeams, total: mockTeams.length } }),
  ),
  http.get('*/api/teams/:id', ({ params }) =>
    HttpResponse.json({ success: true, data: mockTeams.find((t) => t.id === params.id) }),
  ),
  http.get('*/api/incidents', () =>
    HttpResponse.json({ success: true, data: { incidents: mockIncidents, total: mockIncidents.length } }),
  ),
  http.get('*/api/incidents/:id', ({ params }) =>
    HttpResponse.json({ success: true, data: mockIncidents.find((i) => i.id === params.id) }),
  ),
];
```

---

### `ServiceMapPage.test.tsx`

```
✓ renders page title "Service Map"
✓ renders a ServiceSkeleton while data is loading
✓ renders all service cards after data loads
✓ groups services by team name (team headers visible)
✓ clicking a service card selects it (card gets highlighted)
✓ clicking a selected service card opens the BlastRadiusPanel
✓ the BlastRadiusPanel is not visible by default
✓ the BlastRadiusPanel shows the selected service name in its header
✓ closing the blast radius panel (clicking X) hides the panel
✓ renders an EmptyState when API returns no services
✓ renders an ErrorState when the API request fails
```

---

### `ServiceDetailPage.test.tsx`

```
✓ renders the service name as page title
✓ renders the service type and tier badges
✓ renders the dependency explorer section
✓ upstream services are listed in the UpstreamList
✓ downstream services are listed in the DownstreamList
✓ the blast radius panel is always visible on the detail page (not toggled)
✓ renders historical incidents section
✓ renders EmptyState for historical incidents when none exist
✓ renders 404 ErrorState when service ID doesn't exist
✓ clicking an upstream service navigates to that service's detail page
```

---

### `IncidentsPage.test.tsx`

```
✓ renders page title "Incidents"
✓ renders IncidentSkeleton while loading
✓ renders a list of incident cards after data loads
✓ severity filter: selecting "SEV1" hides non-SEV1 incidents
✓ status filter: selecting "active" hides resolved incidents
✓ combining filters narrows results correctly
✓ "Clear filters" button resets both filters
✓ renders EmptyState when filters produce no results
✓ renders EmptyState with different message when no incidents exist at all
✓ renders ErrorState when API fails
✓ clicking an incident card navigates to /incidents/:id
```

---

## 9. Test Scripts

### Root `package.json`

```json
{
  "scripts": {
    "test": "npm run test --workspaces",
    "test:coverage": "npm run test:coverage --workspaces"
  }
}
```

### Server `package.json`

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:unit": "vitest run tests/unit",
    "test:integration": "vitest run tests/integration"
  }
}
```

### Client `package.json`

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:unit": "vitest run src/tests/unit",
    "test:integration": "vitest run src/tests/integration"
  }
}
```

### Running Tests

```bash
# Run all tests (both workspaces)
npm test

# Run only backend tests
npm test --workspace=server

# Run only frontend tests
npm test --workspace=client

# Watch mode (re-run on file change)
cd server && npm run test:watch
cd client && npm run test:watch

# Coverage report
npm run test:coverage

# Run only integration tests (requires DB connection)
cd server && npm run test:integration

# Run only unit tests (no DB needed)
cd server && npm run test:unit
```

---

## 10. CI Configuration Notes

### Environment Variables for CI

Integration tests require a running CognoDB instance. Configure these as CI secrets:

```
NEO4J_URI=bolt://<test-db-host>:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=<test-db-password>
NEO4J_DATABASE=test
```

### CI Test Order

1. Install dependencies (`npm ci --workspaces`)
2. Type-check (`tsc --noEmit` in both workspaces)
3. Run unit tests (no DB needed) — fast feedback
4. Seed the test database
5. Run integration tests (requires DB)
6. Collect coverage reports
7. Fail if coverage drops below targets

### Vitest Coverage Configuration (`vitest.config.ts` in server)

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/services/**', 'src/utils/**'],
      exclude: ['src/index.ts', 'src/app.ts', 'src/config/**'],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
      },
    },
  },
});
```

### Test Fixtures Location

Test fixtures (mock data objects) live alongside the tests:

```
server/tests/fixtures/
├── services.fixture.ts
├── teams.fixture.ts
├── incidents.fixture.ts
└── deployments.fixture.ts

client/src/tests/fixtures/
├── services.fixture.ts
├── teams.fixture.ts
└── incidents.fixture.ts
```

Fixtures export pre-built mock objects that match the TypeScript interfaces exactly. Using typed fixtures catches
interface drift early.
