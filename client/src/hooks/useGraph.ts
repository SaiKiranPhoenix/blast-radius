import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { graphKeys } from '../lib/queryKeys';

export function useLongestChain() {
  return useQuery({
    queryKey: graphKeys.longestChain(),
    queryFn: apiClient.graph.longestChain,
  });
}
