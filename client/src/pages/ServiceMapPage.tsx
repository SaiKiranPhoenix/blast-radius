import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { Badge } from '../components/common/Badge';
import { ErrorState } from '../components/common/ErrorState';
import { PageHeader } from '../components/common/PageHeader';
import { Spinner } from '../components/common/Spinner';
import { useServices } from '../hooks/useServices';
import { SylvaHero } from '../threeui';
import { ServiceGrid } from '../components/service/ServiceGrid';
import { BlastRadiusPanel } from '../components/blast-radius/BlastRadiusPanel';
import { useUI } from '../store/uiStore';

export function ServiceMapPage(): JSX.Element {
  const servicesQuery = useServices();
  const services = servicesQuery.data ?? [];
  const { selectedServiceId, setSelectedServiceId } = useUI();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden flex">
      <div className="absolute inset-0 h-[52rem] max-h-screen">
        <div className="shader-frame">
          <SylvaHero
            variant="living-green"
            headingFont="lexend"
            bodyFont="lexend"
            headingWeight="300"
            bodyWeight="300"
            primaryColor="#ffffff"
            headingSize={63}
            bodySize={16.5}
            headingLetterSpacing={-0.006}
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/5 via-slate-950/25 to-slate-950/90" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.62),rgba(2,6,23,0.22)_44%,rgba(2,6,23,0.08))]" />
      </div>

      <div className="relative flex-1 min-w-0 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
        <section className="flex min-h-[34rem] max-w-5xl flex-col justify-end pb-10">
          <Badge color="emerald" dot dotAnimate>
            Live topology
          </Badge>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-normal text-white sm:text-6xl">
            See what breaks when something breaks.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200">
            Explore dependency paths, ownership, and incident history from one calm command center.
          </p>
        </section>

        <section className="animate-slide-in-up">
          <PageHeader
            title="Service Map"
            subtitle="Explore microservices grouped by team and simulate their blast radius."
            badge={<Badge color="blue">{services.length || '...'} services</Badge>}
            actions={servicesQuery.isFetching ? <Spinner label="Refreshing" /> : null}
          />

          <div className="mt-6">
            {servicesQuery.isError ? (
              <ErrorState
                action={
                  <button
                    type="button"
                    className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400"
                    onClick={() => void servicesQuery.refetch()}
                  >
                    <ArrowPathIcon className="mr-2 inline h-4 w-4" aria-hidden="true" />
                    Try again
                  </button>
                }
                description="The service map could not be loaded from the API."
                title="Service map unavailable"
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
