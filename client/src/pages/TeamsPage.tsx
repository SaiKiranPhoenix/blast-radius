import { UserGroupIcon } from '@heroicons/react/24/outline';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { PageHeader } from '../components/common/PageHeader';
import { Spinner } from '../components/common/Spinner';
import { useTeams } from '../hooks/useTeams';

export function TeamsPage(): JSX.Element {
  const teamsQuery = useTeams();
  const teams = teamsQuery.data ?? [];

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader title="Teams" subtitle="Owners, on-call paths, and active incident load." />
      <div className="mt-6">
        {teamsQuery.isLoading ? (
          <Spinner label="Loading teams" />
        ) : teamsQuery.isError ? (
          <ErrorState description="Team data could not be loaded from the API." title="Teams unavailable" />
        ) : teams.length === 0 ? (
          <EmptyState icon={UserGroupIcon} title="No teams yet" description="Seeded teams will appear here." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {teams.map((team) => (
              <Card key={team.id} interactive className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-white">{team.name}</h2>
                    <p className="mt-1 text-sm text-slate-400">{team.slack_channel}</p>
                  </div>
                  <Badge color={team.activeIncidentCount > 0 ? 'amber' : 'emerald'} dot={team.activeIncidentCount > 0} dotAnimate>
                    {team.activeIncidentCount}
                  </Badge>
                </div>
                <p className="mt-4 text-sm text-slate-400">{team.serviceCount} owned services</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
