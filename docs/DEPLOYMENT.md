# BlastRadius — Deployment Guide

> Complete setup instructions for deploying BlastRadius to production: Railway (backend), Vercel (frontend), and CognoDB (graph database).

---

## Table of Contents

1. [Overview](#1-overview)
2. [CognoDB Instance Setup](#2-cognodb-instance-setup)
3. [Railway Setup (Backend)](#3-railway-setup-backend)
4. [Vercel Setup (Frontend)](#4-vercel-setup-frontend)
5. [CORS Configuration](#5-cors-configuration)
6. [Keeping CognoDB Alive](#6-keeping-cognodb-alive)
7. [Environment Variable Checklist](#7-environment-variable-checklist)
8. [Redeployment Workflow](#8-redeployment-workflow)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Overview

The BlastRadius deployment architecture:

```
                    ┌─────────────────────┐
     Users          │   Vercel (Frontend) │
     ──────────────►│   React + Vite SPA  │
                    │   blast-radius.vercel│
                    │   .app              │
                    └────────┬────────────┘
                             │ HTTPS REST (CORS)
                    ┌────────▼────────────┐
                    │ Railway (Backend)   │
                    │ Node.js + Express   │
                    │ blast-radius-api    │
                    │ .railway.app        │
                    └────────┬────────────┘
                             │ Bolt protocol
                    ┌────────▼────────────┐
                    │ CognoDB (Graph DB)  │
                    │ Hosted instance     │
                    │ openCypher + Bolt   │
                    └─────────────────────┘
```

All three components are hosted on free/hobby tiers. This is sufficient for demo and development use.

---

## 2. CognoDB Instance Setup

### Step 1: Create a CognoDB Account

Go to the CognoDB website and sign up for a free account. The free tier provides:
- 1 database instance
- openCypher over Bolt protocol
- Sufficient storage for the seed data (~10MB for 85 nodes, 300+ relationships)

### Step 2: Create a New Database Instance

1. In the CognoDB dashboard, click **"New Instance"**
2. Choose the **free tier** (or the smallest paid tier if free is unavailable)
3. Select a region close to your Railway deployment (e.g., `us-east-1` if Railway is in `us-east`)
4. Name the instance: `blast-radius-prod`
5. Wait for the instance to provision (typically 1–2 minutes)

### Step 3: Collect Connection Details

Once the instance is running, the dashboard will show:

```
Bolt URI:  bolt+ssc://abc123.cognodb.io:7687
Username:  neo4j
Password:  <generated-password>
Database:  neo4j
```

Copy these values. They will be used as environment variables in Railway.

### Step 4: Note the Bolt URI Format

CognoDB's hosted Bolt URIs typically use `bolt+ssc://` (Bolt with self-signed certificate). The `neo4j-driver` must be configured to trust self-signed certs in this case:

```typescript
// server/src/config/neo4j.ts
_driver = neo4j.driver(
  env.NEO4J_URI,
  neo4j.auth.basic(env.NEO4J_USERNAME, env.NEO4J_PASSWORD),
  {
    encrypted: env.NEO4J_URI.startsWith('bolt+ssc') ? 'ENCRYPTION_ON' : 'ENCRYPTION_OFF',
    trust: env.NEO4J_URI.startsWith('bolt+ssc') ? 'TRUST_ALL_CERTIFICATES' : 'TRUST_SYSTEM_CA_SIGNED_CERTIFICATES',
  }
);
```

If CognoDB provides `neo4j+s://` URIs instead, use the `neo4j.driver()` default SSL configuration. Always check the CognoDB documentation for the exact URI scheme they use.

### Step 5: Run the Seed Script Against the Production DB

After Railway is set up (or before, pointing to the production DB URI), run the seed script once to populate the graph:

```bash
# Set env vars locally to point to production CognoDB
NEO4J_URI=bolt+ssc://abc123.cognodb.io:7687 \
NEO4J_USERNAME=neo4j \
NEO4J_PASSWORD=<password> \
NEO4J_DATABASE=neo4j \
npm run seed --workspace=server
```

Verify seeding succeeded by querying the DB via the CognoDB browser (if available in the dashboard):

```cypher
MATCH (n) RETURN labels(n)[0] AS label, count(n) ORDER BY count DESC
```

Expected: Service=40, Team=10, Incident=20, Deployment=15.

---

## 3. Railway Setup (Backend)

### Step 1: Create a Railway Account and Project

1. Go to [railway.app](https://railway.app) and sign up
2. Create a new project: **"New Project"** → **"Deploy from GitHub repo"**
3. Connect your GitHub account and select the `blast-radius` repository
4. Railway will auto-detect Node.js

### Step 2: Configure the Service

Railway will create a service for the entire repo. Since the backend is in `server/`, configure:

**Root directory:** `server`

In the Railway service settings:
- **Root Directory:** `/server`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

### Step 3: Configure Build and Start Scripts

Ensure `server/package.json` has:

```json
{
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts"
  }
}
```

The `tsconfig.build.json` compiles `src/` to `dist/` excluding test files.

### Step 4: Set Environment Variables in Railway

In the Railway service dashboard, go to **Variables** and add:

| Variable | Value |
|----------|-------|
| `PORT` | `3001` (Railway also sets this automatically, but be explicit) |
| `NEO4J_URI` | `bolt+ssc://abc123.cognodb.io:7687` |
| `NEO4J_USERNAME` | `neo4j` |
| `NEO4J_PASSWORD` | `<your-cognodb-password>` |
| `NEO4J_DATABASE` | `neo4j` |
| `CLIENT_ORIGIN` | `https://blast-radius.vercel.app` (update after Vercel deploy) |
| `NODE_ENV` | `production` |
| `LOG_LEVEL` | `info` |

### Step 5: Configure the Health Check

In Railway service settings:
- **Health Check Path:** `/health`
- **Health Check Timeout:** `30s`
- **Health Check Interval:** `30s`

Railway will ping `GET /health` and restart the service if it fails to respond. The `/health` endpoint checks DB connectivity and returns `200` always (even if DB is degraded) so Railway doesn't restart the pod on DB blips.

### Step 6: Get the Deployment URL

After the first successful deploy, Railway assigns a URL like:
```
https://blast-radius-api-production.up.railway.app
```

Copy this URL. It will be used as `VITE_API_BASE_URL` in Vercel.

### Step 7: Custom Domain (Optional)

In Railway, go to **Settings → Networking → Custom Domain** and add your domain. Configure your DNS provider to point to Railway's IP.

---

## 4. Vercel Setup (Frontend)

### Step 1: Create a Vercel Account and Project

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click **"Add New Project"** → **"Import Git Repository"**
3. Select the `blast-radius` repository

### Step 2: Configure the Project

Vercel will prompt for configuration:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `client` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

Vercel auto-detects Vite when the root directory is `client/`.

### Step 3: Set Environment Variables in Vercel

In Vercel project settings → **Environment Variables**:

| Variable | Environment | Value |
|----------|-------------|-------|
| `VITE_API_BASE_URL` | Production | `https://blast-radius-api-production.up.railway.app` |
| `VITE_API_BASE_URL` | Preview | `https://blast-radius-api-production.up.railway.app` |

> Note: Preview deployments (from PRs) can also point to the production API unless you set up a separate staging Railway service.

### Step 4: Configure SPA Rewrites

Vite builds a SPA where all routes need to serve `index.html`. Vercel handles this automatically when it detects a Vite project, but to be explicit, create `client/public/vercel.json` (or `client/vercel.json`):

```json
{
  "rewrites": [
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

This ensures that navigating directly to `https://blast-radius.vercel.app/services/svc-auth` returns `index.html` and React Router handles the routing client-side.

### Step 5: Get the Deployment URL

After the first successful deploy, Vercel assigns:
```
https://blast-radius.vercel.app
```

Go back to Railway and update `CLIENT_ORIGIN` to this URL.

### Step 6: Custom Domain (Optional)

In Vercel project settings → **Domains**, add your custom domain. Vercel provides instructions for DNS configuration.

---

## 5. CORS Configuration

CORS is enforced on the backend using the `cors` npm package. The `CLIENT_ORIGIN` environment variable controls which origins are allowed.

### Development

```
CLIENT_ORIGIN=http://localhost:5173
```

Allows the local Vite dev server to call the local Express server.

### Production

```
CLIENT_ORIGIN=https://blast-radius.vercel.app
```

Only the Vercel frontend origin is allowed. All other origins (including browser dev tools) will be rejected with a CORS error.

### CORS Preflight

The backend's CORS config allows only `GET` methods and `Content-Type` header. Since all API endpoints are `GET` and browsers don't send preflight for simple `GET` requests, there are no `OPTIONS` route issues to handle.

However, if you ever add mutation endpoints (`POST`, `PATCH`, `DELETE`), ensure the CORS config includes `OPTIONS` in the `methods` array and add an `app.options('*', cors())` catch-all.

### Testing CORS in Production

After deployment, verify CORS is working:

```bash
curl -v -H "Origin: https://blast-radius.vercel.app" \
  https://blast-radius-api-production.up.railway.app/health
```

The response should include:
```
Access-Control-Allow-Origin: https://blast-radius.vercel.app
```

---

## 6. Keeping CognoDB Alive

CognoDB free tier instances may **sleep after periods of inactivity** (typically after 30–60 minutes without queries). When the instance sleeps, the first request to the backend will fail with a `ServiceUnavailableError` until the instance wakes up (which may take 30–60 seconds).

### Strategy 1: Warm-Up on Backend Start

In `server/src/index.ts`, after the server starts, run a lightweight Cypher query to verify the DB is awake:

```typescript
const driver = getDriver();
await driver.verifyConnectivity();
console.log('Database connection verified. ✓');
```

### Strategy 2: Scheduled Ping (Keep-Alive)

Set up a periodic health check to prevent the DB from sleeping. Options:

**Option A: External Uptime Monitor**
Use a free uptime monitoring service (e.g., UptimeRobot, Better Uptime) to ping `GET /health` every 10 minutes. The health check itself queries the DB (`driver.verifyConnectivity()`), keeping the connection active.

**Option B: Railway Cron Job**
If Railway supports cron jobs in your plan, create a cron that calls `GET /health` every 15 minutes.

**Option C: Frontend Keep-Alive**
Add a React Query query that polls `/health` every 5 minutes while the app tab is open:
```typescript
useQuery({
  queryKey: ['health'],
  queryFn: () => apiClient.get('/health'),
  refetchInterval: 5 * 60 * 1000, // 5 minutes
  refetchIntervalInBackground: false, // only poll when tab is active
});
```

### Strategy 3: Graceful Wake-Up on 503

When the backend detects a `DB_CONNECTION_ERROR`, the frontend `<ErrorState>` should show a user-friendly message: **"Database is waking up — please try again in 30 seconds."** with an automatic retry after 30 seconds.

```typescript
// In BlastRadiusPanel or ServiceMapPage
if (error?.code === 'DB_CONNECTION_ERROR') {
  return (
    <ErrorState
      title="Database is waking up"
      description="The database is spinning up after a period of inactivity. Please wait..."
      onRetry={() => {
        setTimeout(() => queryClient.invalidateQueries(), 30000);
      }}
    />
  );
}
```

---

## 7. Environment Variable Checklist

### Before Going Live — Backend (Railway)

- [ ] `NEO4J_URI` is set to the production CognoDB Bolt URI
- [ ] `NEO4J_USERNAME` is `neo4j` (or the correct username from the CognoDB dashboard)
- [ ] `NEO4J_PASSWORD` is the correct password from the CognoDB dashboard
- [ ] `NEO4J_DATABASE` is set to `neo4j` (or the named database if you created a custom one)
- [ ] `CLIENT_ORIGIN` is set to the Vercel frontend URL (e.g., `https://blast-radius.vercel.app`)
- [ ] `NODE_ENV` is set to `production`
- [ ] `PORT` is set (or left to Railway's default injection)
- [ ] Health check path `/health` is configured in Railway service settings
- [ ] The seed script has been run against the production DB and returned expected node/relationship counts

### Before Going Live — Frontend (Vercel)

- [ ] `VITE_API_BASE_URL` is set to the Railway backend URL (e.g., `https://blast-radius-api-production.up.railway.app`)
- [ ] The SPA rewrite rule is configured (via `vercel.json` or Vercel project settings)
- [ ] Build succeeds locally: `cd client && npm run build`
- [ ] No `VITE_` variables contain secrets (they are publicly visible in the browser bundle)

### Functional Verification After Deployment

- [ ] `GET https://blast-radius-api-production.up.railway.app/health` returns `{ "status": "ok", "database": { "connected": true } }`
- [ ] `GET https://blast-radius-api-production.up.railway.app/api/services` returns 40 services
- [ ] `GET https://blast-radius.vercel.app` loads the Service Map page
- [ ] Clicking a service on the Service Map opens the blast radius panel with hop groups
- [ ] The blast radius animation works (hops reveal progressively)
- [ ] CORS is not blocked (no console errors in the browser DevTools Network tab)
- [ ] Direct navigation to `https://blast-radius.vercel.app/incidents` works (SPA rewrite)

---

## 8. Redeployment Workflow

### Deploying Backend Changes

Railway automatically redeploys when you push to the `main` branch (configured in Railway project settings → **Git Branch**). Manual redeploys:

1. Go to the Railway service dashboard
2. Click **"Deploy"** → **"Deploy latest commit"**
3. Watch the build logs for errors
4. Verify health check passes after deploy

### Deploying Frontend Changes

Vercel automatically redeploys on push to `main`. For manual redeploys:

1. Go to the Vercel project dashboard
2. Click **"Redeploy"** → select latest deployment
3. Verify the deployment URL shows updated content

### Re-seeding the Database

If the data model changes significantly (e.g., new node properties, restructured dependencies):

```bash
# 1. Update seed data files in server/seed/data/
# 2. Run the seed script against production DB
NEO4J_URI=bolt+ssc://abc123.cognodb.io:7687 \
NEO4J_USERNAME=neo4j \
NEO4J_PASSWORD=<password> \
NEO4J_DATABASE=neo4j \
npm run seed --workspace=server
```

The seed script clears and re-populates the DB. This causes ~5 seconds of downtime while the DB is cleared. For a demo application this is acceptable.

---

## 9. Troubleshooting

### Railway: Build Fails with TypeScript Errors

```
Error: Cannot find module '...'
```

**Fix:** Ensure `server/tsconfig.build.json` excludes test files and that all imports in `src/` resolve correctly. Run `tsc --noEmit` locally first.

### Railway: "Cannot connect to database" in logs

**Symptoms:** `/health` returns `{ "database": { "connected": false } }`  
**Fix:** 
1. Verify `NEO4J_URI` in Railway variables matches the CognoDB dashboard exactly
2. Check if CognoDB free tier has put the instance to sleep — wait 60 seconds and retry
3. Verify the Bolt URI scheme: `bolt+ssc://` vs `neo4j+s://`

### Vercel: "Page not found" on direct navigation to `/services/svc-auth`

**Symptoms:** Navigating directly to a deep URL shows Vercel's 404 page  
**Fix:** The SPA rewrite is missing. Ensure `vercel.json` exists at `client/vercel.json` with the rewrite rule (see Section 4, Step 4).

### CORS Error in Browser

**Symptoms:** `Access to fetch blocked by CORS policy` in browser DevTools  
**Fix:**
1. Verify `CLIENT_ORIGIN` in Railway matches the Vercel URL exactly (no trailing slash)
2. Check that the Railway service has been redeployed after updating `CLIENT_ORIGIN`
3. Use `curl -H "Origin: <vercel-url>"` to test the API directly

### CognoDB: "Connection refused" locally

**Symptoms:** Seed script or server fails with `ECONNREFUSED bolt://localhost:7687`  
**Fix:** Ensure your local CognoDB instance is running. If using Docker:
```bash
docker run -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password \
  neo4j:5-community
```
