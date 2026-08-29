import { BoltIcon, UserGroupIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface Outcome {
  icon: typeof BoltIcon;
  title: string;
  description: string;
}

const outcomes: Outcome[] = [
  {
    icon: BoltIcon,
    title: 'See what breaks',
    description:
      'Hop-by-hop blast radius shows every downstream service that is affected, sorted by how far the failure travels.',
  },
  {
    icon: UserGroupIcon,
    title: 'Know who to page',
    description:
      'Immediately surfaces the on-call teams and Slack channels for every affected service — no manual lookup needed.',
  },
  {
    icon: DocumentTextIcon,
    title: 'Get the response plan',
    description:
      'A plain-language action plan is ready to copy into your incident channel within seconds of choosing the failing service.',
  },
];

export function ProductOutcomePanel(): JSX.Element {
  return (
    <section
      id="product-outcome-panel"
      className="grid gap-px border border-hud-border bg-hud-border sm:grid-cols-3"
      aria-label="What BlastRadius does"
    >
      {outcomes.map((outcome, idx) => (
        <div
          key={outcome.title}
          className="flex flex-col gap-3 bg-hud-panel p-5 animate-fade-in-up"
          style={{ animationDelay: `${120 + idx * 80}ms`, animationFillMode: 'both' }}
        >
          <div className="flex h-9 w-9 items-center justify-center border border-hud-cyan/20 bg-hud-cyan-dim text-hud-cyan">
            <outcome.icon className="h-4 w-4" aria-hidden="true" />
          </div>
          <h3 className="font-mono text-sm font-bold text-slate-100">{outcome.title}</h3>
          <p className="text-xs leading-relaxed text-slate-400">{outcome.description}</p>
        </div>
      ))}
    </section>
  );
}
