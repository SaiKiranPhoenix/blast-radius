import { useMemo } from 'react';
import type { ServiceSummary } from '../../types/service.types';
import { ServiceCard } from './ServiceCard';
import { ServiceSkeleton } from './ServiceSkeleton';
import { useUI } from '../../store/uiStore';
import { EmptyState } from '../common/EmptyState';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface ServiceGridProps {
  services: ServiceSummary[];
  isLoading: boolean;
}

export function ServiceGrid({ services, isLoading }: ServiceGridProps) {
  const { selectedServiceId, setIsSidebarOpen, setSelectedServiceId } = useUI();

  const groupedServices = useMemo(() => {
    const groups: Record<string, ServiceSummary[]> = {};
    for (const service of services) {
      const teamName = service.team?.name || 'Unassigned';
      if (!groups[teamName]) {
        groups[teamName] = [];
      }
      groups[teamName].push(service);
    }
    
    // Sort groups alphabetically, but put 'Unassigned' last
    return Object.entries(groups).sort(([a], [b]) => {
      if (a === 'Unassigned') return 1;
      if (b === 'Unassigned') return -1;
      return a.localeCompare(b);
    });
  }, [services]);

  const handleServiceClick = (service: ServiceSummary) => {
    setSelectedServiceId(service.id);
    setIsSidebarOpen(false); // Close mobile nav if open
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        {[1, 2].map((group) => (
          <div key={group} className="space-y-4">
            <div className="h-6 w-32 bg-slate-800 rounded animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <ServiceSkeleton key={i} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="mt-12">
        <EmptyState
          icon={MagnifyingGlassIcon}
          title="No services found"
          description="Try adjusting your filters or search query."
        />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {groupedServices.map(([teamName, teamServices]) => (
        <section key={teamName} className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-100">{teamName}</h2>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-medium border border-slate-700/50">
              {teamServices.length}
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {teamServices.map((service) => {
              const isSelected = selectedServiceId === service.id;
              const isDimmed = selectedServiceId !== null && !isSelected;

              return (
                <ServiceCard
                  key={service.id}
                  service={service}
                  isHighlighted={isSelected}
                  onClick={handleServiceClick}
                  className={isDimmed ? 'opacity-40 grayscale-[0.5] hover:opacity-100 hover:grayscale-0' : ''}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
