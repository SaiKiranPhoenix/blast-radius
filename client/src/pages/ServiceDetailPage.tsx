import { useParams } from 'react-router-dom';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { ErrorState } from '../components/common/ErrorState';
import { PageHeader } from '../components/common/PageHeader';
import { Spinner } from '../components/common/Spinner';
import { useService } from '../hooks/useServices';

export function ServiceDetailPage(): JSX.Element {
  const { id } = useParams();
  const serviceQuery = useService(id);
  const service = serviceQuery.data;

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      {serviceQuery.isLoading ? (
        <Spinner label="Loading service" />
      ) : serviceQuery.isError || !service ? (
        <ErrorState description="This service could not be found or the API is unavailable." title="Service unavailable" />
      ) : (
        <>
          <PageHeader
            title={service.name}
            subtitle={service.description}
            badge={<Badge color={service.tier === 'critical' ? 'red' : 'blue'}>{service.tier}</Badge>}
          />
          <Card className="mt-6 p-5">
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">Type</dt>
                <dd className="mt-1 text-white">{service.type}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">Team</dt>
                <dd className="mt-1 text-white">{service.team?.name ?? 'Unassigned'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">Depends on</dt>
                <dd className="mt-1 text-white">{service.dependencyCount}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">Dependents</dt>
                <dd className="mt-1 text-white">{service.dependentCount}</dd>
              </div>
            </dl>
          </Card>
        </>
      )}
    </div>
  );
}
