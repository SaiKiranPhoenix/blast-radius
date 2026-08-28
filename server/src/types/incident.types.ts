import type { ServiceSummary } from './service.types';

export type IncidentSeverity = 'SEV1' | 'SEV2' | 'SEV3';
export type IncidentStatus = 'active' | 'resolved' | 'monitoring';

export interface IncidentSummary {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  started_at: string; // ISO 8601
  resolved_at: string | null; // ISO 8601, null if not resolved
  description: string;
  affectedServiceCount: number;
  rootCauseService: ServiceSummary | null;
}

export interface DeploymentSummary {
  id: string;
  version: string;
  deployed_at: string; // ISO 8601
  deployed_by: string;
  environment: 'production' | 'staging';
}

export interface IncidentDetail extends IncidentSummary {
  affectedServices: ServiceSummary[];
  triggeredBy: DeploymentSummary | null;
}
