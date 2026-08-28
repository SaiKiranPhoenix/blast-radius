import {
  ArrowTopRightOnSquareIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  RectangleGroupIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { NavLink } from 'react-router-dom';
import { useIncidents } from '../../hooks/useIncidents';
import { useUI } from '../../store/uiStore';
import { Badge } from '../common/Badge';

const navItems = [
  { href: '/', label: 'Service Map', icon: RectangleGroupIcon },
  { href: '/teams', label: 'Teams', icon: UserGroupIcon },
  { href: '/incidents', label: 'Incidents', icon: ExclamationTriangleIcon },
];

export function Sidebar(): JSX.Element {
  const { setIsSidebarOpen } = useUI();
  const { data: incidents = [] } = useIncidents({ status: 'active' });
  const activeIncidentCount = incidents.length;

  return (
    <aside className="flex h-full w-72 flex-col border-r border-slate-800 bg-slate-950/95 px-4 py-5 shadow-panel backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 px-2">
        <NavLink
          to="/"
          className="flex min-w-0 items-center gap-3"
          onClick={() => setIsSidebarOpen(false)}
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-blue-400/35 bg-blue-500/15 text-blue-100">
            <BoltIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-semibold text-white">BlastRadius</span>
            <span className="block truncate text-xs text-slate-500">Incident impact explorer</span>
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
            end={item.href === '/'}
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) =>
              [
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'bg-slate-800 text-white shadow-card'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100',
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
        className="mt-6 flex items-center gap-2 rounded-lg border border-slate-800 px-3 py-2 text-sm text-slate-400 transition hover:border-slate-700 hover:bg-slate-900 hover:text-white"
      >
        <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden="true" />
        <span className="truncate">GitHub</span>
      </a>
    </aside>
  );
}
