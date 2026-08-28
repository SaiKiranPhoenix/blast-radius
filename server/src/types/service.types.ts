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
  dependencyCount: number; // number of services this service directly depends on
  dependentCount: number; // number of services that directly depend on this service
  team: TeamSummary | null;
}

export interface ServiceDetail extends ServiceSummary {
  // All fields from ServiceSummary plus inline team detail
}
