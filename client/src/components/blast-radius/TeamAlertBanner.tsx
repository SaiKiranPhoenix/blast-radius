import { ExclamationTriangleIcon, MegaphoneIcon } from '@heroicons/react/24/outline';
import type { TeamWithAffectedServices } from '../../types/graph.types';

interface TeamAlertBannerProps {
  teams: TeamWithAffectedServices[];
  isVisible: boolean;
  animationDelay?: number;
}

export function TeamAlertBanner({ teams, isVisible, animationDelay = 0 }: TeamAlertBannerProps) {
  if (teams.length === 0) return null;

  return (
    <div
      className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 sm:p-5"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
        transition: `all 500ms cubic-bezier(0.4, 0, 0.2, 1) ${animationDelay}ms`,
      }}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-red-500/20 rounded-lg shrink-0">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
        </div>
        
        <div className="min-w-0">
          <h3 className="text-red-400 font-semibold text-sm sm:text-base mb-1">
            Teams to Page ({teams.length})
          </h3>
          <p className="text-red-400/70 text-xs sm:text-sm mb-4">
            The following teams own services that are in the blast radius.
          </p>

          <div className="space-y-3">
            {teams.map((teamData) => (
              <div key={teamData.team.id} className="bg-slate-900/50 rounded-lg p-3 border border-red-500/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-200 text-sm">
                    {teamData.team.name}
                  </span>
                  <a
                    href="#" // Placeholder for slack channel link
                    className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <MegaphoneIcon className="w-3.5 h-3.5" />
                    Notify Channel
                  </a>
                </div>
                
                <div className="flex flex-wrap gap-1.5">
                  {teamData.affectedServices.map((svcName) => (
                    <span key={svcName} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs border border-slate-700">
                      {svcName}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
