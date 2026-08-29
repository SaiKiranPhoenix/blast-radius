/**
 * WhyThisMatters.tsx
 *
 * A short, jargon-free incident example for evaluators and non-technical
 * reviewers who need to understand why dependency mapping matters before they
 * dive into the service graph.
 */

export function WhyThisMatters(): JSX.Element {
  return (
    <section
      id="why-this-matters"
      className="border border-hud-border bg-hud-panel/60 p-6 animate-fade-in-up"
      style={{ animationDelay: '400ms', animationFillMode: 'both' }}
      aria-label="Why dependency mapping matters"
    >
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-hud-border" />
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
          Why this matters
        </p>
        <div className="h-px flex-1 bg-hud-border" />
      </div>

      {/* Real-world example */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Before */}
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-hud-red">
            Without BlastRadius
          </p>
          <div className="border-l-2 border-hud-red/40 pl-4">
            <p className="text-sm leading-relaxed text-slate-300">
              Payments API is slow. Your team spends{' '}
              <strong className="text-white">47 minutes</strong> in a bridge call asking: which team
              owns the upstream dependency? Is the database involved? Who should we page? By the
              time you have answers, customers have already complained on social media.
            </p>
          </div>
        </div>

        {/* After */}
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-hud-cyan">
            With BlastRadius
          </p>
          <div className="border-l-2 border-hud-cyan/40 pl-4">
            <p className="text-sm leading-relaxed text-slate-300">
              You select "Payments API" and in{' '}
              <strong className="text-white">under 30 seconds</strong> you see: 12 downstream
              services affected, 3 teams to page, and a ready-to-paste incident update. The bridge
              call starts with a plan, not questions.
            </p>
          </div>
        </div>
      </div>

      {/* Stat strip */}
      <div className="mt-6 grid grid-cols-3 divide-x divide-hud-border border border-hud-border">
        {[
          { value: '40', label: 'Live services in demo graph' },
          { value: '84+', label: 'Dependency edges mapped' },
          { value: '<30s', label: 'Time to first action plan' },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-1 px-4 py-3 text-center">
            <span className="font-mono text-xl font-bold text-hud-cyan">{stat.value}</span>
            <span className="font-mono text-[10px] uppercase tracking-wide text-slate-500">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
