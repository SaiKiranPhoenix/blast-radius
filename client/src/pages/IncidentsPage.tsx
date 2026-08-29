import { useState } from 'react';
import { useIncidents } from '../hooks/useIncidents';
import { IncidentCard } from '../components/incident/IncidentCard';
import { IncidentSkeleton } from '../components/incident/IncidentSkeleton';
import { PageHeader } from '../components/common/PageHeader';
import { Badge } from '../components/common/Badge';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import type { IncidentSeverity, IncidentStatus } from '../types/incident.types';

export function IncidentsPage(): JSX.Element {
  const [severityFilter, setSeverityFilter] = useState<IncidentSeverity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'all'>('all');

  // We fetch all and filter client side for simplicity in this demo,
  // or pass filters to hook if API supports it. The hook supports filters.
  const {
    data: incidents,
    isLoading,
    isError,
    refetch,
  } = useIncidents({
    severity: severityFilter === 'all' ? undefined : severityFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      <PageHeader
        title="Incidents"
        subtitle="Track active outages and review historical blast radius impact."
        badge={<Badge color="blue">{incidents?.length || 0} incidents</Badge>}
        actions={
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as IncidentStatus | 'all')}
              className="bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="monitoring">Monitoring</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as IncidentSeverity | 'all')}
              className="bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Severities</option>
              <option value="SEV1">SEV1 (Critical)</option>
              <option value="SEV2">SEV2 (High)</option>
              <option value="SEV3">SEV3 (Medium)</option>
            </select>
          </div>
        }
      />

      {isError ? (
        <ErrorState
          title="Failed to load incidents"
          description="We couldn't fetch the incidents from the API."
          action={
            <button
              onClick={() => void refetch()}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-medium text-sm flex items-center gap-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Try again
            </button>
          }
        />
      ) : isLoading ? (
        <div className="space-y-4 animate-in fade-in duration-500">
          {[1, 2, 3].map((i) => (
            <IncidentSkeleton key={i} />
          ))}
        </div>
      ) : !incidents || incidents.length === 0 ? (
        <div className="mt-12">
          <EmptyState
            icon={ExclamationTriangleIcon}
            title="No incidents found"
            description="There are no incidents matching your current filters."
            action={
              severityFilter !== 'all' || statusFilter !== 'all' ? (
                <button
                  onClick={() => {
                    setSeverityFilter('all');
                    setStatusFilter('all');
                  }}
                  className="mt-4 text-sm text-blue-400 hover:text-blue-300"
                >
                  Clear filters
                </button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          {incidents.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}
        </div>
      )}
    </div>
  );
}
