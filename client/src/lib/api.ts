import axios, { type AxiosError, type AxiosResponse } from 'axios';
import type { ApiFailure, ApiSuccess } from '../types/api.types';
import type { MeResponse } from '../types/auth.types';
import type { BlastRadiusResult, DependencyResult, LongestChainEntry } from '../types/graph.types';
import type {
  IncidentDetail,
  IncidentSeverity,
  IncidentStatus,
  IncidentSummary,
} from '../types/incident.types';
import type {
  ServiceDetail,
  ServiceSummary,
  ServiceTier,
  ServiceType,
} from '../types/service.types';
import type { TeamDetail, TeamSummaryWithCounts } from '../types/team.types';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15_000,
  withCredentials: true, // Required for session cookies
});

const responseInterceptor = api.interceptors.response as unknown as {
  use: (
    onFulfilled: (response: AxiosResponse<ApiSuccess<unknown> | ApiFailure>) => unknown,
    onRejected: (error: AxiosError<ApiFailure>) => never,
  ) => number;
};

responseInterceptor.use(
  (response) => {
    const envelope = response.data;
    if (envelope.success) return envelope.data;
    throw new ApiError(envelope.error.message, envelope.error.code, response.status);
  },
  (error) => {
    const failure = error.response?.data;
    if (failure && !failure.success) {
      throw new ApiError(failure.error.message, failure.error.code, error.response?.status);
    }

    throw new ApiError(
      error.message || 'The server did not respond.',
      'NETWORK_ERROR',
      error.response?.status,
    );
  },
);

export type ServiceFilters = {
  type?: ServiceType;
  tier?: ServiceTier;
};

export type IncidentFilters = {
  severity?: IncidentSeverity;
  status?: IncidentStatus;
};

export const apiClient = {
  services: {
    list: async (filters?: ServiceFilters): Promise<ServiceSummary[]> => {
      const result = await api.get<unknown, { services: ServiceSummary[] }>('/api/services', {
        params: filters,
      });
      return result.services;
    },
    detail: async (id: string): Promise<ServiceDetail> => {
      const result = await api.get<unknown, { service: ServiceDetail }>(`/api/services/${id}`);
      return result.service;
    },
    blastRadius: (id: string, maxHops?: number) =>
      api.get<unknown, BlastRadiusResult>(`/api/services/${id}/blast-radius`, {
        params: { maxHops },
      }),
    dependencies: (id: string) =>
      api.get<unknown, DependencyResult>(`/api/services/${id}/dependencies`),
  },
  teams: {
    list: async (): Promise<TeamSummaryWithCounts[]> => {
      const result = await api.get<unknown, { teams: TeamSummaryWithCounts[] }>('/api/teams');
      return result.teams;
    },
    detail: async (id: string): Promise<TeamDetail> => {
      const result = await api.get<unknown, { team: TeamDetail }>(`/api/teams/${id}`);
      return result.team;
    },
  },
  incidents: {
    list: async (filters?: IncidentFilters): Promise<IncidentSummary[]> => {
      const result = await api.get<unknown, { incidents: IncidentSummary[] }>('/api/incidents', {
        params: filters,
      });
      return result.incidents;
    },
    detail: async (id: string): Promise<IncidentDetail> => {
      const result = await api.get<unknown, { incident: IncidentDetail }>(`/api/incidents/${id}`);
      return result.incident;
    },
  },
  graph: {
    longestChain: async (): Promise<LongestChainEntry[]> => {
      const result = await api.get<unknown, { chains: LongestChainEntry[] }>(
        '/api/graph/longest-chain',
      );
      return result.chains;
    },
  },
  auth: {
    me: (): Promise<MeResponse> => api.get<unknown, MeResponse>('/api/me'),
    demo: (): Promise<MeResponse> => api.post<unknown, MeResponse>('/api/auth/demo'),
    login: (email: string): Promise<MeResponse> =>
      api.post<unknown, MeResponse>('/api/auth/login', { email }),
    logout: (): Promise<void> => api.post('/api/auth/logout'),
  },
};
