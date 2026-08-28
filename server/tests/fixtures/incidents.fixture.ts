import type { IncidentSummary } from '../../src/types/incident.types';
import { serviceAuth } from './services.fixture';

export const incidentAuth: IncidentSummary = {
  id: 'inc-001',
  title: 'Auth Service Outage',
  severity: 'SEV1',
  status: 'resolved',
  started_at: '2024-09-12T02:14:00.000Z',
  resolved_at: '2024-09-12T04:47:00.000Z',
  description: 'Token validation failed across dependent services.',
  affectedServiceCount: 2,
  rootCauseService: serviceAuth,
};

export const incidentActive: IncidentSummary = {
  id: 'inc-004',
  title: 'Current Auth Error Spike',
  severity: 'SEV1',
  status: 'active',
  started_at: '2024-11-18T09:05:00.000Z',
  resolved_at: null,
  description: 'Token introspection requests are failing intermittently.',
  affectedServiceCount: 1,
  rootCauseService: serviceAuth,
};
