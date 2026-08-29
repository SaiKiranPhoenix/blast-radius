import { useParams } from 'react-router-dom';
import { useIncident } from '../hooks/useIncidents';
import { ErrorState } from '../components/common/ErrorState';
import { Spinner } from '../components/common/Spinner';
import { Card } from '../components/common/Card';
import { ServiceCard } from '../components/service/ServiceCard';
import { Badge } from '../components/common/Badge';
import { SeverityBadge, StatusBadge } from '../components/incident/IncidentBadge';
import {
  ClockIcon,
  CalendarIcon,
  ServerStackIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

function getDurationMinutes(start: string, end: string | null): number {
  const endMs = end ? new Date(end).getTime() : new Date().getTime();
  return Math.round((endMs - new Date(start).getTime()) / 60000);
}

export function IncidentDetailPage(): JSX.Element {
  const { id } = useParams();
  const { data: incident, isLoading, isError, refetch } = useIncident(id);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner />
      </div>
    );
  if (isError || !incident) {
    return (
      <div className="px-4 py-8 max-w-7xl mx-auto">
        <ErrorState
          title="Incident not found"
          description="We couldn't load the details for this incident."
          action={
            <button
              onClick={() => void refetch()}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Retry
            </button>
          }
        />
      </div>
    );
  }

  const durationMins = getDurationMinutes(incident.started_at, incident.resolved_at);

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <SeverityBadge severity={incident.severity} size="md" />
            <StatusBadge status={incident.status} size="md" />
            <div className="px-3 py-1 bg-slate-800 rounded-full text-sm text-slate-300 font-medium">
              ID: {incident.id.split('-')[0]}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{incident.title}</h1>
          <p className="text-slate-400 max-w-3xl leading-relaxed text-lg">{incident.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <ClockIcon className="w-5 h-5" />
              Timeline
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:left-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-700 before:to-slate-800">
              <div className="relative">
                <div className="absolute left-[-29px] mt-1 w-4 h-4 rounded-full bg-red-500 ring-4 ring-slate-950" />
                <h4 className="text-sm font-semibold text-slate-200">Incident Detected</h4>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {formatDateTime(incident.started_at)}
                </div>
              </div>

              {incident.triggeredBy && (
                <div className="relative">
                  <div className="absolute left-[-29px] mt-1 w-4 h-4 rounded-full bg-blue-500 ring-4 ring-slate-950" />
                  <h4 className="text-sm font-semibold text-slate-200">Triggering Deployment</h4>
                  <div className="mt-1 text-xs text-slate-400 space-y-1">
                    <div>Version {incident.triggeredBy.version}</div>
                    <div>By {incident.triggeredBy.deployed_by}</div>
                  </div>
                </div>
              )}

              {incident.resolved_at && (
                <div className="relative">
                  <div className="absolute left-[-29px] mt-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-slate-950" />
                  <h4 className="text-sm font-semibold text-slate-200">Incident Resolved</h4>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                    <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" />
                    {formatDateTime(incident.resolved_at)}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Total downtime: {Math.floor(durationMins / 60)}h {durationMins % 60}m
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
              Root Cause
            </h3>
            {incident.rootCauseService ? (
              <ServiceCard service={incident.rootCauseService} variant="compact" />
            ) : (
              <div className="text-sm text-slate-400 italic">No root cause service identified.</div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
              <ServerStackIcon className="w-5 h-5 text-slate-400" />
              Affected Services
            </h3>
            <Badge color="red">{incident.affectedServices.length} affected</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incident.affectedServices.map((service) => (
              <ServiceCard key={service.id} service={service} variant="affected" />
            ))}
          </div>

          {incident.affectedServices.length === 0 && (
            <div className="p-12 text-center border border-slate-800 rounded-xl bg-slate-900/50">
              <p className="text-slate-400">No cascading impact recorded for this incident.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
