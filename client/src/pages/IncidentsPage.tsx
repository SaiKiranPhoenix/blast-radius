import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { PageHeader } from '../components/common/PageHeader';
import { Spinner } from '../components/common/Spinner';
import { useIncidents } from '../hooks/useIncidents';

export function IncidentsPage(): JSX.Element {
  const incidentsQuery = useIncidents();
  const incidents = incidentsQuery.data ?? [];

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader title="Incidents" subtitle="Current and historical failures ordered from newest to oldest." />
      <div className="mt-6">
        {incidentsQuery.isLoading ? (
          <Spinner label="Loading incidents" />
        ) : incidentsQuery.isError ? (
          <ErrorState description="Incident data could not be loaded from the API." title="Incidents unavailable" />
        ) : incidents.length === 0 ? (
          <EmptyState icon={ExclamationTriangleIcon} title="No incidents yet" description="Seeded incidents will appear here." />
        ) : (
          <div className="space-y-3">
            {incidents.map((incident) => (
              <Card key={incident.id} interactive className="p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-white">{incident.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-400">{incident.description}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Badge color={incident.severity === 'SEV1' ? 'red' : 'amber'}>{incident.severity}</Badge>
                    <Badge color={incident.status === 'active' ? 'red' : 'slate'} dot={incident.status === 'active'} dotAnimate>
                      {incident.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
