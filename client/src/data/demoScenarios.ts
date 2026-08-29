/**
 * demoScenarios.ts
 *
 * Pre-built incident scenarios for the guided product entry experience.
 * Each scenario maps to a real service in the seeded graph so the blast
 * radius simulation runs against live data without any user setup.
 */

export type ScenarioSeverity = 'SEV1' | 'SEV2' | 'SEV3';
export type ScenarioDomain = 'auth' | 'payments' | 'data' | 'messaging' | 'delivery';

export interface DemoScenario {
  id: string;
  title: string;
  startingServiceId: string;
  severity: ScenarioSeverity;
  domain: ScenarioDomain;
  /** One-line symptom shown on the card */
  promptCopy: string;
  /** Plain-language business impact shown on the card */
  businessImpact: string;
  /** Longer context shown when the user enters the simulation */
  contextDescription: string;
}

export const demoScenarios: DemoScenario[] = [
  {
    id: 'scenario-auth-outage',
    title: 'Auth Service Outage',
    startingServiceId: 'svc-auth',
    severity: 'SEV1',
    domain: 'auth',
    promptCopy: 'Auth service is returning 503s. Users cannot sign in.',
    businessImpact:
      'All login-gated features are unavailable. Customer-facing apps will degrade within minutes.',
    contextDescription:
      'The authentication service started returning HTTP 503 errors at scale. Token validation is failing for all downstream consumers. Every service that requires a valid session is now at risk.',
  },
  {
    id: 'scenario-checkout-slowdown',
    title: 'Checkout API Degradation',
    startingServiceId: 'svc-checkout-api',
    severity: 'SEV2',
    domain: 'payments',
    promptCopy: 'Checkout API p99 latency is 8 s — up from 200 ms baseline.',
    businessImpact:
      'Conversion rate is dropping. Revenue impact estimated at ~$40 k/hr if unresolved.',
    contextDescription:
      'The checkout API latency spiked shortly after a dependency deployed a new version. Cart abandon rates are climbing. Root cause is not yet confirmed — payment gateway, inventory lock, or database could all be culpable.',
  },
  {
    id: 'scenario-db-failure',
    title: 'Primary Database Failure',
    startingServiceId: 'svc-postgres-main',
    severity: 'SEV1',
    domain: 'data',
    promptCopy: 'Primary Postgres cluster is unresponsive. Write traffic is failing.',
    businessImpact:
      'Any service that writes to the main database will return errors. Read-only caches will mask the issue briefly, then fail.',
    contextDescription:
      'The primary Postgres node stopped accepting connections. The replica promotion has not completed. All write-path services will start queuing or erroring. Caches will serve stale data for a short window before they expire.',
  },
  {
    id: 'scenario-queue-backlog',
    title: 'Event Queue Backlog',
    startingServiceId: 'svc-event-bus',
    severity: 'SEV2',
    domain: 'messaging',
    promptCopy: 'Event bus consumer lag is at 2 million messages and climbing.',
    businessImpact:
      'Async workflows are delayed by 15+ minutes. Order confirmations, notification emails, and audit logs are backlogged.',
    contextDescription:
      'A spike in upstream publish rate combined with a slow consumer caused the event queue depth to grow beyond safe thresholds. Worker services that depend on real-time event delivery are falling behind. SLA commitments for order confirmations are at risk.',
  },
  {
    id: 'scenario-deploy-regression',
    title: 'Deploy-Triggered Regression',
    startingServiceId: 'svc-api-gateway',
    severity: 'SEV3',
    domain: 'delivery',
    promptCopy: 'Error rate on API gateway spiked 12 minutes after the last deploy.',
    businessImpact:
      'A subset of traffic is getting 5xx responses. The blast radius is limited but growing as cache TTLs expire.',
    contextDescription:
      'The latest deploy to the API gateway introduced a route-handling regression. About 3% of requests are hitting an unhandled error path. The issue was caught by alerting before full rollout. A rollback or targeted hotfix is needed.',
  },
];
