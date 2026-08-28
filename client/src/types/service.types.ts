import type { TeamSummary } from './team.types';

export type ServiceType = 'api' | 'worker' | 'database' | 'cache' | 'queue' | 'gateway';
export type ServiceTier = 'critical' | 'high' | 'medium' | 'low';

export interface ServiceSummary {
  id: string;
  name: string;
  type: ServiceType;
  tier: ServiceTier;
  description: string;
  language: string;
  repo_url: string;
  dependencyCount: number;
  dependentCount: number;
  team: TeamSummary | null;
}

export type ServiceDetail = ServiceSummary;
