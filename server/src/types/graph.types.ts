import type { ServiceSummary } from './service.types';
import type { TeamSummary } from './team.types';
import type { IncidentSummary } from './incident.types';

export interface BlastRadiusHop {
  hop: number; // 1-indexed hop distance from failing service
  services: ServiceSummary[];
}

export interface TeamWithAffectedServices {
  team: TeamSummary;
  affectedServices: string[]; // service names
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
  upstream: ServiceSummary[]; // services this one depends on (outgoing DEPENDS_ON)
  downstream: ServiceSummary[]; // services that depend on this one (incoming DEPENDS_ON)
  team: TeamSummary | null;
  incidents: IncidentSummary[]; // incidents this service caused
}

export interface LongestChainEntry {
  source: string; // service name at the top of the chain
  sink: string; // leaf service name at the bottom
  depth: number; // number of hops
}
