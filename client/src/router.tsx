import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { IncidentDetailPage } from './pages/IncidentDetailPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { ServiceMapPage } from './pages/ServiceMapPage';
import { TeamDetailPage } from './pages/TeamDetailPage';
import { TeamsPage } from './pages/TeamsPage';

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <ServiceMapPage /> },
      { path: '/services/:id', element: <ServiceDetailPage /> },
      { path: '/teams', element: <TeamsPage /> },
      { path: '/teams/:id', element: <TeamDetailPage /> },
      { path: '/incidents', element: <IncidentsPage /> },
      { path: '/incidents/:id', element: <IncidentDetailPage /> },
    ],
  },
]);
