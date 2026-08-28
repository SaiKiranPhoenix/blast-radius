import { Outlet } from 'react-router-dom';
import { useUI } from '../../store/uiStore';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function AppShell(): JSX.Element {
  const { isSidebarOpen, setIsSidebarOpen } = useUI();

  return (
    <div className="min-h-screen bg-hud-black text-slate-300 font-mono">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block">
        <Sidebar />
      </div>

      {isSidebarOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-hud-black/80 backdrop-blur-sm"
            aria-label="Close navigation"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="relative h-full animate-slide-in-left">
            <Sidebar />
          </div>
        </div>
      ) : null}

      <div className="lg:pl-72">
        <TopBar />
        <main className="min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
