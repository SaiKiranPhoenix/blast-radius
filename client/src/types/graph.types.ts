import type { IncidentSummary } from './incident.types';
import type { ServiceSummary } from './service.types';
import type { TeamSummary } from './team.types';

export interface BlastRadiusHop {
  hop: number;
  services: ServiceSummary[];
}

export interface TeamWithAffectedServices {
  team: TeamSummary;
  affectedServices: string[];
}

export interface BlastRadiusResult {
  rootService: ServiceSummary;
  hops: BlastRadiusHop[];
  totalAffected: number;
  teamsToPage: TeamWithAffectedServices[];
  historicalIncidents: IncidentSummary[];
}

export interface DependencyResult {
  service: ServiceSummary;
  upstream: ServiceSummary[];
  downstream: ServiceSummary[];
  team: TeamSummary | null;
  incidents: IncidentSummary[];
}

export interface LongestChainEntry {
  source: string;
  sink: string;
  depth: number;
}
