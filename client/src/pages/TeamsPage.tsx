import { useTeams } from '../hooks/useTeams';
import { TeamGrid } from '../components/team/TeamGrid';
import { PageHeader } from '../components/common/PageHeader';
import { Badge } from '../components/common/Badge';
import { ErrorState } from '../components/common/ErrorState';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

export function TeamsPage(): JSX.Element {
  const { data: teams, isLoading, isError, refetch } = useTeams();

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Engineering Teams"
        subtitle="Explore service ownership, contact information, and active incidents across your organization."
        badge={<Badge color="blue">{teams?.length || 0} teams</Badge>}
      />

      {isError ? (
        <ErrorState
          title="Failed to load teams"
          description="We couldn't fetch the list of teams from the API."
          action={
            <button
              type="button"
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400 inline-flex items-center gap-2"
              onClick={() => void refetch()}
            >
              <ArrowPathIcon className="w-4 h-4" />
              Try again
            </button>
          }
        />
      ) : (
        <TeamGrid teams={teams || []} isLoading={isLoading} />
      )}
    </div>
  );
}
