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
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-hud-border bg-hud-panel/85 px-4 backdrop-blur-xl lg:px-8">
      <button
        type="button"
        className="grid h-10 w-10 place-items-center rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white lg:hidden"
        onClick={() => setIsSidebarOpen(true)}
        aria-label="Open navigation"
      >
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>
      <div className="min-w-0 flex items-center gap-3">
        <div className="h-4 w-1 bg-hud-cyan animate-pulse"></div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-hud-cyan/50">SYS.LINK</p>
          <h2 className="truncate text-sm font-bold tracking-widest text-slate-100 uppercase">{pageTitle}</h2>
        </div>
      </div>
    </header>
  );
}
