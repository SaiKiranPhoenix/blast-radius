import {
  ArrowTopRightOnSquareIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  RectangleGroupIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { NavLink } from 'react-router-dom';
import { useIncidents } from '../../hooks/useIncidents';
import { useUI } from '../../store/uiStore';
import { Badge } from '../common/Badge';

const navItems = [
  { href: '/start', label: 'Start', icon: PlayIcon },
  { href: '/services', label: 'Service Map', icon: RectangleGroupIcon },
  { href: '/teams', label: 'Teams', icon: UserGroupIcon },
  { href: '/incidents', label: 'Incidents', icon: ExclamationTriangleIcon },
];

export function Sidebar(): JSX.Element {
  const { setIsSidebarOpen } = useUI();
  const { data: incidents = [] } = useIncidents({ status: 'active' });
  const activeIncidentCount = incidents.length;

  return (
    <aside className="flex h-full w-72 flex-col border-r border-hud-border bg-hud-panel/95 px-4 py-5 shadow-panel backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 px-2">
        <NavLink
          to="/start"
          className="flex min-w-0 items-center gap-3"
          onClick={() => setIsSidebarOpen(false)}
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-sm border border-hud-cyan-dim bg-hud-cyan-dim text-hud-cyan shadow-hud-glow-cyan relative overflow-hidden">
            <BoltIcon className="h-5 w-5 relative z-10" aria-hidden="true" />
            <div className="absolute inset-0 bg-hud-cyan/10 animate-pulse-slow"></div>
          </span>
          <span className="min-w-0">
            <span className="block truncate text-lg font-bold tracking-widest text-hud-cyan uppercase">
              BlastRadius
            </span>
            <span className="block truncate text-[10px] uppercase tracking-widest text-slate-500">
              Global Assessment
            </span>
          </span>
        </NavLink>
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close navigation"
        >
          <XMarkIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/start' || item.href === '/services'}
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) =>
              [
                'group flex items-center gap-3 rounded-none border-l-2 px-3 py-2.5 text-xs font-semibold uppercase tracking-widest transition-all duration-200',
                isActive
                  ? 'border-hud-cyan bg-hud-cyan-dim text-hud-cyan shadow-[inset_10px_0_20px_-10px_rgba(34,211,238,0.3)]'
                  : 'border-transparent text-slate-500 hover:border-slate-700 hover:bg-slate-900/50 hover:text-slate-300',
              ].join(' ')
            }
          >
            <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="flex-1">{item.label}</span>
            {item.href === '/incidents' && activeIncidentCount > 0 ? (
              <Badge color="amber" size="sm" dot dotAnimate>
                {activeIncidentCount}
              </Badge>
            ) : null}
          </NavLink>
        ))}
      </nav>

      <a
        href="https://github.com/SaiKiranPhoenix/blast-radius"
        target="_blank"
        rel="noreferrer"
        className="mt-6 flex items-center gap-2 rounded-sm border border-hud-border px-3 py-2 text-xs uppercase tracking-widest text-slate-500 transition hover:border-slate-600 hover:bg-slate-900 hover:text-slate-300"
      >
        <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden="true" />
        <span className="truncate">GitHub</span>
      </a>
    </aside>
  );
}
