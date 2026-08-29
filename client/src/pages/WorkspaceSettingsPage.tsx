import { useAuth } from '../store/authStore';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/common/Card';
import { RoleGate } from '../components/auth/RoleGate';
import { Cog6ToothIcon, ShieldCheckIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export function WorkspaceSettingsPage(): JSX.Element {
  const { workspace, role } = useAuth();

  if (!workspace) return <></>;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Workspace Settings"
        subtitle={`Manage settings and preferences for ${workspace.name}`}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Workspace Info */}
        <Card className="flex flex-col gap-6 p-6">
          <div className="flex items-center gap-3 border-b border-hud-border pb-4">
            <div className="rounded bg-slate-800 p-2">
              <Cog6ToothIcon className="h-5 w-5 text-hud-cyan" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-200">General</h3>
              <p className="text-xs text-slate-500">Core workspace information</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                Workspace Name
              </label>
              <div className="mt-1 text-sm text-slate-300">{workspace.name}</div>
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                URL Slug
              </label>
              <div className="mt-1 text-sm font-mono text-slate-400">{workspace.slug}</div>
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                Your Role
              </label>
              <div className="mt-1">
                <span className="inline-flex items-center gap-1.5 rounded bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300">
                  <ShieldCheckIcon className="h-3.5 w-3.5 text-hud-cyan" />
                  <span className="capitalize">{role}</span>
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Incident Preferences */}
        <Card className="flex flex-col gap-6 p-6">
          <div className="flex items-center gap-3 border-b border-hud-border pb-4">
            <div className="rounded bg-slate-800 p-2">
              <ShieldExclamationIcon className="h-5 w-5 text-hud-cyan" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-200">Incident Defaults</h3>
              <p className="text-xs text-slate-500">Default settings for new triage runs</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                Default Severity
              </label>
              <div className="mt-1 text-sm text-slate-300">
                <span className="inline-flex rounded border border-hud-border bg-slate-900/50 px-2 py-0.5 font-mono text-xs text-orange-400">
                  {workspace.defaultSeverity}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Applied to new simulated incidents unless overridden.
              </p>
            </div>
          </div>
        </Card>

        {/* Member Access (stub) */}
        <Card className="flex flex-col gap-6 p-6 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-hud-border pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded bg-slate-800 p-2">
                <UserGroupIcon className="h-5 w-5 text-hud-cyan" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-200">Members & Access</h3>
                <p className="text-xs text-slate-500">Manage who has access to this workspace</p>
              </div>
            </div>

            <RoleGate allow={['owner']}>
              <button className="rounded border border-hud-border bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white">
                Invite Member
              </button>
            </RoleGate>
          </div>

          <div className="rounded border border-hud-border bg-slate-900/50 p-8 text-center">
            <p className="text-sm text-slate-400">
              Member management is available in the full version of BlastRadius.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Needed icon import
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';
