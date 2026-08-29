import type { PropsWithChildren } from 'react';
import { useAuth } from '../../store/authStore';
import type { UserRole } from '../../types/auth.types';

interface RoleGateProps extends PropsWithChildren {
  /** Roles allowed to see children. If the current role is not in this list, children are hidden. */
  allow: UserRole[];
  /** Optional fallback rendered instead of null when role is not allowed. */
  fallback?: React.ReactNode;
}

/**
 * Hides children for roles not in the allow list.
 *
 * Usage:
 * ```tsx
 * <RoleGate allow={['owner', 'responder']}>
 *   <CreateSimulationButton />
 * </RoleGate>
 * ```
 */
export function RoleGate({ allow, fallback = null, children }: RoleGateProps): JSX.Element {
  const { role } = useAuth();

  if (!role || !allow.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
