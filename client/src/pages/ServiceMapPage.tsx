import { ArrowPathIcon, ServerStackIcon } from '@heroicons/react/24/outline';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { PageHeader } from '../components/common/PageHeader';
import { Spinner } from '../components/common/Spinner';
import { useServices } from '../hooks/useServices';
import { SylvaHero } from '../threeui';

export function ServiceMapPage(): JSX.Element {
  const servicesQuery = useServices();
  const services = servicesQuery.data ?? [];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
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

      <div className="relative px-4 py-8 sm:px-6 lg:px-8">
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
            subtitle="Phase 8 will turn these into the full grouped map and blast radius simulation."
            badge={<Badge color="blue">{services.length || '...'} services</Badge>}
            actions={servicesQuery.isFetching ? <Spinner label="Refreshing" /> : null}
          />

          <div className="mt-6">
            {servicesQuery.isLoading ? (
              <Card className="flex min-h-72 items-center justify-center">
                <Spinner label="Loading services" />
              </Card>
            ) : servicesQuery.isError ? (
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
            ) : services.length === 0 ? (
              <EmptyState
                icon={ServerStackIcon}
                title="No services yet"
                description="Once seed data is available, services will appear here."
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {services.slice(0, 9).map((service) => (
                  <Card key={service.id} interactive className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-white">{service.name}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                          {service.description}
                        </p>
                      </div>
                      <Badge color={service.tier === 'critical' ? 'red' : 'slate'} size="sm">
                        {service.tier}
                      </Badge>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge color="blue" size="sm">
                        {service.type}
                      </Badge>
                      {service.team ? <Badge size="sm">{service.team.name}</Badge> : null}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
