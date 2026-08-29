import type { ServiceSummary } from '../../types/service.types';
import { ArrowUpRightIcon, ExclamationTriangleIcon } from '@heroicons/react/20/solid';
import { ServiceTypeBadge, ServiceTierBadge } from '../service/ServiceBadge';
import { Link } from 'react-router-dom';

interface DownstreamListProps {
  services: ServiceSummary[];
}

export function DownstreamList({ services }: DownstreamListProps) {
  const isHighImpact = services.length > 10;

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-700/50 bg-slate-800 flex items-center gap-2">
        <ArrowUpRightIcon className="w-5 h-5 text-amber-400" />
        <h3 className="font-semibold text-slate-200">Downstream Dependents</h3>
        <span className="ml-auto bg-slate-700 text-slate-300 text-xs py-0.5 px-2 rounded-full">
          {services.length}
        </span>
      </div>

      <div className="p-4 flex-1 overflow-y-auto min-h-[200px]">
        {isHighImpact && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-400/90">
              <span className="font-semibold block mb-0.5">High Impact Service</span>
              This service has many dependents. Changes require careful planning and coordination.
            </div>
          </div>
        )}

        {services.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-slate-500">
            No downstream dependents.
          </div>
        ) : (
          <ul className="space-y-3">
            {services.map((service) => (
              <li key={service.id}>
                <Link
                  to={`/services/${service.id}`}
                  className="block p-3 rounded-lg bg-slate-900/50 border border-slate-700/30 hover:border-amber-500/30 hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-slate-200">{service.name}</span>
                    <ServiceTierBadge tier={service.tier} />
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/50">
                    <ServiceTypeBadge type={service.type} />
                    <span className="text-xs text-slate-400">
                      {service.team?.name || 'Unassigned'}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
