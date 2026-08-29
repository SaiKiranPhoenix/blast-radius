import { Link } from 'react-router-dom';
import type { IncidentSummary } from '../../types/incident.types';
import { Card } from '../common/Card';
import { SeverityBadge, StatusBadge } from './IncidentBadge';
import { ClockIcon, ServerStackIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface IncidentCardProps {
  incident: IncidentSummary;
  variant?: 'default' | 'compact';
}

function getRelativeTimeString(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (Math.abs(diffDays) > 0) return rtf.format(diffDays, 'day');
  if (Math.abs(diffHours) > 0) return rtf.format(diffHours, 'hour');
  return rtf.format(diffMinutes, 'minute');
}

function getDurationString(start: string, end: string | null): string {
  if (!end) return 'Ongoing';
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours > 0) {
    const remainingMins = diffMinutes % 60;
    return `${diffHours}h ${remainingMins}m`;
  }
  return `${diffMinutes}m`;
}

export function IncidentCard({ incident, variant = 'default' }: IncidentCardProps): JSX.Element {
  const isCompact = variant === 'compact';

  return (
    <Link to={`/incidents/${incident.id}`} className="block group h-full">
      <Card
        interactive
        className={`h-full flex flex-col ${isCompact ? 'p-4' : 'p-5'} border-slate-700/50 hover:border-slate-600 transition-colors`}
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3
            className={`font-semibold text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-2 ${isCompact ? 'text-base' : 'text-lg'}`}
          >
            {incident.title}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            <SeverityBadge severity={incident.severity} size={isCompact ? 'sm' : 'md'} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <StatusBadge status={incident.status} size={isCompact ? 'sm' : 'md'} />
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ClockIcon className="w-3.5 h-3.5" />
            <span>{getRelativeTimeString(incident.started_at)}</span>
            <span className="text-slate-600">•</span>
            <span className={!incident.resolved_at ? 'text-amber-400/90 font-medium' : ''}>
              {getDurationString(incident.started_at, incident.resolved_at)}
            </span>
          </div>
        </div>

        {!isCompact && (
          <p className="text-sm text-slate-400 mb-6 line-clamp-2 flex-1">{incident.description}</p>
        )}

        <div
          className={`mt-auto pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 ${isCompact ? 'text-xs' : 'text-sm'}`}
        >
          <div className="flex items-center gap-2 text-slate-300">
            <ServerStackIcon className="w-4 h-4 text-slate-500" />
            <span>
              <span className="font-medium text-slate-200">{incident.affectedServiceCount}</span>{' '}
              affected
            </span>
          </div>

          {incident.rootCauseService && (
            <div className="flex items-center gap-1.5 text-slate-300 max-w-[50%]">
              <ExclamationTriangleIcon className="w-4 h-4 text-red-400/80 shrink-0" />
              <span className="truncate">Root: {incident.rootCauseService.name}</span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
