import { useParams, Link } from 'react-router-dom';
import { useTeam } from '../hooks/useTeams';
import { PageHeader } from '../components/common/PageHeader';
import { Spinner } from '../components/common/Spinner';
import { ErrorState } from '../components/common/ErrorState';
import { Card } from '../components/common/Card';
import { ServiceCard } from '../components/service/ServiceCard';
import {
  HashtagIcon,
  ClockIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Badge } from '../components/common/Badge';

export function TeamDetailPage(): JSX.Element {
  const { id } = useParams();
  const { data: team, isLoading, isError, refetch } = useTeam(id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner />
      </div>
    );
  }

  if (isError || !team) {
    return (
      <div className="px-4 py-8 max-w-7xl mx-auto">
        <ErrorState
          title="Team not found"
          description="We couldn't load the details for this team."
          action={
            <button
              onClick={() => void refetch()}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-medium text-sm transition-colors"
            >
              Retry
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <PageHeader title={team.name} subtitle="Team Overview and Ownership" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Oncall Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-300">
                <HashtagIcon className="w-5 h-5 text-slate-400" />
                <span>{team.slack_channel}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <EnvelopeIcon className="w-5 h-5 text-slate-400" />
                <span>{team.oncall_email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <ClockIcon className="w-5 h-5 text-slate-400" />
                <span>{team.timezone}</span>
              </div>
            </div>
          </Card>

          {team.activeIncidents?.length > 0 && (
            <Card className="p-6 border-red-500/20 bg-red-500/5">
              <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5" />
                Active Incidents
              </h3>
              <ul className="space-y-3">
                {team.activeIncidents.map((incident) => (
                  <li key={incident.id}>
                    <Link
                      to={`/incidents/${incident.id}`}
                      className="block p-3 rounded bg-slate-900 border border-red-500/10 hover:border-red-500/30 transition-colors"
                    >
                      <div className="font-medium text-slate-200 text-sm mb-1">
                        {incident.title}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge color={incident.severity === 'SEV1' ? 'red' : 'amber'} size="sm">
                          {incident.severity}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {new Date(incident.started_at).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-100">Owned Services</h3>
            <Badge color="slate">{team.services?.length || 0} total</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {team.services?.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>

          {(!team.services || team.services.length === 0) && (
            <div className="p-12 text-center border border-slate-700/50 rounded-xl bg-slate-800/20">
              <p className="text-slate-400">This team does not currently own any services.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
