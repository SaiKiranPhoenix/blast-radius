import { useQuery } from '@tanstack/react-query';
import { apiClient, type IncidentFilters } from '../lib/api';
import { incidentKeys } from '../lib/queryKeys';

export function useIncidents(filters?: IncidentFilters) {
  return useQuery({
    queryKey: incidentKeys.list(filters),
    queryFn: () => apiClient.incidents.list(filters),
  });
}

export function useIncident(id: string | undefined) {
  return useQuery({
    queryKey: incidentKeys.detail(id ?? ''),
    queryFn: () => apiClient.incidents.detail(id ?? ''),
    enabled: Boolean(id),
  });
}
