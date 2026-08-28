import { useParams } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { ErrorState } from '../components/common/ErrorState';
import { PageHeader } from '../components/common/PageHeader';
import { Spinner } from '../components/common/Spinner';
import { useTeam } from '../hooks/useTeams';

export function TeamDetailPage(): JSX.Element {
  const { id } = useParams();
  const teamQuery = useTeam(id);
  const team = teamQuery.data;

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      {teamQuery.isLoading ? (
        <Spinner label="Loading team" />
      ) : teamQuery.isError || !team ? (
        <ErrorState description="This team could not be found or the API is unavailable." title="Team unavailable" />
      ) : (
        <>
          <PageHeader title={team.name} subtitle={`${team.oncall_email} · ${team.timezone}`} />
          <Card className="mt-6 p-5">
            <p className="text-sm text-slate-400">{team.services.length} services owned</p>
            <p className="mt-2 text-sm text-slate-400">{team.activeIncidents.length} active incidents</p>
          </Card>
        </>
      )}
    </div>
  );
}
