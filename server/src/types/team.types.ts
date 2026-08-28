import type { ServiceSummary } from './service.types';
import type { IncidentSummary } from './incident.types';

export interface TeamSummary {
  id: string;
  name: string;
  slack_channel: string;
  oncall_email: string;
  timezone: string;
}

export interface TeamDetail extends TeamSummary {
  services: ServiceSummary[];
  activeIncidents: IncidentSummary[];
}

export interface TeamSummaryWithCounts extends TeamSummary {
  serviceCount: number;
  activeIncidentCount: number;
}
