import { Badge } from '../common/Badge';
import type { IncidentSeverity, IncidentStatus } from '../../types/incident.types';

interface SeverityBadgeProps {
  severity: IncidentSeverity;
  size?: 'sm' | 'md';
}

export function SeverityBadge({ severity, size = 'sm' }: SeverityBadgeProps): JSX.Element {
  const colorMap: Record<IncidentSeverity, 'red' | 'amber' | 'slate'> = {
    SEV1: 'red',
    SEV2: 'amber',
    SEV3: 'slate',
  };

  return (
    <Badge color={colorMap[severity]} size={size}>
      {severity}
    </Badge>
  );
}

interface StatusBadgeProps {
  status: IncidentStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps): JSX.Element {
  const colorMap: Record<IncidentStatus, 'red' | 'emerald' | 'amber'> = {
    active: 'red',
    monitoring: 'amber',
    resolved: 'emerald',
  };

  return (
    <Badge 
      color={colorMap[status]} 
      size={size} 
      dot={status === 'active'} 
      dotAnimate={status === 'active'}
    >
      {status}
    </Badge>
  );
}
