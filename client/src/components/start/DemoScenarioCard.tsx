import { useNavigate } from 'react-router-dom';
import { useUI } from '../../store/uiStore';
import type { DemoScenario } from '../../data/demoScenarios';

const severityConfig = {
  SEV1: {
    label: 'SEV1',
    barColor: 'bg-hud-red',
    textColor: 'text-hud-red',
    borderColor: 'border-hud-red/30',
    glowClass: 'shadow-hud-glow-red',
    bgDim: 'bg-hud-red-dim',
    badgeBg: 'bg-hud-red/10',
  },
  SEV2: {
    label: 'SEV2',
    barColor: 'bg-amber-400',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-400/30',
    glowClass: 'shadow-[0_0_15px_rgba(251,191,36,0.3)]',
    bgDim: 'bg-amber-400/10',
    badgeBg: 'bg-amber-400/10',
  },
  SEV3: {
    label: 'SEV3',
    barColor: 'bg-blue-400',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-400/30',
    glowClass: 'shadow-[0_0_15px_rgba(96,165,250,0.3)]',
    bgDim: 'bg-blue-400/10',
    badgeBg: 'bg-blue-400/10',
  },
} as const;

const domainLabels: Record<string, string> = {
  auth: 'Identity & Auth',
  payments: 'Payments & Checkout',
  data: 'Data & Storage',
  messaging: 'Messaging & Events',
  delivery: 'Delivery & Gateway',
};

interface DemoScenarioCardProps {
  scenario: DemoScenario;
  index: number;
  onStart: (scenario: DemoScenario) => void;
}

export function DemoScenarioCard({ scenario, index, onStart }: DemoScenarioCardProps): JSX.Element {
  const cfg = severityConfig[scenario.severity];

  return (
    <article
      id={`scenario-card-${scenario.id}`}
      className={`
        group relative flex flex-col rounded-none border ${cfg.borderColor}
        bg-hud-panel/80 backdrop-blur-sm cursor-pointer
        hover:border-opacity-70 hover:bg-hud-panel
        transition-all duration-300 overflow-hidden
        animate-fade-in-up
      `}
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
      onClick={() => onStart(scenario)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onStart(scenario)}
      aria-label={`Start scenario: ${scenario.title}`}
    >
      {/* Left severity bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${cfg.barColor}`} />

      {/* Card body */}
      <div className="flex flex-col gap-3 p-4 pl-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">
              {domainLabels[scenario.domain] ?? scenario.domain}
            </p>
            <h3 className="font-mono font-bold text-slate-100 text-sm leading-snug group-hover:text-white transition-colors">
              {scenario.title}
            </h3>
          </div>
          <span
            className={`shrink-0 rounded-none px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest ${cfg.textColor} ${cfg.badgeBg} border ${cfg.borderColor}`}
          >
            {cfg.label}
          </span>
        </div>

        {/* Symptom */}
        <p className="text-xs leading-relaxed text-slate-400 font-mono">
          <span className="text-slate-600">&gt;&nbsp;</span>
          {scenario.promptCopy}
        </p>

        {/* Business impact */}
        <p className="text-xs text-slate-500 leading-relaxed border-t border-hud-border pt-3">
          {scenario.businessImpact}
        </p>
      </div>

      {/* CTA footer */}
      <div
        className={`mt-auto flex items-center gap-2 border-t ${cfg.borderColor} px-5 py-2.5 ${cfg.bgDim}
          text-[10px] font-mono font-bold uppercase tracking-widest ${cfg.textColor}
          transition-all duration-200 group-hover:pl-7`}
      >
        <span className="opacity-70">&gt;</span>
        <span>Start simulation</span>
        <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">→</span>
      </div>
    </article>
  );
}

/** Hook that wires DemoScenarioCard → service selection → navigation */
export function useStartScenario(): (scenario: DemoScenario) => void {
  const navigate = useNavigate();
  const { setSelectedServiceId, setFirstRunStep } = useUI();

  return (scenario: DemoScenario) => {
    setSelectedServiceId(scenario.startingServiceId);
    setFirstRunStep(1); // mark "choose scenario" complete
    void navigate('/services');
  };
}
