import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { teamKeys } from '../lib/queryKeys';

export function useTeams() {
  return useQuery({
    queryKey: teamKeys.lists(),
    queryFn: apiClient.teams.list,
  });
}

export function useTeam(id: string | undefined) {
  return useQuery({
    queryKey: teamKeys.detail(id ?? ''),
    queryFn: () => apiClient.teams.detail(id ?? ''),
    enabled: Boolean(id),
  });
}
