import type { TeamSummaryWithCounts } from '../../types/team.types';
import { TeamCard } from './TeamCard';
import { TeamSkeleton } from './TeamSkeleton';
import { EmptyState } from '../common/EmptyState';
import { UserGroupIcon } from '@heroicons/react/24/outline';

interface TeamGridProps {
  teams: TeamSummaryWithCounts[];
  isLoading: boolean;
}

export function TeamGrid({ teams, isLoading }: TeamGridProps): JSX.Element {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-500">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <TeamSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="mt-12">
        <EmptyState
          icon={UserGroupIcon}
          title="No teams found"
          description="It looks like there are no teams populated yet."
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {teams.map((team) => (
        <TeamCard key={team.id} team={team} />
      ))}
    </div>
  );
}
