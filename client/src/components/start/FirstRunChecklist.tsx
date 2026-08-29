import { CheckIcon } from '@heroicons/react/24/outline';
import { useUI } from '../../store/uiStore';

const STEPS = [
  { label: 'Choose a scenario', shortLabel: 'Scenario' },
  { label: 'Inspect hop groups', shortLabel: 'Hops' },
  { label: 'Review teams to page', shortLabel: 'Teams' },
  { label: 'Copy action plan', shortLabel: 'Plan' },
] as const;

/**
 * FirstRunChecklist — a 4-step progress strip shown on /start and /services.
 * Step index is 0-based in state; step 0 means nothing completed yet.
 * Each completed step is shown with a filled check. The current step pulses.
 */
export function FirstRunChecklist(): JSX.Element {
  const { firstRunStep } = useUI();

  if (firstRunStep >= STEPS.length) {
    // All done — show completion banner
    return (
      <div
        id="first-run-checklist-complete"
        className="flex items-center gap-3 border border-hud-cyan/30 bg-hud-cyan-dim px-4 py-2.5 font-mono text-xs text-hud-cyan animate-fade-in"
      >
        <CheckIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="font-bold uppercase tracking-widest">Demo journey complete</span>
        <span className="text-slate-400">— You've run a full incident simulation.</span>
      </div>
    );
  }

  return (
    <nav
      id="first-run-checklist"
      className="flex items-stretch divide-x divide-hud-border border border-hud-border bg-hud-panel/80 font-mono text-[10px] uppercase tracking-widest"
      aria-label="Demo journey progress"
    >
      {STEPS.map((step, idx) => {
        const isDone = idx < firstRunStep;
        const isCurrent = idx === firstRunStep;

        return (
          <div
            key={step.label}
            className={[
              'flex flex-1 items-center justify-center gap-1.5 px-3 py-2 transition-colors',
              isDone ? 'text-hud-cyan bg-hud-cyan-dim' : '',
              isCurrent ? 'text-slate-300 animate-pulse-slow' : '',
              !isDone && !isCurrent ? 'text-slate-600' : '',
            ].join(' ')}
            aria-current={isCurrent ? 'step' : undefined}
          >
            {isDone ? (
              <CheckIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
            ) : (
              <span
                className={[
                  'inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold',
                  isCurrent ? 'border-slate-400 text-slate-400' : 'border-slate-700 text-slate-700',
                ].join(' ')}
              >
                {idx + 1}
              </span>
            )}
            <span className="hidden sm:inline">{step.label}</span>
            <span className="sm:hidden">{step.shortLabel}</span>
          </div>
        );
      })}
    </nav>
  );
}
