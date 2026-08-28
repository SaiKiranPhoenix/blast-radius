import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { Badge } from '../components/common/Badge';
import { ErrorState } from '../components/common/ErrorState';
import { PageHeader } from '../components/common/PageHeader';
import { Spinner } from '../components/common/Spinner';
import { useServices } from '../hooks/useServices';
import { ServiceGrid } from '../components/service/ServiceGrid';
import { BlastRadiusPanel } from '../components/blast-radius/BlastRadiusPanel';
import { useUI } from '../store/uiStore';

export function ServiceMapPage(): JSX.Element {
  const servicesQuery = useServices();
  const services = servicesQuery.data ?? [];
  const { selectedServiceId, setSelectedServiceId } = useUI();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-hud-black bg-tactical-grid">
      <div className="relative flex-1 min-w-0 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
        <section className="flex min-h-[14rem] max-w-5xl flex-col justify-end pb-10">
          <Badge color="emerald" dot dotAnimate>
            Live topology
          </Badge>
          <h1 className="mt-5 max-w-4xl text-4xl font-mono font-bold tracking-tight text-hud-cyan uppercase">
            BLAST_RADIUS // SYSTEM_MAP
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 font-mono">
            &gt; INITIALIZING DEPENDENCY GRAPH...
            <br />
            &gt; AWAITING DIRECTIVES.
          </p>
        </section>

        <section className="animate-slide-in-up">
          <PageHeader
            title="Service Grid"
            subtitle="Explore microservices and simulate their blast radius."
            badge={<Badge color="blue">{services.length || '...'} nodes</Badge>}
            actions={servicesQuery.isFetching ? <Spinner label="Refreshing" /> : null}
          />

          <div className="mt-6">
            {servicesQuery.isError ? (
              <ErrorState
                action={
                  <button
                    type="button"
                    className="rounded-sm border border-hud-red bg-hud-red-dim px-4 py-2 text-sm font-mono font-bold uppercase text-hud-red shadow-hud-glow-red hover:bg-hud-red/20 transition-all"
                    onClick={() => void servicesQuery.refetch()}
                  >
                    <ArrowPathIcon className="mr-2 inline h-4 w-4" aria-hidden="true" />
                    Retry Connection
                  </button>
                }
                description="The service map could not be loaded from the API."
                title="SYS_ERR: Connection Lost"
              />
            ) : (
              <ServiceGrid services={services} isLoading={servicesQuery.isLoading} />
            )}
          </div>
        </section>
      </div>

      <BlastRadiusPanel
        serviceId={selectedServiceId}
        onClose={() => setSelectedServiceId(null)}
      />
    </div>
  );
}
