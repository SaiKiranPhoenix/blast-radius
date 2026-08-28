You are a senior engineering lead. Based on all the documents in the `docs/` folder 
(ARCHITECTURE.md, API.md, DATA_MODEL.md, FRONTEND.md, TESTING.md, SEED.md, 
DEPLOYMENT.md) and the README.md, generate a single markdown file called 
`PRODUCT_COMPLETION_BOARD.md` at the root of the repository.

This file is the single source of truth for building BlastRadius end-to-end.
It must capture every atomic task required to go from an empty repo to a fully 
deployed, tested, production-ready application.

---

## File Structure Requirements

The file must have the following top-level sections in this order:

1. Header — project name, tagline, and a short "how to use this board" note
2. Progress Summary — a live-updated summary block showing X/Y tasks complete per phase
3. Phases — each phase as an H2 section with tasks as checkboxes
4. Definition of Done — what "complete" means for this project

---

## Phases and Tasks

Generate checkbox tasks (- [ ] task description) for every phase below.
Every task must be atomic — one clear action, one clear output, completable in 
one focused sitting. No vague tasks like "build the frontend". 
Every task must start with an action verb.
- [ ] = is not completed
- [x] = is completed

---

### Phase 0 — Repository & Environment Setup
- [ ]Monorepo folder structure creation
- [ ]Root .gitignore (node_modules, .env, dist, coverage)
- [ ]Root package.json with workspaces config
- [ ]server/ package.json with all dependencies listed
- [ ]client/ package.json with all dependencies listed  
- [ ]seed/ package.json with all dependencies listed
- [ ]server/ tsconfig.json
- [ ]client/ tsconfig.json (Vite-compatible)
- [ ]seed/ tsconfig.json
- [ ]server/.env.example with all required variables
- [ ]client/.env.example with all required variables
- [ ]seed/.env.example with all required variables
- [ ]Verify CognoDB instance is provisioned and connection URI is saved
- [ ]Verify neo4j-driver connects to CognoDB instance successfully

---

### Phase 1 — Database Layer (server/)
- [ ]Create src/db/driver.ts — singleton neo4j driver with env var config
- [ ]Create src/db/connection.ts — connect(), disconnect(), verifyConnectivity()
- [ ]Create src/db/indexes.ts — all CognoDB constraints and indexes as Cypher
- [ ]Write and run index creation script against live CognoDB instance
- [ ]Verify driver connects, sessions open and close cleanly
- [ ]Write unit test for driver singleton (mock neo4j-driver)
- [ ]Write unit test for verifyConnectivity (mock session)

---

### Phase 2 — Seed Script (seed/)
- [ ]Create seed/src/data/teams.ts — 10 team objects with all properties
- [ ]Create seed/src/data/services.ts — 40 service objects with all properties
- [ ]Create seed/src/data/dependencies.ts — dependency topology (which service depends on which, with criticality and latency)
- [ ]Create seed/src/data/incidents.ts — 20 incident objects with all properties
- [ ]Create seed/src/data/deployments.ts — 15 deployment objects with all properties
- [ ]Create seed/src/seed.ts — main orchestrator: clear → constraints → teams → services → dependencies → incidents → deployments
- [ ]Create seed/src/steps/clearDatabase.ts — MATCH (n) DETACH DELETE n
- [ ]Create seed/src/steps/seedTeams.ts — MERGE-based team creation
- [ ]Create seed/src/steps/seedServices.ts — MERGE-based service creation
- [ ]Create seed/src/steps/seedDependencies.ts — MERGE-based relationship creation
- [ ]Create seed/src/steps/seedIncidents.ts — incident nodes + CAUSED_BY + AFFECTED relationships
- [ ]Create seed/src/steps/seedDeployments.ts — deployment nodes + DEPLOYED_TO + TRIGGERED relationships
- [ ]Verify dependency graph has at least one 4-hop chain after seeding
- [ ]Verify node counts: 40 Service, 10 Team, 20 Incident, 15 Deployment
- [ ]Verify relationship counts match expected totals
- [ ]Document re-seed command in SEED.md

---

### Phase 3 — Backend API (server/)
- [ ]Create src/types/index.ts — all shared TypeScript interfaces (Service, Team, Incident, Deployment, BlastRadiusHop, etc.)
- [ ]Create src/utils/errors.ts — AppError class, typed HTTP error factory functions
- [ ]Create src/utils/cypher.ts — query constants file with all 5 named Cypher queries
- [ ]Create src/middleware/errorHandler.ts — global Express error handler
- [ ]Create src/middleware/notFound.ts — 404 handler
- [ ]Create src/middleware/cors.ts — CORS config reading allowed origins from env
- [ ]Create src/app.ts — Express app setup, middleware registration, route mounting
- [ ]Create src/server.ts — HTTP server entry point, graceful shutdown
- [ ]Create src/services/serviceService.ts — getAllServices(), getServiceById(), getBlastRadius(), getDependencies()
- [ ]Create src/services/teamService.ts — getAllTeams(), getTeamById()
- [ ]Create src/services/incidentService.ts — getAllIncidents(), getIncidentById()
- [ ]Create src/services/graphService.ts — getLongestChain()
- [ ]Create src/controllers/serviceController.ts — Express handlers for service routes
- [ ]Create src/controllers/teamController.ts — Express handlers for team routes
- [ ]Create src/controllers/incidentController.ts — Express handlers for incident routes
- [ ]Create src/controllers/graphController.ts — Express handler for graph routes
- [ ]Create src/routes/services.ts — GET /api/services, GET /api/services/:id, GET /api/services/:id/blast-radius, GET /api/services/:id/dependencies
- [ ]Create src/routes/teams.ts — GET /api/teams, GET /api/teams/:id
- [ ]Create src/routes/incidents.ts — GET /api/incidents, GET /api/incidents/:id
- [ ]Create src/routes/graph.ts — GET /api/graph/longest-chain
- [ ]Create src/routes/health.ts — GET /health with DB connectivity check
- [ ]Manually test GET /health returns 200 with DB connected status
- [ ]Manually test GET /api/services returns 40 services
- [ ]Manually test GET /api/services/:id/blast-radius returns hop-grouped results
- [ ]Manually test GET /api/incidents returns 20 incidents

---

### Phase 4 — Backend Tests (server/)
- [ ]Set up Vitest config for server (vitest.config.ts)
- [ ]Create test/unit/services/serviceService.test.ts — mock driver, test getAllServices, getServiceById, getBlastRadius, getDependencies
- [ ]Create test/unit/services/teamService.test.ts — mock driver, test getAllTeams, getTeamById
- [ ]Create test/unit/services/incidentService.test.ts — mock driver, test getAllIncidents, getIncidentById
- [ ]Create test/unit/services/graphService.test.ts — mock driver, test getLongestChain
- [ ]Create test/unit/middleware/errorHandler.test.ts — test error shapes and HTTP codes
- [ ]Create test/unit/db/driver.test.ts — test singleton behavior
- [ ]Create test/integration/api/services.test.ts — supertest against running Express app with mocked DB
- [ ]Create test/integration/api/teams.test.ts — supertest with mocked DB
- [ ]Create test/integration/api/incidents.test.ts — supertest with mocked DB
- [ ]Create test/integration/api/health.test.ts — test healthy and unhealthy DB states
- [ ]Run full backend test suite and confirm 80% coverage threshold passes
- [ ]Add test script to server/package.json

---

### Phase 5 — Frontend Shell (client/)
- [ ]Scaffold Vite + React + TypeScript project in client/
- [ ]Install and configure Tailwind CSS with custom theme tokens
- [ ]Install react-router-dom, @tanstack/react-query, axios
- [ ]Create src/main.tsx — QueryClientProvider + RouterProvider setup
- [ ]Create src/router.tsx — all routes defined (/, /services/:id, /teams, /teams/:id, /incidents, /incidents/:id)
- [ ]Create src/lib/api.ts — axios instance with base URL from env, interceptors for errors
- [ ]Create src/lib/queryKeys.ts — all React Query key factories
- [ ]Create src/types/index.ts — mirrored TypeScript interfaces from backend
- [ ]Create src/styles/globals.css — Tailwind directives + CSS custom properties
- [ ]Configure tailwind.config.ts — slate-950 bg, red/blue/amber accent palette, Inter + JetBrains Mono fonts
- [ ]Create src/components/layout/AppShell.tsx — sidebar nav + main content area
- [ ]Create src/components/layout/Sidebar.tsx — nav links with active state
- [ ]Create src/components/layout/TopBar.tsx — app name, breadcrumb
- [ ]Create src/components/ui/Badge.tsx — type and tier badges with color variants
- [ ]Create src/components/ui/Card.tsx — base card wrapper
- [ ]Create src/components/ui/SkeletonCard.tsx — loading skeleton animation
- [ ]Create src/components/ui/EmptyState.tsx — icon + message + optional action
- [ ]Create src/components/ui/ErrorState.tsx — error message + retry button
- [ ]Create src/components/ui/Spinner.tsx — loading spinner
- [ ]Verify app shell renders with correct dark theme and navigation

---

### Phase 6 — Frontend Pages (client/)
- [ ]Create src/pages/ServiceMap.tsx — grid of ServiceCards grouped by team, search/filter bar
- [ ]Create src/components/services/ServiceCard.tsx — name, type badge, tier badge, team name, dependency count
- [ ]Create src/components/services/ServiceCardSkeleton.tsx — skeleton variant
- [ ]Create src/pages/ServiceDetail.tsx — service info, dependency explorer, blast radius trigger button
- [ ]Create src/components/services/DependencyList.tsx — upstream + downstream service lists
- [ ]Create src/components/blast/BlastRadiusSimulator.tsx — orchestrates hop-by-hop animation
- [ ]Create src/components/blast/HopGroup.tsx — labeled group of affected service cards per hop
- [ ]Create src/components/blast/AffectedServiceCard.tsx — card shown inside blast radius result
- [ ]Create src/components/blast/TeamsToPage.tsx — list of teams + slack channels to notify
- [ ]Implement hop-by-hop reveal animation: fetch all hops, reveal hop 1 cards after 400ms, hop 2 after 800ms, hop 3 after 1200ms using setTimeout + CSS opacity/translate transitions
- [ ]Create src/pages/TeamList.tsx — grid of team cards with service count and oncall info
- [ ]Create src/components/teams/TeamCard.tsx — team name, slack channel, timezone, service count
- [ ]Create src/pages/TeamDetail.tsx — team info, owned services list, active incidents
- [ ]Create src/pages/IncidentList.tsx — table of incidents with severity badge, status, duration, affected count
- [ ]Create src/components/incidents/IncidentRow.tsx — single row in incident table
- [ ]Create src/components/incidents/SeverityBadge.tsx — SEV1/SEV2/SEV3 with red/amber/blue colors
- [ ]Create src/pages/IncidentDetail.tsx — incident info, root cause service, affected services list, linked deployment
- [ ]Add loading skeleton to every page (shown while React Query fetches)
- [ ]Add empty state to every page (shown when data array is empty)
- [ ]Add error state to every page (shown when API call fails, with retry)
- [ ]Verify all 6 routes render without console errors

---

### Phase 7 — Frontend Tests (client/)
- [ ]Set up Vitest + React Testing Library config in client/
- [ ]Create test/components/ui/Badge.test.tsx — renders correct color per variant
- [ ]Create test/components/ui/EmptyState.test.tsx — renders message and action
- [ ]Create test/components/ui/ErrorState.test.tsx — renders error and retry handler
- [ ]Create test/components/services/ServiceCard.test.tsx — renders all props correctly
- [ ]Create test/components/blast/BlastRadiusSimulator.test.tsx — mock API, verify hop groups render in sequence
- [ ]Create test/components/incidents/SeverityBadge.test.tsx — correct color per severity
- [ ]Create test/pages/ServiceMap.test.tsx — renders service grid, handles loading and error states
- [ ]Create test/pages/IncidentList.test.tsx — renders incident rows, handles empty state
- [ ]Run full frontend test suite and confirm 60% coverage threshold passes
- [ ]Add test script to client/package.json

---

### Phase 8 — Integration & End-to-End Verification
- [ ]Start backend locally, verify all 10 API endpoints return correct data
- [ ]Start frontend locally, verify all 6 pages load without errors
- [ ]Run blast radius simulation on auth-service, verify 3+ hop groups appear with animation
- [ ]Verify teams-to-page section lists correct teams for selected service
- [ ]Click an incident, verify affected services and root cause service display correctly
- [ ]Verify loading skeletons appear before data loads (throttle network in DevTools)
- [ ]Verify error states appear when backend is unreachable
- [ ]Verify empty states appear on pages with no data
- [ ]Test on mobile viewport (375px) — verify layout doesn't break
- [ ]Test on tablet viewport (768px) — verify layout adapts correctly

---

### Phase 9 — Deployment
- [ ]Create server/Dockerfile (optional but recommended for Railway)
- [ ]Create railway.toml with build and start commands for backend
- [ ]Create vercel.json with build config and rewrite rules for frontend SPA routing
- [ ]Deploy backend to Railway — set all env vars, verify /health returns 200
- [ ]Deploy frontend to Vercel — set VITE_API_URL to Railway backend URL, verify build succeeds
- [ ]Verify deployed frontend can reach deployed backend (no CORS errors)
- [ ]Verify blast radius simulation works on deployed app against live CognoDB
- [ ]Add deployed frontend URL to README.md demo link placeholder
- [ ]Keep CognoDB instance running (do not delete or pause)

---

### Phase 10 — Final Polish & Submission
- [ ]Add all UI screenshots to README.md (replace <!-- screenshot --> placeholders)
- [ ]Record screen recording: show service map → click a service → run blast radius → show hop animation → navigate to incident → show teams to page
- [ ]Verify README.md has complete setup instructions a stranger could follow
- [ ]Verify no .env files are committed (check git log)
- [ ]Verify no hardcoded credentials anywhere in codebase (grep for password/secret)
- [ ]Run `npm run test` in both server/ and client/ — confirm all pass
- [ ]Push all code to GitHub
- [ ]Email hr@wexa.ai with repo URL, demo link, and screen recording

---

## Output Format Requirements

- [ ]Filename: `PRODUCT_COMPLETION_BOARD.md`
- [ ]Place it at the repository root
- [ ]Every task is a checkbox: `- [ ] task`
- [ ]Group tasks under their Phase H2 heading
- [ ]At the top of the file, include this progress summary block 
  (values start at 0, to be updated manually as tasks complete):

```md
## Progress

| Phase | Tasks | Done | Remaining |
|-------|-------|------|-----------|
| Phase 0 — Setup | 13 | 0 | 13 |
| Phase 1 — Database Layer | 7 | 0 | 7 |
| Phase 2 — Seed Script | 16 | 0 | 16 |
| Phase 3 — Backend API | 24 | 0 | 24 |
| Phase 4 — Backend Tests | 11 | 0 | 11 |
| Phase 5 — Frontend Shell | 19 | 0 | 19 |
| Phase 6 — Frontend Pages | 22 | 0 | 22 |
| Phase 7 — Frontend Tests | 10 | 0 | 10 |
| Phase 8 — Integration | 10 | 0 | 10 |
| Phase 9 — Deployment | 9 | 0 | 9 |
| Phase 10 — Submission | 8 | 0 | 8 |
| **Total** | **149** | **0** | **149** |
```

- [ ]At the bottom of the file, include a Definition of Done section:

```md
## Definition of Done

A task is complete when:
- [ ]The file exists at the correct path with correct content
- [ ]It compiles without TypeScript errors
- [ ]Related tests pass
- [ ]The feature works end-to-end in the browser (for frontend tasks)
- [ ]No secrets are hardcoded

The project is complete when:
- [ ]All 149 checkboxes are checked
- [ ]Both test suites pass with coverage thresholds met
- [ ]The app is deployed and reachable via public URL
- [ ]The screen recording is made
- [ ]The submission email is sent
```

Generate the complete PRODUCT_COMPLETION_BOARD.md file now. Do not truncate, 
do not use placeholders, write every single checkbox task in full.