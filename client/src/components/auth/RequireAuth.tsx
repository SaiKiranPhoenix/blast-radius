import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import { Spinner } from '../common/Spinner';

/**
 * Route guard — wraps routes that require an active session.
 *
 * - Loading  → full-screen spinner (session probe in flight)
 * - Unauthenticated → redirect to /login
 * - Demo / Authenticated → render children via <Outlet />
 */
export function RequireAuth(): JSX.Element {
  const { state } = useAuth();

  if (state === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-hud-bg">
        <div className="flex flex-col items-center gap-4">
          <Spinner />
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
            Restoring session...
          </p>
        </div>
      </div>
    );
  }

  if (state === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
