import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { IncidentDetailPage } from './pages/IncidentDetailPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { ServiceMapPage } from './pages/ServiceMapPage';
import { StartPage } from './pages/StartPage';
import { TeamDetailPage } from './pages/TeamDetailPage';
import { TeamsPage } from './pages/TeamsPage';

export const router = createBrowserRouter([
  // ── Standalone product entry (no app shell) ──────────────────────
  { path: '/start', element: <StartPage /> },

  // ── Main app shell ───────────────────────────────────────────────
  {
    element: <AppShell />,
    children: [
      // Redirect bare root to /start for first-time visitors
      { index: true, element: <Navigate to="/start" replace /> },
      { path: '/services', element: <ServiceMapPage /> },
      { path: '/services/:id', element: <ServiceDetailPage /> },
      { path: '/teams', element: <TeamsPage /> },
      { path: '/teams/:id', element: <TeamDetailPage /> },
      { path: '/incidents', element: <IncidentsPage /> },
      { path: '/incidents/:id', element: <IncidentDetailPage /> },
    ],
  },
]);
