import { Bars3Icon, ArrowRightOnRectangleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useMemo, useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useUI } from '../../store/uiStore';
import { useAuth } from '../../store/authStore';

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
  const navigate = useNavigate();
  const { setIsSidebarOpen } = useUI();
  const { state, user, workspace, role, logout } = useAuth();
  const pageTitle = useMemo(() => titleFromPath(location.pathname), [location.pathname]);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

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
      <div className="min-w-0 flex flex-1 items-center gap-3">
        <div className="h-4 w-1 bg-hud-cyan animate-pulse"></div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-hud-cyan/50">
            SYS.LINK
          </p>
          <h2 className="truncate text-sm font-bold tracking-widest text-slate-100 uppercase">
            {pageTitle}
          </h2>
        </div>
      </div>

      {state !== 'unauthenticated' && user && workspace && (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-hud-cyan/30 bg-slate-800 text-xs font-medium text-hud-cyan transition-colors hover:bg-slate-700 hover:border-hud-cyan focus:outline-none"
          >
            {getInitials(user.name)}
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-md border border-hud-border bg-slate-900 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="border-b border-hud-border px-4 py-3">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="truncate text-xs text-slate-400">{user.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center rounded bg-hud-cyan/10 px-2 py-0.5 text-[10px] font-medium text-hud-cyan">
                    {workspace.name}
                  </span>
                  <span className="inline-flex items-center rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300 capitalize border border-slate-700">
                    {role}
                  </span>
                </div>
              </div>
              <div className="py-1">
                <Link
                  to="/settings/workspace"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <Cog6ToothIcon className="mr-3 h-4 w-4 text-slate-400" aria-hidden="true" />
                  Workspace Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white text-left"
                >
                  <ArrowRightOnRectangleIcon
                    className="mr-3 h-4 w-4 text-slate-400"
                    aria-hidden="true"
                  />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
