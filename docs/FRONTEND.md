# BlastRadius — Frontend Specification

> Complete component tree, routing, state management, animation logic, design system, and responsive behavior.

---

## Table of Contents

1. [Page Routes](#1-page-routes)
2. [Component Tree](#2-component-tree)
3. [State Management](#3-state-management)
4. [Hop-by-Hop Animation Logic](#4-hop-by-hop-animation-logic)
5. [Loading States](#5-loading-states)
6. [Empty States](#6-empty-states)
7. [Error States](#7-error-states)
8. [Tailwind Design System](#8-tailwind-design-system)
9. [Responsive Behavior](#9-responsive-behavior)
10. [Accessibility](#10-accessibility)

---

## 1. Page Routes

Routing is handled by `react-router-dom` v6. All routes are defined in `client/src/App.tsx`. Every route is wrapped in the `<AppShell>` layout component.

```typescript
// client/src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ServiceMapPage } from './pages/ServiceMapPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { TeamsPage } from './pages/TeamsPage';
import { TeamDetailPage } from './pages/TeamDetailPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { IncidentDetailPage } from './pages/IncidentDetailPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<ServiceMapPage />} />
          <Route path="/services/:id" element={<ServiceDetailPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/teams/:id" element={<TeamDetailPage />} />
          <Route path="/incidents" element={<IncidentsPage />} />
          <Route path="/incidents/:id" element={<IncidentDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

### Route Descriptions

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `ServiceMapPage` | All 40 services as cards, grouped by team. Entry point to the blast radius simulator. |
| `/services/:id` | `ServiceDetailPage` | Full service detail: blast radius panel, dependency explorer, incident history. |
| `/teams` | `TeamsPage` | All 10 teams as cards with service count and active incident count. |
| `/teams/:id` | `TeamDetailPage` | Team detail: owned services, oncall info, active incidents. |
| `/incidents` | `IncidentsPage` | Chronological incident list with severity/status filters. |
| `/incidents/:id` | `IncidentDetailPage` | Full incident detail: root cause, affected services, triggering deployment. |

---

## 2. Component Tree

Every component is listed with its file location, props interface, and responsibility.

### Layout Components

---

#### `AppShell` — `components/layout/AppShell.tsx`

```typescript
interface AppShellProps {
  // No props — uses react-router Outlet
}
```

**Responsibility:** Outer layout wrapper. Renders `<Sidebar>` on the left and `<Outlet>` (page content) on the right. On mobile, collapses the sidebar into a hamburger-triggered drawer. Reads `isSidebarOpen` from `uiStore`.

---

#### `Sidebar` — `components/layout/Sidebar.tsx`

```typescript
interface SidebarProps {
  // No props — reads from uiStore and react-router
}
```

**Responsibility:** Left navigation. Contains the BlastRadius logo/wordmark at the top, four nav links (Service Map, Teams, Incidents, and a divider), and a small status indicator showing the count of active incidents (queried via React Query). Active route is highlighted. On mobile, renders as a full-height overlay.

**Nav links:**
- `/` → "Service Map" icon: `MapIcon`
- `/teams` → "Teams" icon: `UsersIcon`
- `/incidents` → "Incidents" icon: `BellAlertIcon`
- Bottom of sidebar: link to GitHub repo (external)

---

#### `TopBar` — `components/layout/TopBar.tsx`

```typescript
interface TopBarProps {
  title: string;
  subtitle?: string;
}
```

**Responsibility:** Page-level header bar rendered inside the content area. Shows the page title, optional subtitle (e.g., service name), and a breadcrumb trail. On mobile, also contains the hamburger button that toggles the sidebar.

---

### Service Components

---

#### `ServiceCard` — `components/service/ServiceCard.tsx`

```typescript
interface ServiceCardProps {
  service: ServiceSummary;
  onClick?: () => void;
  variant?: 'default' | 'compact' | 'affected';
  isHighlighted?: boolean;    // true when this card is the "selected failing service"
  animationDelay?: number;    // milliseconds — for staggered entrance in blast radius
}
```

**Responsibility:** Renders a single service as a card. Displays service name, `<ServiceBadge type>`, `<ServiceBadge tier>`, owning team name, and dependency/dependent counts. Clicking navigates to `/services/:id` OR triggers the blast radius simulation (on the Service Map page). 

The `variant="affected"` state adds a red left border and a pulsing red dot to indicate this service is in the blast radius. `animationDelay` controls when the card fades in using a CSS transition.

**Visual design:**
- Background: `bg-slate-800`
- Border: `border border-slate-700`
- Hover: `hover:border-slate-500 hover:bg-slate-750` with a subtle lift (`hover:-translate-y-0.5 transition-transform`)
- When `isHighlighted`: `border-red-500 bg-red-950/30`
- When `variant="affected"`: left border `border-l-4 border-l-red-500`

---

#### `ServiceBadge` — `components/service/ServiceBadge.tsx`

```typescript
type BadgeVariant = 'type' | 'tier';

interface ServiceBadgeProps {
  variant: BadgeVariant;
  value: ServiceType | ServiceTier;
}
```

**Responsibility:** Renders a small colored pill badge. Two variants:
- `variant="type"`: displays the service type with a unique color per type
- `variant="tier"`: displays the tier with a severity-appropriate color

**Type badge colors:**
- `api` → `bg-blue-500/20 text-blue-400 ring-blue-500/30`
- `gateway` → `bg-purple-500/20 text-purple-400 ring-purple-500/30`
- `worker` → `bg-amber-500/20 text-amber-400 ring-amber-500/30`
- `database` → `bg-emerald-500/20 text-emerald-400 ring-emerald-500/30`
- `cache` → `bg-cyan-500/20 text-cyan-400 ring-cyan-500/30`
- `queue` → `bg-orange-500/20 text-orange-400 ring-orange-500/30`

**Tier badge colors:**
- `critical` → `bg-red-500/20 text-red-400 ring-red-500/30`
- `high` → `bg-amber-500/20 text-amber-400 ring-amber-500/30`
- `medium` → `bg-blue-500/20 text-blue-400 ring-blue-500/30`
- `low` → `bg-slate-500/20 text-slate-400 ring-slate-500/30`

---

#### `ServiceGrid` — `components/service/ServiceGrid.tsx`

```typescript
interface ServiceGridProps {
  services: ServiceSummary[];
  isLoading: boolean;
  selectedServiceId: string | null;
  onServiceSelect: (id: string) => void;
}
```

**Responsibility:** Renders all services grouped by owning team. Each group is a labeled section with a team name header. Within each group, services are laid out in a responsive CSS grid. When `isLoading` is true, renders `<ServiceSkeleton>` cards instead. When a service is selected (for blast radius), it dims all other cards with `opacity-40` and highlights the selected one.

---

#### `ServiceSkeleton` — `components/service/ServiceSkeleton.tsx`

```typescript
interface ServiceSkeletonProps {
  count?: number;  // default: 8
}
```

**Responsibility:** Loading skeleton for the service grid. Renders `count` placeholder cards with animated shimmer using `animate-pulse`. Each card shows the same structure as `ServiceCard` but with gray blocks instead of content.

---

### Blast Radius Components

---

#### `BlastRadiusPanel` — `components/blast-radius/BlastRadiusPanel.tsx`

```typescript
interface BlastRadiusPanelProps {
  serviceId: string;         // The failing service's ID
  isVisible: boolean;        // Whether to show the panel
  onClose: () => void;
}
```

**Responsibility:** The main blast radius simulator panel. Fetches blast radius data using `useBlastRadius(serviceId)`. Manages the `revealedHops` state (starts at 0, increments every 600ms using `setTimeout`). Renders:
1. A "Simulating..." header with the failing service name
2. `<HopGroup>` for each hop up to `revealedHops`
3. `<TeamAlertBanner>` that appears after all hops are revealed
4. "Historical Incidents" section (list of `<IncidentCard variant="compact">`)
5. A summary stat row: "X services affected across Y teams"

**Panel transitions:** Slides in from the right using a CSS transform animation (`translate-x-full` → `translate-x-0`) triggered by `isVisible`.

---

#### `HopGroup` — `components/blast-radius/HopGroup.tsx`

```typescript
interface HopGroupProps {
  hop: number;                          // 1-indexed
  services: ServiceSummary[];
  isRevealing: boolean;                 // true while this group is being animated in
}
```

**Responsibility:** Renders one hop level's worth of affected services. Shows a labeled divider line: `"── Hop 1: Direct Dependents ──"`. Then renders a horizontal scroll of `<AffectedServiceCard>` components. When `isRevealing` is true, cards enter with a staggered fade-in + slide-up animation (see Section 4).

---

#### `AffectedServiceCard` — `components/blast-radius/AffectedServiceCard.tsx`

```typescript
interface AffectedServiceCardProps {
  service: ServiceSummary;
  animationDelay: number;   // milliseconds for staggered entrance
  isVisible: boolean;       // controls opacity/transform transition
}
```

**Responsibility:** A smaller variant of `ServiceCard` optimized for the blast radius panel. Shows service name, type badge, tier badge, and team name. Clicking navigates to `/services/:id`. Uses CSS `transition-all` with `opacity-0 translate-y-2` initial state transitioning to `opacity-100 translate-y-0` when `isVisible` becomes true.

---

#### `TeamAlertBanner` — `components/blast-radius/TeamAlertBanner.tsx`

```typescript
interface TeamAlertBannerProps {
  teams: TeamWithAffectedServices[];
  isVisible: boolean;
}
```

**Responsibility:** The "Page These Teams" section that appears after all hops are revealed. Renders a red-bordered banner with a `BellAlertIcon`. Each team is shown with their Slack channel, oncall email, and count of affected services. Has a fade-in animation controlled by `isVisible`.

---

### Incident Components

---

#### `IncidentList` — `components/incident/IncidentList.tsx`

```typescript
interface IncidentListProps {
  incidents: IncidentSummary[];
  isLoading: boolean;
}
```

**Responsibility:** Renders the list of incidents. When `isLoading`, renders `<IncidentSkeleton count={5}>`. Renders each incident as an `<IncidentCard>`. Sorts by `started_at` descending (most recent first).

---

#### `IncidentCard` — `components/incident/IncidentCard.tsx`

```typescript
interface IncidentCardProps {
  incident: IncidentSummary;
  variant?: 'default' | 'compact';
  onClick?: () => void;
}
```

**Responsibility:** Renders an incident. Default variant shows: title, `<IncidentBadge severity>`, `<IncidentBadge status>`, start time (relative, e.g., "3 days ago"), duration, affected service count, and root cause service name. Compact variant is used inside the blast radius panel's historical incidents section — shows only title, severity badge, status badge, and date.

**Visual design:**
- Active SEV1: left border `border-l-4 border-l-red-500` with a pulsing red dot
- Active SEV2: left border `border-l-4 border-l-amber-500`
- Resolved: `opacity-75`, left border `border-l-4 border-l-slate-600`

---

#### `IncidentBadge` — `components/incident/IncidentBadge.tsx`

```typescript
type IncidentBadgeVariant = 'severity' | 'status';

interface IncidentBadgeProps {
  variant: IncidentBadgeVariant;
  value: IncidentSeverity | IncidentStatus;
}
```

**Responsibility:** Small badge for incident severity and status.

**Severity colors:**
- `SEV1` → `bg-red-500/20 text-red-400` with a blinking animation for active incidents
- `SEV2` → `bg-amber-500/20 text-amber-400`
- `SEV3` → `bg-blue-500/20 text-blue-400`

**Status colors:**
- `active` → `bg-red-500/20 text-red-400` with `animate-pulse` dot
- `monitoring` → `bg-amber-500/20 text-amber-400`
- `resolved` → `bg-emerald-500/20 text-emerald-400`

---

#### `IncidentSkeleton` — `components/incident/IncidentSkeleton.tsx`

```typescript
interface IncidentSkeletonProps {
  count?: number;  // default: 5
}
```

**Responsibility:** Loading skeleton for incident list. `count` animated pulse cards.

---

### Team Components

---

#### `TeamCard` — `components/team/TeamCard.tsx`

```typescript
interface TeamCardProps {
  team: TeamSummaryWithCounts;
  onClick?: () => void;
}
```

**Responsibility:** Renders a team card showing team name, Slack channel, timezone, service count, and active incident count. If `activeIncidentCount > 0`, shows a pulsing amber dot beside the team name. Clicking navigates to `/teams/:id`.

---

#### `TeamGrid` — `components/team/TeamGrid.tsx`

```typescript
interface TeamGridProps {
  teams: TeamSummaryWithCounts[];
  isLoading: boolean;
}
```

**Responsibility:** Responsive grid of `<TeamCard>` components. When loading, shows `<TeamSkeleton count={10}>`.

---

#### `TeamSkeleton` — `components/team/TeamSkeleton.tsx`

```typescript
interface TeamSkeletonProps {
  count?: number;  // default: 10
}
```

---

### Dependency Components

---

#### `DependencyExplorer` — `components/dependency/DependencyExplorer.tsx`

```typescript
interface DependencyExplorerProps {
  serviceId: string;
}
```

**Responsibility:** Fetches and renders the full dependency picture for a service using `useDependencies(serviceId)`. Renders two columns: `<UpstreamList>` and `<DownstreamList>`. On mobile, stacks vertically. Shows a visual arrow/connector between columns.

---

#### `UpstreamList` — `components/dependency/UpstreamList.tsx`

```typescript
interface UpstreamListProps {
  services: ServiceSummary[];
  title?: string;  // default: "Upstream Dependencies"
}
```

**Responsibility:** Renders the list of services this service depends ON. Shows a note about `criticality: "hard"` vs `"soft"` dependencies. Each item is a compact `<ServiceCard variant="compact">` that links to that service's page.

---

#### `DownstreamList` — `components/dependency/DownstreamList.tsx`

```typescript
interface DownstreamListProps {
  services: ServiceSummary[];
  title?: string;  // default: "Downstream Dependents"
}
```

**Responsibility:** Renders the list of services that depend ON this service. Shows a warning if `dependentCount > 10` ("This is a high-impact service. Consider it carefully before making changes."). Each item links to that service's page.

---

### Common Components

---

#### `ErrorBoundary` — `components/common/ErrorBoundary.tsx`

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;  // custom fallback UI
}
```

**Responsibility:** Class component that catches render errors in its subtree. Renders a centered `<ErrorState>` if no custom fallback is provided. Wraps each page in `App.tsx`.

---

#### `EmptyState` — `components/common/EmptyState.tsx`

```typescript
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
}
```

**Responsibility:** Centered empty state illustration with optional action button. Used when data fetching succeeds but returns zero results.

---

#### `ErrorState` — `components/common/ErrorState.tsx`

```typescript
interface ErrorStateProps {
  title?: string;                       // default: "Something went wrong"
  description?: string;
  onRetry?: () => void;
  error?: { code: string; message: string };
}
```

**Responsibility:** Centered error state with an alert icon, description, and optional retry button. Used when a React Query `isError` is true. Shows the error code in `JetBrains Mono` if present.

---

#### `Badge` — `components/common/Badge.tsx`

```typescript
interface BadgeProps {
  children: React.ReactNode;
  color: 'red' | 'amber' | 'blue' | 'green' | 'purple' | 'cyan' | 'orange' | 'slate';
  size?: 'sm' | 'md';
  dot?: boolean;        // show animated pulsing dot before text
  dotAnimate?: boolean; // only animate dot if true (for active incidents)
}
```

**Responsibility:** Generic badge component. All domain-specific badge components (`ServiceBadge`, `IncidentBadge`) are thin wrappers around this.

---

#### `Card` — `components/common/Card.tsx`

```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  as?: 'div' | 'article' | 'li';
  padding?: 'sm' | 'md' | 'lg';
}
```

**Responsibility:** Base card with `bg-slate-800 border border-slate-700 rounded-xl` styling. All domain cards are built on top of this.

---

#### `PageHeader` — `components/common/PageHeader.tsx`

```typescript
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}
```

**Responsibility:** Consistent page-level header with a title, optional subtitle, optional badge, and optional right-aligned action buttons/links.

---

## 3. State Management

### Server State: React Query (`@tanstack/react-query`)

All API data is managed by React Query. The `QueryClient` is configured in `client/src/main.tsx`:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,        // 1 minute — data is fresh for 1 minute
      gcTime: 5 * 60 * 1000,       // 5 minutes — cache kept for 5 minutes after unmount
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      refetchOnWindowFocus: false,   // SRE tool — don't refetch on tab switch
    },
  },
});
```

**Query hooks** live in `client/src/hooks/`:

```typescript
// hooks/useServices.ts
export const useServices = (filters?: ServiceFilters) =>
  useQuery({
    queryKey: ['services', filters],
    queryFn: () => servicesApi.getServices(filters),
  });

export const useService = (id: string) =>
  useQuery({
    queryKey: ['services', id],
    queryFn: () => servicesApi.getService(id),
    enabled: !!id,
  });

export const useBlastRadius = (id: string) =>
  useQuery({
    queryKey: ['services', id, 'blast-radius'],
    queryFn: () => servicesApi.getBlastRadius(id),
    enabled: !!id,
    staleTime: 0,   // always re-fetch blast radius (data may change)
  });

export const useDependencies = (id: string) =>
  useQuery({
    queryKey: ['services', id, 'dependencies'],
    queryFn: () => servicesApi.getDependencies(id),
    enabled: !!id,
  });

// hooks/useTeams.ts
export const useTeams = () =>
  useQuery({ queryKey: ['teams'], queryFn: teamsApi.getTeams });

export const useTeam = (id: string) =>
  useQuery({
    queryKey: ['teams', id],
    queryFn: () => teamsApi.getTeam(id),
    enabled: !!id,
  });

// hooks/useIncidents.ts
export const useIncidents = (filters?: IncidentFilters) =>
  useQuery({
    queryKey: ['incidents', filters],
    queryFn: () => incidentsApi.getIncidents(filters),
  });

export const useIncident = (id: string) =>
  useQuery({
    queryKey: ['incidents', id],
    queryFn: () => incidentsApi.getIncident(id),
    enabled: !!id,
  });

// hooks/useGraph.ts
export const useLongestChain = () =>
  useQuery({ queryKey: ['graph', 'longest-chain'], queryFn: graphApi.getLongestChain });
```

### UI State: React Context + `useState`

A lightweight context store handles UI-only state that multiple components need to share:

```typescript
// store/uiStore.ts
interface UIState {
  isSidebarOpen: boolean;
  selectedServiceId: string | null;  // for blast radius simulation
  setSidebarOpen: (open: boolean) => void;
  setSelectedServiceId: (id: string | null) => void;
}

export const UIContext = createContext<UIState>(/* initial values */);
export const UIProvider = ({ children }: { children: React.ReactNode }) => { /* ... */ };
export const useUI = () => useContext(UIContext);
```

**What goes in UIState:**
- `isSidebarOpen` — toggled by hamburger button on mobile
- `selectedServiceId` — which service is selected for blast radius on the Service Map page

**What stays local (`useState`):**
- `revealedHops` in `BlastRadiusPanel` — purely local animation state
- Filter values in `IncidentsPage` — no need to share across components

---

## 4. Hop-by-Hop Animation Logic

The blast radius simulator reveals affected services progressively — one hop group at a time with a delay between each group, and cards within each group animate in with a stagger.

### Algorithm

```typescript
// Inside BlastRadiusPanel.tsx

const { data, isLoading } = useBlastRadius(serviceId);
const [revealedHops, setRevealedHops] = useState(0);
const [allRevealed, setAllRevealed] = useState(false);

// Reset animation state when a new service is selected
useEffect(() => {
  setRevealedHops(0);
  setAllRevealed(false);
}, [serviceId]);

// Start revealing hops once data is available
useEffect(() => {
  if (!data || isLoading) return;

  const totalHops = data.hops.length;
  if (revealedHops >= totalHops) {
    setAllRevealed(true);
    return;
  }

  const timer = setTimeout(() => {
    setRevealedHops(prev => prev + 1);
  }, 700);  // 700ms between each hop group

  return () => clearTimeout(timer);
}, [data, revealedHops, isLoading]);
```

### Rendering

```typescript
// Only render hop groups up to revealedHops
{data?.hops
  .slice(0, revealedHops)
  .map((hopGroup) => (
    <HopGroup
      key={hopGroup.hop}
      hop={hopGroup.hop}
      services={hopGroup.services}
      isRevealing={hopGroup.hop === revealedHops}  // currently being revealed
    />
  ))
}

// TeamAlertBanner only appears after all hops
<TeamAlertBanner
  teams={data?.teamsToPage ?? []}
  isVisible={allRevealed}
/>
```

### Card Stagger Within a HopGroup

```typescript
// Inside HopGroup.tsx
const [visibleCardIndices, setVisibleCardIndices] = useState<Set<number>>(new Set());

useEffect(() => {
  if (!isRevealing) {
    // If this hop was already revealed, show all cards immediately
    setVisibleCardIndices(new Set(services.map((_, i) => i)));
    return;
  }

  // Stagger reveal: one card every 120ms
  services.forEach((_, index) => {
    setTimeout(() => {
      setVisibleCardIndices(prev => new Set([...prev, index]));
    }, index * 120);
  });
}, [isRevealing, services]);
```

### CSS Transition

```typescript
// AffectedServiceCard.tsx
<div
  className={`
    transition-all duration-300 ease-out
    ${isVisible
      ? 'opacity-100 translate-y-0'
      : 'opacity-0 translate-y-3'
    }
  `}
  style={{ transitionDelay: `${animationDelay}ms` }}
>
  {/* card content */}
</div>
```

### Summary of Timing

- **Hop-to-hop delay:** 700ms between revealing each hop group
- **Card-to-card stagger within a hop:** 120ms per card
- **CSS transition duration:** 300ms `ease-out`
- **TeamAlertBanner fade-in:** 400ms fade after all hops revealed
- **Total time for 5 hops with 4 cards each:** ~3.5 seconds

The result: the UI appears to "simulate" the failure propagating through the dependency graph, one layer at a time.

---

## 5. Loading States

Every data-fetching component has a skeleton loading state. Skeletons use `animate-pulse` with `bg-slate-700` blocks to suggest the shape of the content to come.

| Component | Loading Behavior |
|-----------|-----------------|
| `ServiceMapPage` | Shows `<ServiceSkeleton count={8}>` inside each team group |
| `ServiceDetailPage` | Shows a skeleton for the service header, a skeleton for `<BlastRadiusPanel>`, and a skeleton for `<DependencyExplorer>` |
| `BlastRadiusPanel` | Shows a single centered `<Spinner>` with "Loading blast radius..." text |
| `IncidentsPage` | Shows `<IncidentSkeleton count={5}>` |
| `IncidentDetailPage` | Shows skeleton for the incident header and skeleton list for affected services |
| `TeamsPage` | Shows `<TeamSkeleton count={10}>` |
| `TeamDetailPage` | Shows skeleton for team header and skeleton for services list |

Skeleton cards are built to exactly match the dimensions of the real content to prevent layout shift.

---

## 6. Empty States

| Page / Component | Condition | Empty State |
|------------------|-----------|-------------|
| `ServiceMapPage` | `services.length === 0` | Icon: `ServerStackIcon`, Title: "No services found", Description: "The service database appears to be empty. Run the seed script to populate it.", Action: link to docs |
| `BlastRadiusPanel` | `hops.length === 0` | Icon: `CheckCircleIcon` (green), Title: "No affected services", Description: "No other services depend on this one. It is a leaf node with no blast radius." |
| `IncidentsPage` (filtered) | No results matching filters | Icon: `MagnifyingGlassIcon`, Title: "No incidents match your filters", Description: "Try adjusting the severity or status filters.", Action: "Clear filters" button |
| `IncidentsPage` (unfiltered) | `incidents.length === 0` | Icon: `ShieldCheckIcon` (green), Title: "No incidents recorded", Description: "All systems are operating normally." |
| `TeamDetailPage` | `team.services.length === 0` | Title: "No services owned", Description: "This team doesn't own any services yet." |
| `DependencyExplorer` (upstream) | `upstream.length === 0` | "This service has no upstream dependencies. It is a foundational service." |
| `DependencyExplorer` (downstream) | `downstream.length === 0` | "No services depend on this one directly." |

---

## 7. Error States

| Page / Component | Trigger | Error State UI |
|------------------|---------|----------------|
| `ServiceMapPage` | API fetch fails | `<ErrorState title="Failed to load services" description="Check that the API is running." onRetry={refetch} />` |
| `ServiceDetailPage` | Service not found (404) | `<ErrorState title="Service not found" description="No service with this ID exists." />` with a back button |
| `ServiceDetailPage` | API fails | `<ErrorState title="Failed to load service" onRetry={refetch} />` |
| `BlastRadiusPanel` | Blast radius query fails | `<ErrorState title="Blast radius unavailable" description="Could not compute the blast radius." onRetry={refetch} />` |
| `IncidentsPage` | API fails | `<ErrorState title="Failed to load incidents" onRetry={refetch} />` |
| `IncidentDetailPage` | 404 | `<ErrorState title="Incident not found" />` |
| `TeamsPage` | API fails | `<ErrorState title="Failed to load teams" onRetry={refetch} />` |
| Any page | React render error | `<ErrorBoundary>` fallback: "An unexpected rendering error occurred. Please refresh." |

The `ErrorState` component shows the API error code (if available) in a small monospace block to aid debugging:
```
Error code: DB_CONNECTION_ERROR
```

---

## 8. Tailwind Design System

### Configuration (`tailwind.config.ts`)

```typescript
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      colors: {
        // Custom slate shade between 700 and 800
        'slate-750': '#1e2a3a',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-up': 'slideInUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
```

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `slate-950` | `#0a0f1a` | App background, sidebar background |
| `slate-900` | `#0f172a` | Page background inside content area |
| `slate-800` | `#1e293b` | Card backgrounds |
| `slate-750` | `#1e2a3a` | Card hover state |
| `slate-700` | `#334155` | Card borders, dividers |
| `slate-600` | `#475569` | Subtle borders |
| `slate-400` | `#94a3b8` | Secondary text, muted labels |
| `slate-300` | `#cbd5e1` | Primary text |
| `white` | `#ffffff` | Headings |
| `red-500` | `#ef4444` | Critical tier, SEV1, active incidents, blast radius borders |
| `red-400` | `#f87171` | Critical badge text |
| `amber-500` | `#f59e0b` | High tier, SEV2, monitoring incidents, warnings |
| `amber-400` | `#fbbf24` | High badge text |
| `blue-500` | `#3b82f6` | Medium tier, api type badges, links |
| `blue-400` | `#60a5fa` | Medium badge text |
| `emerald-500` | `#10b981` | Resolved status, healthy indicators |
| `purple-400` | `#c084fc` | Gateway type badge |
| `cyan-400` | `#22d3ee` | Cache type badge |
| `orange-400` | `#fb923c` | Queue type badge |

### Typography Scale

| Element | Classes |
|---------|---------|
| Page title (h1) | `text-3xl font-bold text-white tracking-tight font-sans` |
| Section title (h2) | `text-xl font-semibold text-white font-sans` |
| Card title | `text-base font-semibold text-slate-100 font-sans` |
| Body text | `text-sm text-slate-300 font-sans` |
| Muted/secondary | `text-xs text-slate-400 font-sans` |
| Monospace (IDs, code) | `text-xs text-slate-400 font-mono` |
| Badge text | `text-xs font-medium font-sans` |
| Hop label | `text-xs font-semibold text-slate-400 uppercase tracking-widest font-sans` |

### Component Variants Reference

**Card:**
```
Base: bg-slate-800 border border-slate-700 rounded-xl p-4
Hover: hover:border-slate-500 hover:bg-slate-750 transition-colors cursor-pointer
Selected: border-red-500 bg-red-950/30
Affected: border-l-4 border-l-red-500
```

**Button (primary):**
```
bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-4 py-2 rounded-lg
transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
focus:ring-offset-slate-900
```

**Button (secondary):**
```
bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-sm px-4 py-2 rounded-lg
transition-colors
```

**Button (ghost):**
```
text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-sm px-3 py-1.5 rounded-lg
transition-colors
```

**Nav link (active):**
```
bg-slate-800 text-white font-medium
```

**Nav link (inactive):**
```
text-slate-400 hover:text-slate-200 hover:bg-slate-800/50
```

**Sidebar:**
```
bg-slate-950 border-r border-slate-800 w-64 flex-shrink-0
```

**TopBar:**
```
border-b border-slate-800 bg-slate-900 px-6 py-4
```

---

## 9. Responsive Behavior

The app is **mobile-first**. The base styles apply to mobile, with `md:` and `lg:` breakpoints expanding the layout.

### Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile (default) | < 768px | Single column, sidebar hidden, hamburger menu |
| Tablet (`md:`) | 768px+ | Service grid 2 columns, sidebar still hidden |
| Desktop (`lg:`) | 1024px+ | Sidebar visible, service grid 3 columns |
| Wide (`xl:`) | 1280px+ | Service grid 4 columns |

### Page-by-Page Responsive Behavior

**Service Map (`/`):**
- Mobile: 1 column grid of service cards; blast radius panel slides in as a full-screen overlay from the bottom
- Tablet: 2 column grid; blast radius panel overlays right half
- Desktop: 3–4 column grid; blast radius panel slides in from the right as a side panel

**Service Detail (`/services/:id`):**
- Mobile: stacked vertically: header → blast radius panel → dependency explorer → incidents
- Desktop: header full width, then a 2-column layout: blast radius panel (60%) | dependency explorer (40%)

**Incidents (`/incidents`):**
- Mobile: full-width list
- Desktop: list remains single-column but with wider max-width container

**Teams (`/teams`):**
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3–4 columns

**Team Detail (`/teams/:id`):**
- Mobile: stacked: header → oncall info → services list → active incidents
- Desktop: 2 columns: services (60%) | oncall info + active incidents (40%)

### Sidebar Behavior

- **Desktop (`lg:`):** Sidebar is always visible. Content area has `ml-64`.
- **Mobile/Tablet:** Sidebar is hidden by default. A hamburger icon in the `TopBar` toggles `isSidebarOpen` in `uiStore`. When open, the sidebar renders as a fixed overlay with `z-50` and a semi-transparent backdrop.

---

## 10. Accessibility

- All interactive elements have `aria-label` or visible label text
- Color is never the sole means of conveying information (badges always have text)
- Focus styles: `focus:outline-none focus:ring-2 focus:ring-blue-500` on all focusable elements
- Semantic HTML: `<nav>`, `<main>`, `<article>`, `<header>`, `<section>` used appropriately
- `<BlastRadiusPanel>` uses `aria-live="polite"` on the hop reveal section so screen readers announce new hops
- `<IncidentBadge status="active">` uses `aria-label="Active incident"` in addition to the visual dot
- Keyboard navigation: all cards and nav links reachable with Tab key
- Reduced motion: uses `prefers-reduced-motion` to disable animations for users who prefer it
  ```css
  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
  ```
