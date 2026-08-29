import type { ServiceSummary } from '../../types/service.types';
import { ServiceTypeBadge, ServiceTierBadge } from './ServiceBadge';
import { ArrowDownRightIcon, ArrowUpRightIcon } from '@heroicons/react/20/solid';
import { Card } from '../common/Card';

interface ServiceCardProps {
  service: ServiceSummary;
  variant?: 'default' | 'compact' | 'affected';
  isHighlighted?: boolean;
  animationDelay?: number;
  onClick?: (service: ServiceSummary) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function ServiceCard({
  service,
  variant = 'default',
  isHighlighted = false,
  animationDelay,
  onClick,
  className = '',
  style = {},
}: ServiceCardProps) {
  const isCompact = variant === 'compact' || variant === 'affected';

  const baseStyle: React.CSSProperties = {
    ...style,
    ...(animationDelay !== undefined ? { transitionDelay: `${animationDelay}ms` } : {}),
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(service);
    }
  };

  return (
    <Card
      className={`
        flex flex-col gap-3 relative overflow-hidden transition-all duration-300 font-mono
        rounded-sm border-hud-border bg-hud-panel hover:border-hud-cyan/50
        ${isHighlighted ? 'border-hud-red bg-hud-red-dim shadow-hud-glow-red' : ''}
        ${variant === 'affected' ? 'animate-fade-in-up fill-mode-both shadow-md border-hud-cyan bg-hud-cyan-dim' : ''}
        ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''}
        ${isCompact ? 'p-3' : 'p-4'}
        ${className}
      `}
      style={baseStyle}
      onClick={() => onClick?.(service)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3
            className={`font-bold text-slate-100 truncate uppercase tracking-wider ${isCompact ? 'text-xs' : 'text-sm'}`}
          >
            {service.name}
          </h3>
          <p className="text-[10px] text-hud-cyan/80 uppercase truncate mt-1">
            OWNER: {service.team?.name || 'UNASSIGNED'}
          </p>
        </div>
        {!isCompact && (
          <div className="shrink-0 flex items-center gap-1.5">
            <ServiceTierBadge tier={service.tier} />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-700/50">
        <ServiceTypeBadge type={service.type} />

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1" title="Upstream Dependencies">
            <ArrowDownRightIcon className="w-3.5 h-3.5 text-emerald-400/70" />
            <span>{service.dependencyCount}</span>
          </div>
          <div className="flex items-center gap-1" title="Downstream Dependents">
            <ArrowUpRightIcon className="w-3.5 h-3.5 text-amber-400/70" />
            <span>{service.dependentCount}</span>
          </div>
        </div>
      </div>

      {/* Decorative gradient for highlighted cards */}
      {isHighlighted && (
        <div className="absolute inset-0 bg-hud-red-dim pointer-events-none animate-pulse-slow border border-hud-red" />
      )}
    </Card>
  );
}
