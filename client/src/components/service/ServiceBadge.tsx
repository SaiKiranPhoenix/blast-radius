import {
  CircleStackIcon,
  CloudIcon,
  CogIcon,
  ServerIcon,
  QueueListIcon,
  ArrowRightEndOnRectangleIcon,
} from '@heroicons/react/16/solid';
import type { ServiceType, ServiceTier } from '../../types/service.types';
import { Badge } from '../common/Badge';

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

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border
      ${config.color === 'blue' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : ''}
      ${config.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}
      ${config.color === 'purple' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : ''}
      ${config.color === 'cyan' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : ''}
      ${config.color === 'amber' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : ''}
      ${config.color === 'slate' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' : ''}
    `}>
      <Icon className="w-3.5 h-3.5 opacity-80" />
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
      return <Badge color="red" size="sm" dot>Tier 1 (Critical)</Badge>;
    case 'high':
      return <Badge color="amber" size="sm" dot>Tier 2 (High)</Badge>;
    case 'medium':
      return <Badge color="blue" size="sm">Tier 3 (Medium)</Badge>;
    case 'low':
      return <Badge color="slate" size="sm">Tier 4 (Low)</Badge>;
    default:
      return <Badge color="slate" size="sm">{tier}</Badge>;
  }
}
