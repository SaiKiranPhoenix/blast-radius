import { useParams } from 'react-router-dom';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { ErrorState } from '../components/common/ErrorState';
import { PageHeader } from '../components/common/PageHeader';
import { Spinner } from '../components/common/Spinner';
import { useIncident } from '../hooks/useIncidents';

export function IncidentDetailPage(): JSX.Element {
  const { id } = useParams();
  const incidentQuery = useIncident(id);
  const incident = incidentQuery.data;

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      {incidentQuery.isLoading ? (
        <Spinner label="Loading incident" />
      ) : incidentQuery.isError || !incident ? (
        <ErrorState description="This incident could not be found or the API is unavailable." title="Incident unavailable" />
      ) : (
        <>
          <PageHeader
            title={incident.title}
            subtitle={incident.description}
            badge={<Badge color={incident.status === 'active' ? 'red' : 'slate'}>{incident.status}</Badge>}
          />
          <Card className="mt-6 p-5">
            <p className="text-sm text-slate-400">Root cause</p>
            <p className="mt-1 text-lg font-semibold text-white">{incident.rootCauseService?.name ?? 'Unknown'}</p>
            <p className="mt-4 text-sm text-slate-400">{incident.affectedServiceCount} affected services</p>
          </Card>
        </>
      )}
    </div>
  );
}
