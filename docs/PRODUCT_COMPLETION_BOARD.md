# BlastRadius — Product Completion Board

> **See what breaks when something breaks.**
>
> **How to use this board:** Work through phases in order. Each task is atomic — one clear action, one clear output.
> Check off tasks as you complete them. Branch naming: `feature/<feature-name>` from `develop`. Merge back to `develop`
> when done. Mark `- [ ]` as `- [x]` when complete.

---

## Product North Star

BlastRadius is not just a service catalog. It is an incident decision tool for engineering teams who need to answer one
question quickly:

> **"This service is failing. Who is affected, who do we page, what do we say, and what should we do first?"**

The finished product must support a clear journey:

1. A user lands on the app and immediately understands the use case.
2. They sign in or continue with a demo workspace.
3. They choose a workspace that contains a service graph.
4. They start from a real incident scenario or pick a failing service.
5. The app simulates blast radius hop by hop.
6. The app converts graph data into a plain-language response plan.
7. The user can share that plan with teammates or save it for review.
8. The app teaches why the graph matters through guided examples, not empty dashboards.

### Primary Users

- **On-call engineer:** needs a fast dependency map, owners, and escalation list during an incident.
- **Engineering manager:** needs to understand customer/team impact and coordinate updates.
- **Platform/SRE lead:** needs recurring architecture risk insights before incidents happen.
- **Evaluator/reviewer:** needs a frictionless demo journey that proves the app is useful without setup pain.

### Core Use Cases

- **Incident Triage:** "Payments API is timing out. Show what breaks and who to page."
- **Pre-Deploy Risk Review:** "If we deploy Auth Service, which critical paths could be affected?"
- **Architecture Hotspot Review:** "Which services sit on the deepest dependency chains?"
- **Post-Incident Learning:** "Has this failure shape happened before, and what teams were involved?"
- **Executive Summary:** "Create a readable impact summary for a non-technical stakeholder."

### Product Definition of Useful

The app is useful only when a first-time user can complete this flow without explanation:

`Open app -> choose demo workspace -> start an incident -> select failing service -> view blast radius -> see teams to page -> copy/share action plan`

Any future phase that does not strengthen this journey should be reconsidered.

---

## Progress

| Phase                                     | Tasks   | Done    | Remaining |
| ----------------------------------------- | ------- | ------- | --------- |
| Phase 0 — Repo & Environment Setup        | 20      | 0       | 20        |
| Phase 1 — Git Workflow & Code Quality     | 12      | 0       | 12        |
| Phase 2 — CI/CD Pipeline                  | 14      | 0       | 14        |
| Phase 3 — Database Layer                  | 7       | 7       | 0         |
| Phase 4 — Seed Script                     | 16      | 16      | 0         |
| Phase 5 — Backend API                     | 24      | 24      | 0         |
| Phase 6 — Backend Tests                   | 13      | 13      | 0         |
| Phase 7 — Frontend Shell                  | 20      | 20      | 0         |
| Phase 8A — Product Entry & Demo Journey   | 18      | 18      | 0         |
| Phase 8B — Auth, Users & Workspaces       | 20      | 0       | 20        |
| Phase 8C — Incident Triage Workflow       | 22      | 0       | 22        |
| Phase 8D — Action Plan & Collaboration    | 18      | 0       | 18        |
| Phase 8E — Product Analytics & Feedback   | 10      | 0       | 10        |
| Phase 8 — Frontend Pages                  | 22      | 0       | 22        |
| Phase 9 — Frontend Tests                  | 11      | 0       | 11        |
| Phase 10 — Observability & Security       | 10      | 0       | 10        |
| Phase 11 — Integration & E2E Verification | 12      | 0       | 12        |
| Phase 12 — Deployment                     | 12      | 0       | 12        |
| Phase 13 — Final Polish & Submission      | 9       | 0       | 9         |
| **Total**                                 | **290** | **118** | **172**   |

---

## Phase 0 — Repository & Environment Setup

> Goal: A fully wired monorepo that compiles, with all config files in place.

- [x] Initialize git repository with `git init` and create `main` and `develop` branches
- [x] Create monorepo folder structure: `server/`, `client/`, `seed/`, `docs/`
- [x] Create root `.gitignore` covering `node_modules/`, `.env`, `dist/`, `coverage/`, `.DS_Store`, `*.log`,
      `*.tsbuildinfo`
- [x] Create root `package.json` with `"workspaces": ["server", "client", "seed"]` and root-level scripts (`dev`,
      `build`, `test`, `seed`, `lint`, `format`)
- [x] Create `server/package.json` with all runtime dependencies: `express`, `neo4j-driver`, `cors`, `morgan`, `dotenv`,
      `zod` and dev dependencies: `typescript`, `tsx`, `vitest`, `supertest`, `@types/*`
- [x] Create `client/package.json` with all dependencies: `react`, `react-dom`, `react-router-dom`,
      `@tanstack/react-query`, `axios` and dev dependencies: `vite`, `@vitejs/plugin-react`, `typescript`,
      `tailwindcss`, `postcss`, `autoprefixer`, `vitest`, `@testing-library/react`, `@testing-library/user-event`, `msw`
- [x] Create `seed/package.json` with dependencies: `neo4j-driver`, `dotenv` and dev dependencies: `typescript`, `tsx`
- [x] Create `server/tsconfig.json` with `target: ES2022`, `module: NodeNext`, `moduleResolution: NodeNext`,
      `strict: true`, `outDir: dist`
- [x] Create `server/tsconfig.build.json` that extends base tsconfig and excludes `tests/` and `seed/` directories
- [x] Create `client/tsconfig.json` (Vite-compatible: `target: ESNext`, `lib: [DOM, ESNext]`, `jsx: react-jsx`,
      `strict: true`)
- [x] Create `client/tsconfig.node.json` for the Vite config file itself
- [x] Create `seed/tsconfig.json` with Node-compatible settings (`target: ES2022`, `module: NodeNext`, `strict: true`)
- [x] Create `server/.env.example` with all 8 server variables: `PORT`, `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`,
      `NEO4J_DATABASE`, `CLIENT_ORIGIN`, `NODE_ENV`, `LOG_LEVEL`
- [x] Create `client/.env.example` with `VITE_API_BASE_URL`
- [x] Create `seed/.env.example` with `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`, `NEO4J_DATABASE`
- [x] Copy `.env.example` to `.env` in each workspace and fill with local development values
- [x] Run `npm install` from repo root and confirm all three workspace `node_modules/` are populated
- [x] Run `tsc --noEmit` in `server/` and confirm zero TypeScript errors on an empty `src/index.ts`
- [x] Verify CognoDB instance is provisioned and Bolt URI, username, and password are saved to `server/.env`
- [x] Verify neo4j-driver connects to the CognoDB instance by running a one-line test script:
      `npx tsx -e "import neo4j from 'neo4j-driver'; const d = neo4j.driver(process.env.NEO4J_URI, neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)); await d.verifyConnectivity(); console.log('OK'); await d.close();"`

---

## Phase 1 — Git Workflow & Code Quality

> Goal: Every commit is consistently formatted, linted, and type-checked before it lands on `develop`.

- [x] Create `develop` branch from `main` and set it as the default working branch
- [x] Install and configure **ESLint** at repo root: `eslint.config.js` using `@typescript-eslint/parser`,
      `eslint-plugin-react`, `eslint-plugin-react-hooks`, with `no-console` warn, `no-unused-vars` error, and
      `@typescript-eslint/explicit-function-return-type` warn
- [x] Install and configure **Prettier** at repo root: `.prettierrc.json` with `singleQuote: true`, `semi: true`,
      `printWidth: 100`, `tabWidth: 2`, `trailingComma: all`
- [x] Create `.prettierignore` excluding `dist/`, `coverage/`, `node_modules/`
- [x] Add `"lint"` script to root `package.json`: `eslint "**/*.{ts,tsx}" --ignore-path .prettierignore`
- [x] Add `"format"` script to root `package.json`: `prettier --write "**/*.{ts,tsx,json,md}"`
- [x] Add `"format:check"` script to root `package.json`: `prettier --check "**/*.{ts,tsx,json,md}"` (used in CI)
- [x] Install **Husky** and **lint-staged**: `npx husky init`, configure `.husky/pre-commit` to run `npx lint-staged`
- [x] Configure `lint-staged` in root `package.json`: on staged `*.{ts,tsx}` run `eslint --fix` then `prettier --write`;
      on staged `*.{json,md}` run `prettier --write`
- [x] Install **commitlint** with `@commitlint/config-conventional`; create `commitlint.config.js` enforcing
      conventional commit format (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`)
- [x] Configure `.husky/commit-msg` hook to run `npx commitlint --edit`
- [x] Verify the pre-commit hook fires on `git commit` by staging a file with a lint error and confirming the commit is
      blocked

---

## Phase 2 — CI/CD Pipeline

> Goal: Every push to `develop` and every PR to `main` is automatically type-checked, linted, tested, and (on merge to
> `main`) deployed.

- [x] Create `.github/workflows/` directory at repo root
- [x] Create `.github/workflows/ci.yml` — triggers on `push` to `develop` and `pull_request` targeting `main`
- [x] Add **install** job to `ci.yml`: checkout code, set up Node 20, run `npm ci` with workspace caching using
      `actions/cache` on `node_modules/` keyed by `package-lock.json` hash
- [x] Add **lint** job to `ci.yml` (depends on install): run `npm run lint` and `npm run format:check`; fail the
      pipeline if either fails
- [x] Add **type-check** job to `ci.yml` (depends on install): run `tsc --noEmit` in `server/` and `tsc --noEmit` in
      `client/` as parallel steps
- [x] Add **backend-unit-tests** job to `ci.yml` (depends on type-check): run `npm run test:unit --workspace=server`
      with Vitest reporter `github-actions`
- [x] Add **frontend-unit-tests** job to `ci.yml` (depends on type-check): run `npm run test:unit --workspace=client`
      with Vitest reporter `github-actions`
- [x] Add **coverage** job to `ci.yml` (depends on both test jobs): run `npm run test:coverage --workspaces`, upload
      `coverage/` artifacts using `actions/upload-artifact`, fail if thresholds not met
- [x] Create `.github/workflows/deploy-backend.yml` — triggers on push to `main` only
- [x] Add **deploy-backend** job to `deploy-backend.yml`: use Railway's `railway up` CLI action or call Railway deploy
      webhook stored as `RAILWAY_TOKEN` GitHub secret
- [x] Create `.github/workflows/deploy-frontend.yml` — triggers on push to `main` only
- [x] Add **deploy-frontend** job to `deploy-frontend.yml`: use Vercel CLI (`vercel --prod --token $VERCEL_TOKEN`) with
      `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` as GitHub secrets
- [x] Add **GitHub branch protection rule** on `main`: require at least 1 PR approval, require all CI status checks to
      pass (`lint`, `type-check`, `backend-unit-tests`, `frontend-unit-tests`), disallow direct pushes
- [x] Add **GitHub branch protection rule** on `develop`: require CI `lint` and `type-check` checks to pass before merge

---

## Phase 3 — Database Layer (server/)

> Goal: A working, tested neo4j driver singleton that the rest of the backend builds on.

- [x] Create `src/config/env.ts` — reads and validates all env vars at startup using Zod; throws a descriptive error if
      any required var is missing
- [x] Create `src/config/neo4j.ts` — singleton `getDriver()` that instantiates the driver once and reuses it;
      `closeDriver()` for graceful shutdown; SSL/encryption detection based on URI scheme (`bolt+ssc://` → trust all
      certs)
- [x] Create `src/utils/neo4jHelpers.ts` — `toInt(v)` to convert Neo4j Integer to JS number; `nodeProps(node)` to
      convert a Node's properties to a plain object
- [x] Create `src/utils/AppError.ts` — `AppError extends Error` with `statusCode` and `code` fields; factory helpers:
      `notFound(entity, id)`, `dbError(err)`, `validationError(msg)`
- [x] Write and run a constraint creation script (can be a one-off `tsx` script or part of Phase 4 seed):
      `CREATE CONSTRAINT service_id_unique IF NOT EXISTS FOR (s:Service) REQUIRE s.id IS UNIQUE` and the 3 other
      uniqueness constraints plus all 5 indexes from `DATA_MODEL.md`
- [x] Write unit test `tests/unit/config/neo4j.test.ts` — test singleton behavior: calling `getDriver()` twice returns
      the same instance; `closeDriver()` sets the singleton to null
- [x] Write unit test `tests/unit/utils/neo4jHelpers.test.ts` — test `toInt` for neo4j Integer objects, plain numbers,
      and zero; test `nodeProps` for populated and empty property maps

---

## Phase 4 — Seed Script (seed/)

> Goal: One `npm run seed` command populates CognoDB with the full 40-service graph.

- [x] Create `seed/src/data/teams.ts` — export array of 10 team objects with all properties: `id`, `name`,
      `slack_channel`, `oncall_email`, `timezone`
- [x] Create `seed/src/data/services.ts` — export array of 40 service objects with all properties: `id`, `name`, `type`,
      `tier`, `description`, `language`, `repo_url`, `teamId`
- [x] Create `seed/src/data/dependencies.ts` — export array of ~84 edge objects: `{ from, to, criticality, latency_ms }`
      covering all topology layers described in `DATA_MODEL.md`
- [x] Create `seed/src/data/incidents.ts` — export array of 20 incident objects with all properties and
      `rootCauseServiceId` + `affectedServiceIds[]`
- [x] Create `seed/src/data/deployments.ts` — export array of 15 deployment objects with `deployedToServiceId` and
      `triggeredIncidentId` (null for clean deploys)
- [x] Create `seed/src/steps/clearDatabase.ts` — runs `MATCH (n) DETACH DELETE n` and logs count of deleted nodes
- [x] Create `seed/src/steps/createConstraints.ts` — runs all 4 uniqueness constraints and 5 indexes using
      `IF NOT EXISTS`
- [x] Create `seed/src/steps/seedTeams.ts` — iterates `teamsData`, runs `MERGE (t:Team {id: $id}) SET t += $props` for
      each team
- [x] Create `seed/src/steps/seedServices.ts` — iterates `servicesData`, merges each Service node, then merges
      `(Team)-[:OWNS]->(Service)` relationship
- [x] Create `seed/src/steps/seedDependencies.ts` — iterates `dependenciesData`, for each edge runs
      `MATCH consumer, MATCH provider, MERGE (consumer)-[r:DEPENDS_ON]->(provider) SET r += $props`; warns on missing
      nodes
- [x] Create `seed/src/steps/seedIncidents.ts` — merges each Incident node, creates `CAUSED_BY` relationship, uses
      `UNWIND` to batch-create all `AFFECTED` relationships per incident
- [x] Create `seed/src/steps/seedDeployments.ts` — merges each Deployment node, creates `DEPLOYED_TO` relationship,
      conditionally creates `TRIGGERED` relationship when `triggeredIncidentId` is not null
- [x] Create `seed/src/seed.ts` — main orchestrator that calls all steps in order (clear → constraints → teams →
      services → dependencies → incidents → deployments) with timing and error logging
- [x] Add `"seed": "tsx src/seed.ts"` script to `seed/package.json` and `"seed": "npm run seed --workspace=seed"` to
      root `package.json`
- [x] Run seed script against CognoDB and verify node counts: `MATCH (n) RETURN labels(n)[0], count(n)` — expect
      Service=40, Team=10, Incident=20, Deployment=15
- [x] Run verification query for 4-hop chains:
      `MATCH path = (s:Service)-[:DEPENDS_ON*4..]->(t:Service) RETURN s.name, t.name, length(path) LIMIT 5` — confirm at
      least one result

---

## Phase 5 — Backend API (server/)

> Goal: All 10 REST endpoints working correctly against real seed data.

- [x] Create `src/types/service.types.ts`, `src/types/team.types.ts`, `src/types/incident.types.ts`,
      `src/types/graph.types.ts`, `src/types/api.types.ts` — all TypeScript interfaces from `API.md` (ServiceSummary,
      ServiceDetail, BlastRadiusResult, BlastRadiusHop, TeamDetail, IncidentDetail, etc.)
- [x] Create `src/utils/cypher.ts` — named constants for all 5 Cypher queries (Q1–Q5 verbatim from `ARCHITECTURE.md`)
- [x] Create `src/middleware/asyncWrapper.ts` —
      `(fn) => (req, res, next) => Promise.resolve(fn(req,res,next)).catch(next)`
- [x] Create `src/middleware/errorHandler.ts` — 4-arg Express error handler mapping AppError → HTTP response, Neo4j
      ServiceUnavailableError → 503, unknown → 500
- [x] Create `src/middleware/requestLogger.ts` — Morgan middleware in `dev` format for development, `combined` for
      production
- [x] Create `src/middleware/notFound.ts` — catch-all 404 handler for unmatched routes
- [x] Create `src/services/services.service.ts` — `getServices(filters?)`, `getServiceById(id)`,
      `getBlastRadius(id, maxHops?)`, `getDependencies(id)` using session open/run/close pattern
- [x] Create `src/services/teams.service.ts` — `getTeams()`, `getTeamById(id)`
- [x] Create `src/services/incidents.service.ts` — `getIncidents(filters?)`, `getIncidentById(id)`
- [x] Create `src/services/graph.service.ts` — `getLongestChain()`
- [x] Create `src/controllers/services.controller.ts` — thin handlers that call service functions and send
      `{ success: true, data }` responses; validate `maxHops` query param with Zod
- [x] Create `src/controllers/teams.controller.ts`, `src/controllers/incidents.controller.ts`,
      `src/controllers/graph.controller.ts` — same pattern
- [x] Create `src/controllers/health.controller.ts` — calls `driver.verifyConnectivity()`, measures latency with
      `Date.now()`, returns health shape; always returns 200
- [x] Create `src/routes/services.routes.ts` — `GET /api/services`, `GET /api/services/:id`,
      `GET /api/services/:id/blast-radius`, `GET /api/services/:id/dependencies`
- [x] Create `src/routes/teams.routes.ts` — `GET /api/teams`, `GET /api/teams/:id`
- [x] Create `src/routes/incidents.routes.ts` — `GET /api/incidents`, `GET /api/incidents/:id`
- [x] Create `src/routes/graph.routes.ts` — `GET /api/graph/longest-chain`
- [x] Create `src/routes/health.routes.ts` — `GET /health`
- [x] Create `src/app.ts` — Express app factory: register JSON body parser, CORS, request logger, all routers, 404
      handler, error handler; export `app` (no `listen` call, for testability)
- [x] Create `src/index.ts` — import `app`, call `app.listen(PORT)`, register `SIGTERM`/`SIGINT` handlers to call
      `closeDriver()` then `server.close()`
- [x] Manually test `GET /health` with curl — confirm `{ "status": "ok", "database": { "connected": true } }`
- [x] Manually test `GET /api/services` — confirm 40 services returned with `team` and `dependencyCount` fields
- [x] Manually test `GET /api/services/svc-auth/blast-radius` — confirm multiple hop groups with services at each hop
- [x] Manually test `GET /api/incidents` — confirm 20 incidents ordered newest-first

---

## Phase 6 — Backend Tests (server/)

> Goal: 80% coverage on service layer; all API routes tested with supertest.

- [x] Create `vitest.config.ts` in `server/` — configure `environment: node`, `coverage.provider: v8`,
      `coverage.include: ["src/services/**", "src/utils/**"]`, `coverage.thresholds: { lines: 80, branches: 80 }`
- [x] Create `tests/fixtures/` directory with `services.fixture.ts`, `teams.fixture.ts`, `incidents.fixture.ts`,
      `deployments.fixture.ts` — typed mock objects matching all TypeScript interfaces
- [x] Create `tests/unit/__mocks__/neo4j.ts` — `createMockRecord(data)`, `createMockSession(records)`,
      `createMockDriver(session)` helpers
- [x] Create `tests/unit/services/services.service.test.ts` — test `getServices` (empty result, full mapping,
      team=null), `getServiceById` (found, 404), `getBlastRadius` (hop grouping, empty hops, teams, historical
      incidents), `getDependencies` (upstream/downstream/team/incidents)
- [x] Create `tests/unit/services/teams.service.test.ts` — test `getTeams` (counts mapping), `getTeamById` (found with
      services + incidents, 404)
- [x] Create `tests/unit/services/incidents.service.test.ts` — test `getIncidents` (all, status filter, severity filter,
      combined), `getIncidentById` (found with triggeredBy, triggeredBy=null, 404)
- [x] Create `tests/unit/services/graph.service.test.ts` — test `getLongestChain` (correct mapping, limited to 10, empty
      graph)
- [x] Create `tests/unit/utils/AppError.test.ts` — test that `notFound`, `dbError`, `validationError` factories produce
      correct `statusCode`, `code`, and `message`
- [x] Create `tests/unit/middleware/errorHandler.test.ts` — test AppError passthrough, ServiceUnavailableError → 503,
      unknown error → 500, response envelope shape
- [x] Create `tests/integration/api/services.integration.test.ts` — supertest: GET `/api/services` 200, GET
      `/api/services/:id` 200 and 404, GET `/api/services/:id/blast-radius` 200, GET `/api/services/:id/dependencies`
      200
- [x] Create `tests/integration/api/teams.integration.test.ts` — supertest: GET `/api/teams` 200, GET `/api/teams/:id`
      200 and 404
- [x] Create `tests/integration/api/incidents.integration.test.ts` — supertest: GET `/api/incidents` 200 with filters,
      GET `/api/incidents/:id` 200 and 404
- [x] Create `tests/integration/api/health.integration.test.ts` — mock driver healthy state → `status: ok`; mock driver
      throwing → `status: degraded` but still HTTP 200
- [x] Run `npm run test:coverage --workspace=server` and confirm output shows ≥80% line and branch coverage

---

## Phase 7 — Frontend Shell (client/)

> Goal: App shell renders with correct dark theme, navigation works, design tokens are applied.

- [x] Scaffold `client/` using `npm create vite@latest . -- --template react-ts` (run inside `client/`)
- [x] Install Tailwind CSS, PostCSS, Autoprefixer:
      `npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p`
- [x] Configure `tailwind.config.ts` — extend theme with `slate-950` background, `slate-800` card color,
      `red-500`/`amber-500`/`blue-500` accent colors, `Inter` and `JetBrains Mono` font families, custom keyframes
      (`fadeIn`, `slideInRight`, `slideInUp`), custom animations (`fade-in`, `slide-in-right`, `slide-in-up`,
      `pulse-slow`)
- [x] Add
      `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap')`
      to `src/index.css` and configure Tailwind base/components/utilities directives
- [x] Install `react-router-dom`, `@tanstack/react-query`, `axios`
- [x] Install `@heroicons/react` for icons used in EmptyState, ErrorState, Sidebar, and badges
- [x] Create `src/main.tsx` — wrap `<App />` in `<QueryClientProvider>` (staleTime 60s, gcTime 5m, retry 3,
      refetchOnWindowFocus false) and `<RouterProvider>`
- [x] Create `src/router.tsx` — define all 6 routes using `createBrowserRouter`: `/`, `/services/:id`, `/teams`,
      `/teams/:id`, `/incidents`, `/incidents/:id`; wrap all in `<AppShell>`
- [x] Create `src/lib/api.ts` — Axios instance with `baseURL: import.meta.env.VITE_API_BASE_URL`, 15s timeout, response
      interceptor that extracts `data` from `{ success: true, data }` and throws normalized `ApiError` on
      `success: false`
- [x] Create `src/lib/queryKeys.ts` — query key factories: `serviceKeys`, `teamKeys`, `incidentKeys`, `graphKeys` with
      consistent key structures
- [x] Create `src/hooks/useServices.ts`, `useTeams.ts`, `useIncidents.ts`, `useGraph.ts` — React Query hooks wrapping
      API functions; `useBlastRadius` has `staleTime: 0`
- [x] Create `src/types/` — `service.types.ts`, `team.types.ts`, `incident.types.ts`, `graph.types.ts` mirroring backend
      interfaces exactly
- [x] Create `src/store/uiStore.ts` — React context with `isSidebarOpen`, `setIsSidebarOpen`, `selectedServiceId`,
      `setSelectedServiceId`; export `UIProvider` and `useUI` hook
- [x] Create `src/components/common/Card.tsx` — base card with `bg-slate-800 border border-slate-700 rounded-xl` and
      hover state
- [x] Create `src/components/common/Badge.tsx` — generic badge with `color`, `size`, `dot`, `dotAnimate` props
- [x] Create `src/components/common/Spinner.tsx` — animated SVG spinner in blue-500
- [x] Create `src/components/common/EmptyState.tsx` — centered icon + title + description + optional action button
- [x] Create `src/components/common/ErrorState.tsx` — centered alert icon + title + description + optional retry
      button + optional error code in monospace
- [x] Create `src/components/common/ErrorBoundary.tsx` — class component catching render errors, renders `<ErrorState>`
      fallback
- [x] Create `src/components/common/PageHeader.tsx` — title, subtitle, optional badge, optional right-aligned actions
- [x] Create `src/components/layout/Sidebar.tsx` — fixed left nav with logo, 3 nav links (Service Map, Teams, Incidents)
      with active route highlight, active incident count badge, GitHub external link at bottom
- [x] Create `src/components/layout/TopBar.tsx` — page title + breadcrumb + mobile hamburger button toggling
      `isSidebarOpen`
- [x] Create `src/components/layout/AppShell.tsx` — renders `<Sidebar>` + `<main>` with `<Outlet>`; on mobile sidebar is
      a fixed overlay with backdrop; on desktop sidebar is always visible
- [x] Verify `npm run dev` in `client/` serves the dark-themed shell at `http://localhost:5173` with working nav links

---

## Phase 8A — Product Entry & Demo Journey

> Goal: A first-time visitor immediately understands what BlastRadius does and can enter a meaningful demo without
> reading documentation.

- [x] Replace the current generic first screen with a product start screen focused on the question: "What happens if
      this service fails?"
- [x] Add a primary CTA: "Start incident simulation" that moves the user into the demo workflow.
- [x] Add a secondary CTA: "Explore architecture risk" that opens the service map with risk-first sorting.
- [x] Add a "Continue with demo workspace" path that requires no login and uses seeded data.
- [x] Add a compact product explanation panel with 3 plain-language outcomes: affected services, teams to page, response
      plan.
- [x] Add a demo scenario picker with at least 5 realistic scenarios: auth outage, checkout slowdown, database failure,
      queue backlog, deploy regression.
- [x] Create `src/data/demoScenarios.ts` with scenario id, title, starting service id, severity, prompt copy, and
      expected business impact.
- [x] Add a `DemoScenarioCard` component that shows scenario title, affected domain, severity, and start action.
- [x] Add a `/start` route that presents the guided product entry experience.
- [x] Update `/` to redirect to `/start` unless the user has an active workspace/session.
- [x] Add "Skip to service map" for technical users who already know what they want.
- [x] Add empty-state copy that explains what to do next, not just that data is missing.
- [x] Add loading copy that describes the current action: "Reading dependency graph", "Finding owners", "Preparing
      plan".
- [x] Add a first-run checklist in UI state: choose scenario, inspect hops, review teams, copy plan.
- [x] Add a visible "Why this matters" section for non-technical reviewers with one short example incident.
- [x] Make the Sylva/ThreeUI hero serve the product start screen without hiding the operational controls below the fold.
- [x] Verify a reviewer can land on `/start`, choose a scenario, and reach the service map in under 30 seconds.
- [x] Update README screenshots and demo script to start from the new `/start` journey.

---

## Phase 8B — Auth, Users & Workspaces

> Goal: The app has a real starting point, a clear user identity, and a workspace boundary so service graphs are not
> just global demo data.

- [ ] Choose an auth approach for v1: passwordless email, GitHub OAuth, or demo-only local auth; document the decision
      in `docs/AUTH.md`.
- [ ] Create `User` and `Workspace` entities in the data model with ownership relationships.
- [ ] Add `Membership` or equivalent relationship connecting users to workspaces with roles: owner, responder, viewer.
- [ ] Add migration/constraint tasks for unique user email and workspace id.
- [ ] Add seed data for one demo workspace and at least three demo users: on-call engineer, manager, viewer.
- [ ] Add backend env variables for auth/session settings without hardcoding secrets.
- [ ] Add login endpoint or auth callback endpoint depending on chosen provider.
- [ ] Add logout endpoint that clears the active session.
- [ ] Add `/api/me` endpoint returning current user, active workspace, role, and feature flags.
- [ ] Add workspace switch endpoint or client-side workspace selector if multiple workspaces are available.
- [ ] Scope all service, team, incident, deployment, and graph queries by workspace id.
- [ ] Update tests to prove users cannot access another workspace's services or incidents.
- [ ] Add `AuthProvider` on the frontend with loading, signed-out, demo, and signed-in states.
- [ ] Add `RequireAuth` or `RequireWorkspace` route wrapper for non-demo private routes.
- [ ] Create `/login` page with "Continue with demo workspace" and the chosen real auth option.
- [ ] Add account menu in the top bar showing user name, workspace name, and logout.
- [ ] Add role-aware UI: viewers can inspect and share, responders can create simulations/action plans, owners can
      manage workspace settings.
- [ ] Add workspace settings page with workspace name, default severity, and team escalation preferences.
- [ ] Verify unauthenticated users land on `/login` and can enter demo mode without seeing a blank app.
- [ ] Verify signed-in/demo sessions survive refresh and can be cleared with logout.

---

## Phase 8C — Incident Triage Workflow

> Goal: The central workflow is not browsing cards; it is starting from a concrete failure and getting an incident
> answer.

- [ ] Create `/triage/new` route for starting a new incident simulation.
- [ ] Add failing service search with typeahead, service tier, owner team, and dependency count in each result.
- [ ] Add scenario prefill so choosing a demo scenario opens `/triage/new` with service, severity, and context filled
      in.
- [ ] Add severity selector with clear business meaning for SEV1, SEV2, and SEV3.
- [ ] Add incident context input: short symptom, customer impact, and optional suspected deployment.
- [ ] Add max-hop control with a sensible default and copy explaining why deeper hops can create noise.
- [ ] Add "Run blast radius" action that creates a local triage run and opens `/triage/:runId`.
- [ ] Add backend model for `TriageRun` with id, workspace id, root service id, severity, context, created_by,
      created_at.
- [ ] Add `POST /api/triage-runs` to create a run and persist the selected scenario/context.
- [ ] Add `GET /api/triage-runs/:id` to retrieve the run, blast radius result, teams to page, and recommendations.
- [ ] Add `GET /api/triage-runs` to list recent simulations for the workspace.
- [ ] Add tests for creating and retrieving triage runs.
- [ ] Build `/triage/:runId` page with a clear top summary: root service, severity, affected count, team count.
- [ ] Show blast radius hop groups as the primary experience, with progressive reveal and pause/replay controls.
- [ ] Show "Immediate teams to page" beside the graph, sorted by critical service ownership first.
- [ ] Show "Likely customer impact" generated from affected service types and tiers using deterministic rules.
- [ ] Show "Recommended first checks" using service type and incident history: logs, deploys, upstream DB, queue lag,
      cache health.
- [ ] Show historical incidents matching the root service or same affected team set.
- [ ] Add a "Mark as active incident" action that converts a simulation into a real incident record.
- [ ] Add a "Close simulation" action that returns to service map without losing recent run history.
- [ ] Verify the auth outage demo produces a readable triage page with affected services, page list, and next steps.
- [ ] Verify all triage flow states exist: no service selected, loading graph, graph error, no affected services, and
      successful result.

---

## Phase 8D — Action Plan & Collaboration

> Goal: BlastRadius turns graph output into something a responder can send, save, and act on during an incident.

- [ ] Create an `ActionPlan` type with summary, affected services, teams to page, first checks, comms draft, and status.
- [ ] Add backend endpoint `POST /api/triage-runs/:id/action-plan` that creates a deterministic action plan from a run.
- [ ] Add backend endpoint `GET /api/action-plans/:id` to retrieve saved plans.
- [ ] Add backend endpoint `PATCH /api/action-plans/:id` to update status, notes, and owner.
- [ ] Add tests for action plan creation, retrieval, and update authorization.
- [ ] Add `ActionPlanPanel` on the triage page with sections: Impact, Owners, First Checks, Update Draft.
- [ ] Add "Copy incident update" button that copies a plain-language status update to clipboard.
- [ ] Add "Copy Slack page list" button that copies team channels grouped by severity/criticality.
- [ ] Add "Export summary" button that downloads a Markdown incident brief.
- [ ] Add "Assign owner" field for a responder to take responsibility for the plan.
- [ ] Add checklist interactions for first checks: pending, in progress, done, skipped.
- [ ] Add notes field for responder observations during the simulation or incident.
- [ ] Add shareable read-only link for a triage run or action plan within the same workspace.
- [ ] Add visual distinction between demo-generated plans and real incident plans.
- [ ] Add audit trail entries for plan created, note added, checklist updated, copied update, exported summary.
- [ ] Add "what changed since last run" comparison when a service has previous triage runs.
- [ ] Verify a user can run a scenario and copy a useful status update without editing raw graph data.
- [ ] Verify exported Markdown includes timestamp, root service, affected count, teams, and next actions.

---

## Phase 8E — Product Analytics & Feedback

> Goal: Validate whether users understand and complete the core journey, without collecting sensitive data.

- [ ] Define product events: start viewed, demo selected, triage started, blast radius viewed, action plan copied, share
      link created.
- [ ] Add privacy note documenting that service names and incident notes are not sent to third-party analytics in v1.
- [ ] Add local analytics adapter that logs events in development and can be disabled in production.
- [ ] Track first-run funnel progress in client state and expose it in development for debugging.
- [ ] Add "Was this useful?" feedback prompt after a user copies or exports an action plan.
- [ ] Add feedback endpoint storing rating, optional comment, workspace id, and triage run id.
- [ ] Add tests for feedback validation and rejection of empty/invalid payloads.
- [ ] Add admin-only feedback list endpoint for workspace owners.
- [ ] Add small workspace insights panel: simulations this week, most tested service, most paged team.
- [ ] Verify demo journey completion can be measured locally from `/start` to copied action plan.

---

## Phase 8 — Frontend Pages (client/)

> Goal: All 6 pages are built with full loading/empty/error states and the blast radius animation works.

- [x] Create `src/components/service/ServiceBadge.tsx` — type badge (api/gateway/worker/database/cache/queue) and tier
      badge (critical/high/medium/low) using correct colors from design system
- [x] Create `src/components/service/ServiceCard.tsx` — renders name, type badge, tier badge, team name,
      dependency/dependent counts; supports `variant` (default/compact/affected), `isHighlighted`, `animationDelay`
      props
- [x] Create `src/components/service/ServiceSkeleton.tsx` — `animate-pulse` skeleton cards matching ServiceCard
      dimensions
- [x] Create `src/components/service/ServiceGrid.tsx` — groups services by team, renders team label header + responsive
      CSS grid of ServiceCards; dims non-selected cards when a service is selected
- [x] Create `src/pages/ServiceMapPage.tsx` — fetches all services with `useServices`, renders `<ServiceGrid>`; clicking
      a service sets `selectedServiceId` in UIStore and opens `<BlastRadiusPanel>` slide-in panel; filter controls
      (type, tier dropdown)
- [x] Create `src/components/blast-radius/AffectedServiceCard.tsx` — compact card with CSS `opacity`/`translate-y`
      transition controlled by `isVisible` and `animationDelay` props
- [x] Create `src/components/blast-radius/HopGroup.tsx` — labeled divider `"── Hop N ──"` + horizontal scroll of
      AffectedServiceCards; staggered card reveal at 120ms intervals using `useEffect` + `setTimeout`
- [x] Create `src/components/blast-radius/TeamAlertBanner.tsx` — red-bordered banner listing teams + slack channels +
      affected service names; fades in after all hops are revealed
- [x] Create `src/components/blast-radius/BlastRadiusPanel.tsx` — fetches blast radius with `useBlastRadius(serviceId)`;
      manages `revealedHops` state (0 → totalHops at 700ms intervals); renders header, hop groups progressively,
      TeamAlertBanner, historical incidents; slides in from right with `translate-x-full → translate-x-0` transition
- [x] Implement and verify hop-by-hop animation timing: 700ms between hops, 120ms card stagger within each hop, 300ms
      CSS transition, TeamAlertBanner appears 400ms after last hop
- [x] Create `src/components/dependency/UpstreamList.tsx` and `DownstreamList.tsx` — compact lists of
      upstream/downstream services with criticality labels; warn if `dependentCount > 10`
- [x] Create `src/components/dependency/DependencyExplorer.tsx` — fetches dependencies with
      `useDependencies(serviceId)`, renders UpstreamList and DownstreamList in 2-column layout (stacked on mobile)
- [x] Create `src/pages/ServiceDetailPage.tsx` — renders service header (name, badges, repo link),
      `<DependencyExplorer>`, `<BlastRadiusPanel>` (always visible on this page, not toggled), historical incidents
      caused by this service
- [x] Create `src/components/team/TeamCard.tsx` — team name, slack channel, timezone, service count, active incident
      count with amber pulsing dot if > 0
- [x] Create `src/components/team/TeamSkeleton.tsx` — skeleton variant
- [x] Create `src/components/team/TeamGrid.tsx` — responsive grid of TeamCards
- [x] Create `src/pages/TeamsPage.tsx` — fetches all teams with `useTeams`, renders `<TeamGrid>` with
      loading/empty/error states
- [x] Create `src/pages/TeamDetailPage.tsx` — fetches team detail with `useTeam(id)`, renders team oncall info card,
      owned services list, active incidents list
- [x] Create `src/components/incident/IncidentBadge.tsx` — severity badge (SEV1/SEV2/SEV3) and status badge
      (active/monitoring/resolved) with correct colors; active incidents have pulsing dot
- [x] Create `src/components/incident/IncidentCard.tsx` — title, severity badge, status badge, relative time, duration
      (or "Ongoing"), affected service count, root cause service name; supports `variant` (default/compact)
- [x] Create `src/components/incident/IncidentSkeleton.tsx` — skeleton variant
- [x] Create `src/pages/IncidentsPage.tsx` — fetches all incidents with `useIncidents(filters)`, renders list with
      severity + status filter dropdowns; loading/empty/error states with appropriate copy per state
- [x] Create `src/pages/IncidentDetailPage.tsx` — incident title, severity/status badges, timeline (started → resolved),
      root cause service card, affected services grid, triggering deployment (if any)
- [x] Verify all 6 routes render without React or TypeScript errors by visiting each in the browser

---

## Phase 9 — Frontend Tests (client/)

> Goal: 60% coverage on components; key user flows tested with React Testing Library.

- [ ] Create `vitest.config.ts` in `client/` — configure `environment: jsdom`, `globals: true`,
      `setupFiles: ["src/tests/setup.ts"]`, `coverage.thresholds: { lines: 60, branches: 60 }`
- [ ] Create `src/tests/setup.ts` — import `@testing-library/jest-dom`, call `cleanup` in `afterEach`
- [ ] Create `src/tests/msw/handlers.ts` — MSW request handlers for all 8 API endpoints returning mock fixture data
- [ ] Create `src/tests/msw/server.ts` — MSW server setup with `setupServer(...handlers)`; configure
      `beforeAll`/`afterEach`/`afterAll` lifecycle
- [ ] Create `src/tests/fixtures/` — `services.fixture.ts`, `teams.fixture.ts`, `incidents.fixture.ts` with typed mock
      data matching TypeScript interfaces
- [ ] Create `src/tests/unit/components/ServiceCard.test.tsx` — test renders name/badges/team; affected variant styles;
      isHighlighted styles; onClick called; renders link to detail page
- [ ] Create `src/tests/unit/components/BlastRadiusPanel.test.tsx` — use `vi.useFakeTimers()`; test shows spinner while
      loading; reveals hop 1 after 700ms; reveals all hops after `700*totalHops`ms; TeamAlertBanner only after all hops;
      empty state when no hops; error state on fetch failure; resets on serviceId change
- [ ] Create `src/tests/unit/components/IncidentCard.test.tsx` — test renders all fields; SEV1 active styles; resolved
      reduced opacity; compact variant; relative time; "Ongoing" vs duration
- [ ] Create `src/tests/unit/components/TeamCard.test.tsx` — test renders name/channel/timezone; pulsing dot when
      activeIncidentCount > 0; no dot when 0
- [ ] Create `src/tests/integration/ServiceMapPage.test.tsx` — MSW mocked; test renders service cards grouped by team;
      clicking a card opens blast radius panel; panel shows correct service name; closing panel hides it; error state on
      API failure
- [ ] Create `src/tests/integration/IncidentsPage.test.tsx` — test renders incident list; severity filter narrows
      results; status filter narrows results; clear filters resets; error state on API failure; empty state for filtered
      results
- [ ] Run `npm run test:coverage --workspace=client` and confirm ≥60% line and branch coverage

---

## Phase 10 — Observability & Security

> Goal: The app logs enough to debug production issues and is hardened against common vulnerabilities.

- [ ] Add **Morgan** request logging to `server/src/middleware/requestLogger.ts` — log format: `dev` in development,
      `combined` (Apache format) in production; log to stdout only
- [ ] Add **Helmet** middleware to `server/src/app.ts` — `app.use(helmet())` to set secure HTTP headers
      (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS in production)
- [ ] Add **rate limiting** to `server/src/app.ts` using `express-rate-limit` — 100 requests per 15 minutes per IP on
      all `/api/*` routes; 200 per 15 minutes on `/health`
- [ ] Add **request ID** middleware to `server/src/middleware/requestId.ts` — generate a UUID per request, attach to
      `req.id`, include `X-Request-ID` in all responses; helps correlate Railway logs
- [ ] Add `console.error` logging in the global error handler for 5xx errors including `req.id`, error code, and stack
      trace (never in production responses)
- [ ] Create `server/src/utils/logger.ts` — simple logger wrapping `console.log/warn/error` that prefixes
      `[timestamp][level]` and respects `LOG_LEVEL` env var (suppress debug logs in production)
- [ ] Audit all `server/` source files for hardcoded credentials, secrets, or localhost URIs — replace with env vars
      where found
- [ ] Add `Content-Security-Policy` meta tag to `client/index.html` limiting script sources to `'self'`
- [ ] Configure Vite's `server.headers` in `vite.config.ts` to add `X-Frame-Options: DENY` and
      `X-Content-Type-Options: nosniff` in development
- [ ] Run `npm audit` in both `server/` and `client/` workspaces; fix all `high` and `critical` severity vulnerabilities
      before deployment

---

## Phase 11 — Integration & End-to-End Verification

> Goal: The full stack works together end-to-end on the local machine before deployment.

- [ ] Start backend (`npm run dev --workspace=server`) and verify all 10 endpoints return correct responses using curl
      or a REST client
- [ ] Start frontend (`npm run dev --workspace=client`) and navigate to all 6 routes — confirm no console errors in
      DevTools
- [ ] Run blast radius simulation on `svc-auth` — verify 3+ labeled hop groups appear with the staggered card animation
- [ ] Verify the TeamAlertBanner appears after all hop groups finish revealing
- [ ] Click a team in TeamAlertBanner — verify it navigates to the correct `/teams/:id` page
- [ ] Open an incident detail page — verify root cause service, affected services grid, and triggering deployment (where
      applicable) are all displayed
- [ ] Open the Dependency Explorer for `svc-order-api` — verify `svc-auth` and `svc-postgres-main` appear in the
      upstream list
- [ ] Throttle network to "Slow 3G" in DevTools — verify skeleton loading states appear before data loads on every page
- [ ] Kill the backend process while the frontend is open — verify error states appear on all data-fetching pages
- [ ] Test on 375px mobile viewport — verify sidebar is hidden, hamburger opens overlay, layouts don't overflow
      horizontally
- [ ] Test on 768px tablet viewport — verify 2-column service grid, layout adapts without overflow
- [ ] Run `npm test` from repo root — confirm all unit and integration tests pass with no failures

---

## Phase 12 — Deployment

> Goal: The app is reachable at public URLs with production database.

- [ ] Create `server/Dockerfile` — `FROM node:20-alpine`, copy `package*.json` and source, run `npm ci --omit=dev`,
      compile TypeScript, expose port, `CMD ["node", "dist/index.js"]`
- [ ] Create `railway.toml` at repo root — specify `[build] builder = "NIXPACKS"`,
      `buildCommand = "npm install && npm run build --workspace=server"`,
      `startCommand = "npm start --workspace=server"`, `healthcheckPath = "/health"`
- [ ] Create `client/vercel.json` — `{ "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }] }` for
      SPA routing
- [ ] Set all Railway environment variables: `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`, `NEO4J_DATABASE`,
      `CLIENT_ORIGIN` (set to Vercel URL after deploy), `NODE_ENV=production`, `LOG_LEVEL=info`
- [ ] Deploy backend to Railway and wait for the health check to pass — confirm `GET /health` returns
      `{ "status": "ok", "database": { "connected": true } }`
- [ ] Set `VITE_API_BASE_URL` in Vercel environment variables to the Railway backend URL
- [ ] Deploy frontend to Vercel — confirm build succeeds and app loads at the assigned Vercel URL
- [ ] Update `CLIENT_ORIGIN` in Railway to the Vercel deployment URL and trigger a Railway redeploy
- [ ] Run blast radius simulation on the deployed app — confirm it works against live CognoDB data
- [ ] Verify CORS is not blocked by running: `curl -v -H "Origin: <vercel-url>" <railway-url>/health` and confirming
      `Access-Control-Allow-Origin` header is present
- [ ] Set up UptimeRobot (free) to ping `GET /health` every 10 minutes to keep CognoDB instance awake
- [ ] Add the deployed Vercel URL to `README.md` Live Demo link placeholder

---

## Phase 13 — Final Polish & Submission

> Goal: Repo is clean, documented, and ready to hand off.

- [ ] Replace all `<!-- screenshot -->` comments in `README.md` with actual screenshots: Service Map page, Blast Radius
      panel in action, Incident detail page
- [ ] Record a screen recording (2–3 minutes): Service Map → select a service → watch hop-by-hop animation → see
      TeamAlertBanner → navigate to incident → show root cause + affected services
- [ ] Verify `README.md` Quick Start instructions work end-to-end on a clean clone (test by following the steps from
      scratch in a temp directory)
- [ ] Run `git log --all -- "*.env"` to confirm no `.env` files were ever committed; if found, purge with
      `git filter-repo`
- [ ] Run `grep -r "password\|secret\|token" server/src client/src --include="*.ts" --include="*.tsx"` and confirm zero
      hardcoded secrets (env var references are acceptable)
- [ ] Run `npm test` in both `server/` and `client/` — confirm all tests pass and coverage thresholds are met
- [ ] Run `npm run build --workspace=server && npm run build --workspace=client` — confirm both production builds
      compile without errors
- [ ] Push all code to GitHub `main` branch via PR from `develop` — confirm all CI checks pass before merging
- [ ] Email hr@wexa.ai with repo URL, deployed demo link, and screen recording attached

---

## Definition of Done

**A task is complete when:**

- The file exists at the correct path with correct content
- It compiles without TypeScript errors (`tsc --noEmit` passes)
- Related tests pass (or the task is a manual verification step)
- The feature works end-to-end in the browser (for frontend tasks)
- No secrets are hardcoded; env vars are used for all config
- The screen tells the user what to do next without requiring a developer to explain it
- Empty, loading, and error states preserve the user journey instead of becoming dead ends
- Any feature that creates a result also gives the user a useful next action: page, copy, share, export, assign, or save

**A product flow is complete when:**

- A first-time visitor can enter through `/start` and understand the app's purpose in under 30 seconds
- A demo user can complete the full incident triage flow without signing up
- A signed-in user can work inside a clear workspace boundary
- A responder can turn a failing service into an action plan that names affected services, teams to page, likely impact,
  and first checks
- A non-technical reviewer can understand the outcome without reading API docs, seed files, or source code

**The project is complete when:**

- All 290 checkboxes above are checked
- Both test suites pass with coverage thresholds met (backend ≥80%, frontend ≥60%)
- The CI pipeline passes on `main` (lint, type-check, all tests)
- The app is deployed and reachable via a public URL
- The deployed demo starts at `/start` and demonstrates a complete incident triage journey
- The screen recording shows: start screen → demo scenario → failing service → blast radius → teams to page → copied
  action plan
- The submission email includes repo URL, deployed demo link, screen recording, and a short explanation of the product
  use case

---

_Last updated: 2026-08-29 — Phase breakdown: 13 core phases plus 5 product-usefulness phases, 290 atomic tasks_
