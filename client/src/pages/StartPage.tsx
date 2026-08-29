import { Link } from 'react-router-dom';
import { BoltIcon, MapIcon } from '@heroicons/react/24/outline';
import { demoScenarios } from '../data/demoScenarios';
import { DemoScenarioCard, useStartScenario } from '../components/start/DemoScenarioCard';
import { ProductOutcomePanel } from '../components/start/ProductOutcomePanel';
import { WhyThisMatters } from '../components/start/WhyThisMatters';
import { FirstRunChecklist } from '../components/start/FirstRunChecklist';

export function StartPage(): JSX.Element {
  const startScenario = useStartScenario();

  return (
    <div className="min-h-screen bg-hud-black bg-tactical-grid font-mono text-slate-300">
      {/* ─── Top bar ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-hud-border bg-hud-black/90 px-4 py-3 backdrop-blur-xl sm:px-8">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center border border-hud-cyan/40 bg-hud-cyan-dim text-hud-cyan shadow-hud-glow-cyan">
            <BoltIcon className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-sm font-bold uppercase tracking-widest text-hud-cyan">
            BlastRadius
          </span>
          <span className="hidden text-[10px] uppercase tracking-widest text-slate-600 sm:inline">
            // Demo workspace
          </span>
        </div>

        <nav className="flex items-center gap-4" aria-label="Top navigation">
          <Link
            to="/services"
            id="skip-to-service-map"
            className="text-[10px] uppercase tracking-widest text-slate-500 underline-offset-4 hover:text-slate-300 hover:underline transition-colors"
          >
            Skip to service map →
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-8 sm:py-16">
        {/* ─── Hero ─────────────────────────────────────────────────── */}
        <section
          id="start-hero"
          className="mb-10 animate-fade-in-up"
          aria-labelledby="hero-heading"
        >
          <p className="mb-3 text-[10px] uppercase tracking-widest text-slate-500">
            &gt; Continue with demo workspace — no login required
          </p>
          <h1
            id="hero-heading"
            className="mb-4 max-w-3xl text-3xl font-bold uppercase leading-tight tracking-tight text-hud-cyan sm:text-4xl"
          >
            What happens if this service fails?
          </h1>
          <p className="mb-8 max-w-2xl text-sm leading-relaxed text-slate-400">
            BlastRadius answers the one question every on-call engineer has during an incident:
            which services break, which teams do we page, and what do we do first?
          </p>

          {/* Primary CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="cta-start-simulation"
              type="button"
              onClick={() => startScenario(demoScenarios[0])}
              className="flex items-center gap-2 border border-hud-cyan bg-hud-cyan-dim px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-hud-cyan shadow-hud-glow-cyan transition-all hover:bg-hud-cyan/20 focus-visible:ring-2 focus-visible:ring-hud-cyan"
            >
              <BoltIcon className="h-4 w-4" aria-hidden="true" />
              Start incident simulation
            </button>

            <Link
              id="cta-explore-risk"
              to="/services"
              className="flex items-center gap-2 border border-hud-border px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-400 transition-all hover:border-slate-500 hover:text-slate-200"
            >
              <MapIcon className="h-4 w-4" aria-hidden="true" />
              Explore architecture risk
            </Link>
          </div>
        </section>

        {/* ─── First-run checklist ──────────────────────────────────── */}
        <div className="mb-10">
          <FirstRunChecklist />
        </div>

        {/* ─── Product outcome panel ────────────────────────────────── */}
        <section id="product-outcomes" className="mb-12" aria-labelledby="outcomes-heading">
          <h2 id="outcomes-heading" className="sr-only">
            What BlastRadius does
          </h2>
          <ProductOutcomePanel />
        </section>

        {/* ─── Demo scenario picker ─────────────────────────────────── */}
        <section id="demo-scenario-picker" className="mb-12" aria-labelledby="scenarios-heading">
          <div className="mb-5 flex items-center gap-4">
            <h2
              id="scenarios-heading"
              className="text-[10px] font-bold uppercase tracking-widest text-slate-500"
            >
              Choose a demo scenario
            </h2>
            <div className="h-px flex-1 bg-hud-border" />
          </div>

          <div className="grid gap-px bg-hud-border sm:grid-cols-2 lg:grid-cols-3">
            {demoScenarios.map((scenario, idx) => (
              <DemoScenarioCard
                key={scenario.id}
                scenario={scenario}
                index={idx}
                onStart={startScenario}
              />
            ))}
          </div>

          <p className="mt-3 text-[10px] text-slate-600">
            Each scenario uses live seeded data — no mocks, no fake numbers.
          </p>
        </section>

        {/* ─── Why this matters ─────────────────────────────────────── */}
        <WhyThisMatters />

        {/* ─── Footer nudge ────────────────────────────────────────── */}
        <p className="mt-10 text-center text-[10px] uppercase tracking-widest text-slate-700">
          BlastRadius &mdash; Demo workspace &mdash; No data is stored or shared
        </p>
      </main>
    </div>
  );
}
