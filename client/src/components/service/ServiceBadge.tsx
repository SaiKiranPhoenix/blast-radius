import {
  CircleStackIcon,
  CloudIcon,
  CogIcon,
  ServerIcon,
  QueueListIcon,
  ArrowRightEndOnRectangleIcon,
} from '@heroicons/react/16/solid';
import type { ServiceType, ServiceTier } from '../../types/service.types';

interface TypeBadgeProps {
  type: ServiceType;
}

const TYPE_CONFIG: Record<ServiceType, { label: string; icon: React.ElementType; color: 'blue' | 'emerald' | 'purple' | 'cyan' | 'amber' | 'slate' }> = {
  api: { label: 'API', icon: CloudIcon, color: 'blue' },
  worker: { label: 'Worker', icon: CogIcon, color: 'emerald' },
  database: { label: 'Database', icon: CircleStackIcon, color: 'purple' },
  cache: { label: 'Cache', icon: ServerIcon, color: 'cyan' },
  queue: { label: 'Queue', icon: QueueListIcon, color: 'amber' },
  gateway: { label: 'Gateway', icon: ArrowRightEndOnRectangleIcon, color: 'slate' },
};

export function ServiceTypeBadge({ type }: TypeBadgeProps) {
  const config = TYPE_CONFIG[type] || { label: type, icon: CloudIcon, color: 'slate' };
  const Icon = config.icon;

  const styles = {
    bg: config.color === 'blue' ? 'bg-blue-500/10' : config.color === 'emerald' ? 'bg-emerald-500/10' : config.color === 'purple' ? 'bg-purple-500/10' : config.color === 'cyan' ? 'bg-cyan-500/10' : config.color === 'amber' ? 'bg-amber-500/10' : 'bg-slate-500/10',
    text: config.color === 'blue' ? 'text-blue-400' : config.color === 'emerald' ? 'text-emerald-400' : config.color === 'purple' ? 'text-purple-400' : config.color === 'cyan' ? 'text-cyan-400' : config.color === 'amber' ? 'text-amber-400' : 'text-slate-400',
    border: config.color === 'blue' ? 'border-blue-500/20' : config.color === 'emerald' ? 'border-emerald-500/20' : config.color === 'purple' ? 'border-purple-500/20' : config.color === 'cyan' ? 'border-cyan-500/20' : config.color === 'amber' ? 'border-amber-500/20' : 'border-slate-500/20',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest ${styles.bg} ${styles.text} ${styles.border}`}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {config.label}
    </div>
  );
}

interface TierBadgeProps {
  tier: ServiceTier;
}

export function ServiceTierBadge({ tier }: TierBadgeProps) {
  switch (tier) {
    case 'critical':
      return <div className="inline-flex items-center gap-1.5 rounded-sm border border-hud-red bg-hud-red-dim px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest text-hud-red shadow-hud-glow-red"><span className="h-1.5 w-1.5 rounded-full bg-hud-red animate-pulse-glow" />T1_CRITICAL</div>;
    case 'high':
      return <div className="inline-flex items-center gap-1.5 rounded-sm border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" />T2_HIGH</div>;
    case 'medium':
      return <div className="inline-flex items-center gap-1.5 rounded-sm border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest text-blue-400"><span className="h-1.5 w-1.5 rounded-full bg-blue-400" />T3_MED</div>;
    case 'low':
      return <div className="inline-flex items-center gap-1.5 rounded-sm border border-slate-500/20 bg-slate-500/10 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400"><span className="h-1.5 w-1.5 rounded-full bg-slate-400" />T4_LOW</div>;
    default:
      return <div className="inline-flex items-center gap-1.5 rounded-sm border border-slate-500/20 bg-slate-500/10 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">{tier}</div>;
  }
}
