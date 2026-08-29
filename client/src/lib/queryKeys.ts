import type { IncidentFilters, ServiceFilters } from './api';

export const serviceKeys = {
  all: ['services'] as const,
  lists: () => [...serviceKeys.all, 'list'] as const,
  list: (filters?: ServiceFilters) => [...serviceKeys.lists(), filters ?? {}] as const,
  details: () => [...serviceKeys.all, 'detail'] as const,
  detail: (id: string) => [...serviceKeys.details(), id] as const,
  blastRadius: (id: string, maxHops?: number) =>
    [...serviceKeys.detail(id), 'blast-radius', maxHops] as const,
  dependencies: (id: string) => [...serviceKeys.detail(id), 'dependencies'] as const,
};

export const teamKeys = {
  all: ['teams'] as const,
  lists: () => [...teamKeys.all, 'list'] as const,
  detail: (id: string) => [...teamKeys.all, 'detail', id] as const,
};

export const incidentKeys = {
  all: ['incidents'] as const,
  lists: () => [...incidentKeys.all, 'list'] as const,
  list: (filters?: IncidentFilters) => [...incidentKeys.lists(), filters ?? {}] as const,
  detail: (id: string) => [...incidentKeys.all, 'detail', id] as const,
};

export const graphKeys = {
  all: ['graph'] as const,
  longestChain: () => [...graphKeys.all, 'longest-chain'] as const,
};
