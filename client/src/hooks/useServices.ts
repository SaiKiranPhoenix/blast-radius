import { useQuery } from '@tanstack/react-query';
import { apiClient, type ServiceFilters } from '../lib/api';
import { serviceKeys } from '../lib/queryKeys';

export function useServices(filters?: ServiceFilters) {
  return useQuery({
    queryKey: serviceKeys.list(filters),
    queryFn: () => apiClient.services.list(filters),
  });
}

export function useService(id: string | undefined) {
  return useQuery({
    queryKey: serviceKeys.detail(id ?? ''),
    queryFn: () => apiClient.services.detail(id ?? ''),
    enabled: Boolean(id),
  });
}

export function useBlastRadius(id: string | undefined, maxHops?: number) {
  return useQuery({
    queryKey: serviceKeys.blastRadius(id ?? '', maxHops),
    queryFn: () => apiClient.services.blastRadius(id ?? '', maxHops),
    enabled: Boolean(id),
    staleTime: 0,
  });
}

export function useDependencies(id: string | undefined) {
  return useQuery({
    queryKey: serviceKeys.dependencies(id ?? ''),
    queryFn: () => apiClient.services.dependencies(id ?? ''),
    enabled: Boolean(id),
  });
}
