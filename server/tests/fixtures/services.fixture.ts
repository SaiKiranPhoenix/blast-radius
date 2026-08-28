import type { ServiceSummary } from '../../src/types/service.types';
import { teamIdentity, teamPlatform } from './teams.fixture';

export const serviceAuth: ServiceSummary = {
  id: 'svc-auth',
  name: 'Auth Service',
  type: 'api',
  tier: 'critical',
  description: 'Handles authentication and authorization.',
  language: 'TypeScript',
  repo_url: 'https://github.com/acme/auth-service',
  dependencyCount: 2,
  dependentCount: 18,
  team: teamIdentity,
};

export const serviceGateway: ServiceSummary = {
  id: 'svc-api-gateway',
  name: 'API Gateway',
  type: 'gateway',
  tier: 'critical',
  description: 'Primary ingress point for all external traffic.',
  language: 'Go',
  repo_url: 'https://github.com/acme/api-gateway',
  dependencyCount: 4,
  dependentCount: 0,
  team: teamPlatform,
};

export const servicePostgres: ServiceSummary = {
  id: 'svc-postgres-main',
  name: 'Main Postgres',
  type: 'database',
  tier: 'critical',
  description: 'Primary relational datastore.',
  language: 'N/A',
  repo_url: '',
  dependencyCount: 0,
  dependentCount: 6,
  team: teamPlatform,
};
