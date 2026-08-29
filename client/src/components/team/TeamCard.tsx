import { Link } from 'react-router-dom';
import type { TeamSummaryWithCounts } from '../../types/team.types';
import { Card } from '../common/Card';
import {
  HashtagIcon,
  ClockIcon,
  ServerStackIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

interface TeamCardProps {
  team: TeamSummaryWithCounts;
}

export function TeamCard({ team }: TeamCardProps): JSX.Element {
  const hasIncidents = team.activeIncidentCount > 0;

  return (
    <Link to={`/teams/${team.id}`} className="block h-full group">
      <Card
        interactive
        className="h-full flex flex-col p-5 border-slate-700/50 hover:border-slate-600 transition-colors"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">
            {team.name}
          </h3>
          {hasIncidents && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium shrink-0 shadow-sm animate-pulse-glow">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              {team.activeIncidentCount} Active
            </div>
          )}
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <HashtagIcon className="w-4 h-4 shrink-0" />
            <span className="truncate">{team.slack_channel}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <ClockIcon className="w-4 h-4 shrink-0" />
            <span className="truncate">{team.timezone}</span>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <ServerStackIcon className="w-4 h-4 text-slate-500" />
            <span className="font-medium">{team.serviceCount}</span>
            <span className="text-slate-500">services</span>
          </div>

          {hasIncidents && (
            <div className="flex items-center gap-1.5 text-xs text-red-400/80 font-medium">
              <ExclamationCircleIcon className="w-4 h-4" />
              Needs Attention
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
