import { useState, useEffect } from 'react';
import { useBlastRadius } from '../../hooks/useServices';
import { HopGroup } from './HopGroup';
import { TeamAlertBanner } from './TeamAlertBanner';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Spinner } from '../common/Spinner';
import { ErrorState } from '../common/ErrorState';

/** Contextual phrases that cycle while the blast radius query is running. */
const LOADING_PHRASES = [
  'Reading dependency graph...',
  'Finding owners...',
  'Preparing plan...',
] as const;

/** Cycles through LOADING_PHRASES every 900 ms while a query is in-flight. */
function LoadingPhrase(): JSX.Element {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx((prev) => (prev + 1) % LOADING_PHRASES.length);
    }, 900);
    return () => clearInterval(timer);
  }, []);

  return (
    <p className="animate-fade-in text-[10px] font-mono uppercase tracking-widest text-slate-500 transition-all">
      {LOADING_PHRASES[idx]}
    </p>
  );
}

interface BlastRadiusPanelProps {
  serviceId: string | null;
  onClose: () => void;
  // If true, the panel takes up standard layout space (e.g. ServiceDetailPage)
  // If false, it acts as a slide-in overlay (e.g. ServiceMapPage)
  inline?: boolean;
}

const HOP_REVEAL_DELAY_MS = 700;

export function BlastRadiusPanel({
  serviceId,
  onClose,
  inline = false,
}: BlastRadiusPanelProps): JSX.Element | null {
  const { data, isLoading, error, refetch } = useBlastRadius(serviceId || undefined);
  const [revealedHops, setRevealedHops] = useState(0);

  const isOpen = serviceId !== null;

  // Animation logic: sequentially reveal hops
  useEffect(() => {
    if (!data || !isOpen) {
      setRevealedHops(0);
      return;
    }

    const totalHops = data.hops?.length || 0;
    if (revealedHops < totalHops) {
      const timer = setTimeout(() => {
        setRevealedHops((prev) => prev + 1);
      }, HOP_REVEAL_DELAY_MS);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [data, isOpen, revealedHops]);

  // Reset animation when service changes
  useEffect(() => {
    setRevealedHops(0);
  }, [serviceId]);

  const panelContent = (
    <div className="h-full flex flex-col bg-hud-black bg-radar border-l-2 border-hud-cyan shadow-[inset_20px_0_40px_-20px_rgba(34,211,238,0.15),0_0_50px_-12px_rgba(34,211,238,0.25)] relative font-mono">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-hud-border bg-hud-panel/80 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-hud-cyan to-transparent"></div>
        <div className="relative z-10">
          <h2 className="text-xl font-bold text-hud-cyan uppercase tracking-widest animate-pulse-slow">
            Blast Radius
          </h2>
          {data && (
            <p className="text-xs text-hud-red mt-1 font-bold tracking-widest">
              &gt; {data.totalAffected} NODE{data.totalAffected !== 1 ? 'S' : ''} COMPROMISED
            </p>
          )}
        </div>
        {!inline && (
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-hud-cyan/50 hover:text-hud-cyan hover:bg-hud-cyan/10 rounded-sm transition-colors relative z-10"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8">
        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <Spinner />
            <LoadingPhrase />
          </div>
        )}

        {error && (
          <ErrorState
            title="Failed to load blast radius"
            description="We encountered an issue simulating the impact graph."
            action={
              <button
                type="button"
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400"
                onClick={() => void refetch()}
              >
                Try again
              </button>
            }
          />
        )}

        {data && (!data.hops || data.hops.length === 0) && (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-400">No downstream dependents found.</p>
            <p className="mt-2 text-xs text-slate-600">
              This service has no services that depend on it — it sits at the edge of the graph.
            </p>
          </div>
        )}

        {data && data.hops?.length > 0 && (
          <>
            <div className="space-y-8">
              {data.hops.map((hopData, idx) => (
                <HopGroup key={hopData.hop} hopData={hopData} isVisible={idx < revealedHops} />
              ))}
            </div>

            <TeamAlertBanner
              teams={data.teamsToPage || []}
              isVisible={revealedHops >= (data.hops?.length || 0)}
              animationDelay={400}
            />

            {/* Historical Incidents (Optional extension) */}
            {revealedHops >= (data.hops?.length || 0) &&
              (data.historicalIncidents?.length || 0) > 0 && (
                <div
                  className="mt-8 pt-8 border-t border-slate-800 animate-fade-in-up"
                  style={{ animationDelay: '600ms', animationFillMode: 'both' }}
                >
                  <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">
                    Related Historical Incidents
                  </h3>
                  <div className="space-y-3">
                    {data.historicalIncidents?.map((incident) => (
                      <div
                        key={incident.id}
                        className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
                      >
                        <div className="text-sm font-medium text-slate-200">{incident.title}</div>
                        <div className="text-xs text-slate-400 mt-1">
                          {new Date(incident.started_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );

  if (inline) {
    return panelContent;
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-hud-black/60 backdrop-blur-sm z-40 transition-opacity lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Slide-in Panel */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full max-w-md z-50 transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {panelContent}
      </div>
    </>
  );
}
