import { Bars3Icon } from '@heroicons/react/24/outline';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useUI } from '../../store/uiStore';

const routeTitles: Record<string, string> = {
  '/': 'Service Map',
  '/teams': 'Teams',
  '/incidents': 'Incidents',
};

function titleFromPath(pathname: string): string {
  if (routeTitles[pathname]) return routeTitles[pathname];
  if (pathname.startsWith('/services/')) return 'Service Detail';
  if (pathname.startsWith('/teams/')) return 'Team Detail';
  if (pathname.startsWith('/incidents/')) return 'Incident Detail';
  return 'BlastRadius';
}

export function TopBar(): JSX.Element {
  const location = useLocation();
  const { setIsSidebarOpen } = useUI();
  const pageTitle = useMemo(() => titleFromPath(location.pathname), [location.pathname]);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-800/80 bg-slate-950/85 px-4 backdrop-blur-xl lg:px-8">
      <button
        type="button"
        className="grid h-10 w-10 place-items-center rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white lg:hidden"
        onClick={() => setIsSidebarOpen(true)}
        aria-label="Open navigation"
      >
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">BlastRadius</p>
        <h2 className="truncate text-base font-semibold text-white">{pageTitle}</h2>
      </div>
    </header>
  );
}
