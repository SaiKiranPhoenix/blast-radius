import type { ServiceSummary } from '../../types/service.types';
import { ServiceCard } from '../service/ServiceCard';

interface AffectedServiceCardProps {
  service: ServiceSummary;
  isVisible: boolean;
  animationDelay: number;
}

export function AffectedServiceCard({ service, isVisible, animationDelay }: AffectedServiceCardProps) {
  return (
    <ServiceCard
      service={service}
      variant="compact"
      className="w-full shrink-0 sm:w-[280px] shadow-lg border-red-900/30 bg-slate-800/90"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
        transition: `all 400ms cubic-bezier(0.4, 0, 0.2, 1) ${animationDelay}ms`,
      }}
    />
  );
}
