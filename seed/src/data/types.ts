export type ServiceType = 'api' | 'worker' | 'database' | 'cache' | 'queue' | 'gateway';
export type ServiceTier = 'critical' | 'high' | 'medium' | 'low';
export type DependencyCriticality = 'hard' | 'soft';
export type IncidentSeverity = 'SEV1' | 'SEV2' | 'SEV3';
export type IncidentStatus = 'active' | 'resolved' | 'monitoring';
export type DeploymentEnvironment = 'production' | 'staging';

export interface TeamData {
  id: string;
  name: string;
  slack_channel: string;
  oncall_email: string;
  timezone: string;
}

export interface ServiceData {
  id: string;
  name: string;
  type: ServiceType;
  tier: ServiceTier;
  description: string;
  language: string;
  repo_url: string;
  teamId: string;
}

export interface DependencyData {
  from: string;
  to: string;
  criticality: DependencyCriticality;
  latency_ms: number;
}

export interface IncidentData {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  started_at: string;
  resolved_at: string | null;
  description: string;
  rootCauseServiceId: string;
  affectedServiceIds: string[];
}

export interface DeploymentData {
  id: string;
  version: string;
  deployed_at: string;
  deployed_by: string;
  environment: DeploymentEnvironment;
  deployedToServiceId: string;
  triggeredIncidentId: string | null;
}
