# BlastRadius

> **See what breaks when something breaks.**

BlastRadius is an SRE incident blast radius explorer backed by a graph database. It models your microservice
architecture as a graph, and when any service fails, it instantly shows every downstream service affected — hop by hop —
every team that needs to be paged, and every historical incident that followed the same failure path.

<!-- screenshot: Service Map page showing 40 service cards grouped by team -->

<!-- screenshot: Blast radius panel animating hop-by-hop for the Auth Service -->

<!-- screenshot: Incident detail page showing affected services and root cause -->

---

## Live Demo

> 🚀 **[blast-radius.vercel.app](https://blast-radius.vercel.app)** — _link placeholder_

---

## Why a Graph Database?

A microservice blast radius is a **graph problem**. Using a relational database for this would require:

- Recursive CTEs or 5 self-joins to find 5-hop chains
- Separate queries to join teams, incidents, and deployments to affected services
- No native way to express "find all services reachable from this node within N hops"

A graph database solves all of this natively:

- **Variable-length path traversal** in one query: `MATCH (root)<-[:DEPENDS_ON*1..5]-(affected)`
- **Pattern composition**: combine traversal + team lookup + incident history in one Cypher statement
- **Relationship-first modeling**: dependency criticality, incident causation, and deployment triggers are all
  first-class graph edges
- **Natural data model**: the dependency graph IS the data — no impedance mismatch between the domain and the schema

---

## Data Model

```
                    ┌─────────────┐
                    │  Deployment │
                    └──────┬──────┘
           :DEPLOYED_TO    │    :TRIGGERED
                    ┌──────┘──────┐
                    ▼             ▼
              ┌──────────┐  ┌──────────┐
              │  Service │  │ Incident │
              └────┬─────┘  └────┬─────┘
                   │              │
    :OWNS    :DEPENDS_ON    :CAUSED_BY  :AFFECTED
      │        (self)        ◄────────────────┘
      ▼
  ┌──────┐
  │ Team │
  └──────┘
```

| Node         | Key Properties                                        |
| ------------ | ----------------------------------------------------- |
| `Service`    | id, name, type, tier, description, language, repo_url |
| `Team`       | id, name, slack_channel, oncall_email, timezone       |
| `Incident`   | id, title, severity, status, started_at, resolved_at  |
| `Deployment` | id, version, deployed_at, deployed_by, environment    |

| Relationship     | Properties                          |
| ---------------- | ----------------------------------- |
| `[:DEPENDS_ON]`  | criticality (hard/soft), latency_ms |
| `[:OWNS]`        | —                                   |
| `[:CAUSED_BY]`   | —                                   |
| `[:AFFECTED]`    | —                                   |
| `[:DEPLOYED_TO]` | —                                   |
| `[:TRIGGERED]`   | —                                   |

---

## Tech Stack

![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)
![Neo4j](https://img.shields.io/badge/CognoDB-Neo4j--compatible-008CC1?logo=neo4j&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-1-6E9F18?logo=vitest&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-backend-0B0D0E?logo=railway&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-frontend-000000?logo=vercel&logoColor=white)

| Layer            | Technology                                       |
| ---------------- | ------------------------------------------------ |
| Backend API      | Node.js + Express + TypeScript                   |
| Frontend         | React 18 + Vite + TypeScript + Tailwind CSS      |
| Graph DB         | CognoDB (Neo4j-compatible, openCypher over Bolt) |
| DB Driver        | `neo4j-driver` (official npm package)            |
| State management | TanStack Query (React Query)                     |
| Routing          | react-router-dom v6                              |
| Testing          | Vitest + React Testing Library                   |
| Deployment       | Railway (backend) + Vercel (frontend)            |

---

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+
- A running CognoDB or Neo4j instance (local Docker or hosted)

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/blast-radius.git
cd blast-radius
```

### 2. Install Dependencies

```bash
npm install
```

This installs dependencies for both `server/` and `client/` workspaces.

### 3. Configure Environment Variables

**Backend:**

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-password
NEO4J_DATABASE=neo4j
CLIENT_ORIGIN=http://localhost:5173
PORT=3001
NODE_ENV=development
```

**Frontend:**

```bash
cp client/.env.example client/.env
```

Edit `client/.env`:

```
VITE_API_BASE_URL=http://localhost:3001
```

### 4. Start a Local Graph DB (if not using hosted CognoDB)

Using Docker with Neo4j Community Edition (which CognoDB is compatible with):

```bash
docker run \
  --name blast-radius-db \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/your-password \
  neo4j:5-community
```

Wait for the DB to start (watch for `Started` in the Docker logs), then verify at `http://localhost:7474`.

### 5. Seed the Database

```bash
npm run seed --workspace=server
```

Expected output:

```
BlastRadius Seed Script
========================
[clearDb] Database cleared. ✓
[createConstraints] 4 constraints, 5 indexes created. ✓
[seedTeams] 10 teams seeded. ✓
[seedServices] 40 services seeded. ✓
[seedDependencies] 84 dependency edges created. ✓
[seedIncidents] 20 incidents seeded. ✓
[seedDeployments] 15 deployments seeded. ✓
========================
Seeding complete! 85 nodes, 311 relationships.
```

### 6. Start the Development Servers

```bash
# Start backend (from repo root)
npm run dev --workspace=server

# In a separate terminal, start frontend
npm run dev --workspace=client
```

The app will be available at **http://localhost:5173**.

---

## Key Queries Explained

### Blast Radius (Multi-Hop Traversal)

**Plain English:** "Find all services that depend on this failing service, up to 5 hops away. Tell me the minimum
distance for each."

```cypher
MATCH path = (root:Service {id: $serviceId})<-[:DEPENDS_ON*1..5]-(affected:Service)
WITH affected, length(path) AS hops
ORDER BY hops
RETURN affected, hops
```

This single query replaces what would be 5 self-joins in SQL. The graph engine traverses relationships depth-first,
returning every reachable service with its shortest path distance.

---

### Teams to Page

**Plain English:** "For all services in the blast radius, who owns them? Group by team."

```cypher
MATCH (root:Service {id: $serviceId})<-[:DEPENDS_ON*1..5]-(affected:Service)
MATCH (team:Team)-[:OWNS]->(affected)
RETURN DISTINCT team, collect(affected.name) AS affectedServices
```

Composes the traversal with an ownership lookup in one pass. `collect()` aggregates affected service names per team.

---

### Historical Incidents on This Path

**Plain English:** "Has this service caused an outage before? What got affected?"

```cypher
MATCH (i:Incident)-[:CAUSED_BY]->(root:Service {id: $serviceId})
MATCH (i)-[:AFFECTED]->(s:Service)
RETURN i, collect(s.name) AS affectedServices
ORDER BY i.started_at DESC
```

Traverses from incident nodes to service nodes in one step, aggregating affected services per incident.

---

### Longest Dependency Chain

**Plain English:** "What is the deepest path from any service to a leaf node? Where is our greatest architectural risk?"

```cypher
MATCH path = (s:Service)-[:DEPENDS_ON*]->(t:Service)
WHERE NOT (t)-[:DEPENDS_ON]->()
RETURN s.name AS source, t.name AS sink, length(path) AS depth
ORDER BY depth DESC
LIMIT 10
```

Finds leaf services (those that depend on nothing) and discovers the longest path to them from any service in the graph.

---

### Service Dependency Summary

**Plain English:** "What does this service depend on? What depends on it? Who owns it?"

```cypher
MATCH (s:Service {id: $serviceId})
OPTIONAL MATCH (s)-[:DEPENDS_ON]->(upstream:Service)
OPTIONAL MATCH (downstream:Service)-[:DEPENDS_ON]->(s)
OPTIONAL MATCH (team:Team)-[:OWNS]->(s)
RETURN s, collect(DISTINCT upstream) AS upstream,
       collect(DISTINCT downstream) AS downstream, team
```

Four conceptually separate lookups composed into one Cypher statement using `OPTIONAL MATCH`.

---

## Documentation

| Document                                | Description                                                              |
| --------------------------------------- | ------------------------------------------------------------------------ |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Monorepo structure, technology decisions, data model, all Cypher queries |
| [API.md](docs/API.md)                   | All REST endpoints with request/response schemas and examples            |
| [DATA_MODEL.md](docs/DATA_MODEL.md)     | Node/relationship definitions, constraints, seed data strategy           |
| [FRONTEND.md](docs/FRONTEND.md)         | Component tree, routing, animation logic, design system                  |
| [TESTING.md](docs/TESTING.md)           | Test strategy, coverage targets, mock setup, test scripts                |
| [SEED.md](docs/SEED.md)                 | Seed script walkthrough, order of operations, expected output            |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md)     | Railway, Vercel, CognoDB setup and environment checklist                 |

---

## Scripts

| Command                            | Description                              |
| ---------------------------------- | ---------------------------------------- |
| `npm run dev --workspace=server`   | Start backend in dev mode (tsx watch)    |
| `npm run dev --workspace=client`   | Start frontend in dev mode (Vite HMR)    |
| `npm run build --workspace=server` | Compile TypeScript to `server/dist/`     |
| `npm run build --workspace=client` | Build frontend bundle to `client/dist/`  |
| `npm run seed --workspace=server`  | Clear DB and populate with all seed data |
| `npm test`                         | Run all tests (both workspaces)          |
| `npm run test:coverage`            | Run tests with coverage report           |

---

## Project Structure

```
blast-radius/
├── docs/          # All planning and specification documents
├── server/        # Node.js + Express + TypeScript backend
│   ├── src/       # Application source
│   └── seed/      # Database seed script
└── client/        # React + Vite + TypeScript frontend
    └── src/       # Application source
```

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for the complete file tree.

---

## License

MIT
