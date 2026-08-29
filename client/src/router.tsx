import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { IncidentDetailPage } from './pages/IncidentDetailPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { ServiceMapPage } from './pages/ServiceMapPage';
import { StartPage } from './pages/StartPage';
import { TeamDetailPage } from './pages/TeamDetailPage';
import { TeamsPage } from './pages/TeamsPage';
import { LoginPage } from './pages/LoginPage';
import { WorkspaceSettingsPage } from './pages/WorkspaceSettingsPage';
import { RequireAuth } from './components/auth/RequireAuth';

export const router = createBrowserRouter([
  // ── Standalone product entry & auth (no app shell) ───────────────
  { path: '/start', element: <StartPage /> },
  { path: '/login', element: <LoginPage /> },

  // ── Main app shell ───────────────────────────────────────────────
  {
    element: <AppShell />,
    children: [
      // Public / demo paths
      { index: true, element: <Navigate to="/start" replace /> },
      { path: '/services', element: <ServiceMapPage /> },

      // Protected paths
      {
        element: <RequireAuth />,
        children: [
          { path: '/services/:id', element: <ServiceDetailPage /> },
          { path: '/teams', element: <TeamsPage /> },
          { path: '/teams/:id', element: <TeamDetailPage /> },
          { path: '/incidents', element: <IncidentsPage /> },
          { path: '/incidents/:id', element: <IncidentDetailPage /> },
          { path: '/settings/workspace', element: <WorkspaceSettingsPage /> },
        ],
      },
    ],
  },
]);
