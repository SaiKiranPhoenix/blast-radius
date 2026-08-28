import { useParams } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { ErrorState } from '../components/common/ErrorState';
import { PageHeader } from '../components/common/PageHeader';
import { Spinner } from '../components/common/Spinner';
import { useService } from '../hooks/useServices';
import { DependencyExplorer } from '../components/dependency/DependencyExplorer';
import { BlastRadiusPanel } from '../components/blast-radius/BlastRadiusPanel';
import { ServiceTypeBadge, ServiceTierBadge } from '../components/service/ServiceBadge';

export function ServiceDetailPage(): JSX.Element {
  const { id } = useParams();
  const serviceQuery = useService(id);
  const service = serviceQuery.data;

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 space-y-10 max-w-7xl mx-auto">
      {serviceQuery.isLoading ? (
        <Spinner label="Loading service" />
      ) : serviceQuery.isError || !service ? (
        <ErrorState description="This service could not be found or the API is unavailable." title="Service unavailable" />
      ) : (
        <>
          <PageHeader
            title={service.name}
            subtitle={service.description}
            badge={<ServiceTierBadge tier={service.tier} />}
          />
          
          <Card className="p-5 border-slate-700/50 bg-slate-900/50">
            <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-slate-500 mb-2">Type</dt>
                <dd><ServiceTypeBadge type={service.type} /></dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-slate-500 mb-2">Team</dt>
                <dd className="font-medium text-slate-200">{service.team?.name ?? 'Unassigned'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-slate-500 mb-2">Depends on</dt>
                <dd className="font-medium text-emerald-400">{service.dependencyCount}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-slate-500 mb-2">Dependents</dt>
                <dd className="font-medium text-amber-400">{service.dependentCount}</dd>
              </div>
            </dl>
          </Card>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-100">Dependencies</h2>
            <DependencyExplorer serviceId={service.id} />
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-100">Blast Radius Analysis</h2>
            <div className="h-[600px] border border-slate-700/50 rounded-xl overflow-hidden shadow-card">
              <BlastRadiusPanel serviceId={service.id} onClose={() => {}} inline />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
