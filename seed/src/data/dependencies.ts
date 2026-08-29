import type { DependencyData } from './types';

export const dependenciesData: DependencyData[] = [
  { from: 'svc-bff-web', to: 'svc-api-gateway', criticality: 'hard', latency_ms: 5 },
  { from: 'svc-bff-mobile', to: 'svc-api-gateway', criticality: 'hard', latency_ms: 5 },
  { from: 'svc-graphql-gateway', to: 'svc-api-gateway', criticality: 'hard', latency_ms: 8 },
  { from: 'svc-api-gateway', to: 'svc-auth', criticality: 'hard', latency_ms: 12 },
  { from: 'svc-api-gateway', to: 'svc-order-api', criticality: 'hard', latency_ms: 25 },
  { from: 'svc-api-gateway', to: 'svc-cart', criticality: 'hard', latency_ms: 18 },
  { from: 'svc-api-gateway', to: 'svc-checkout', criticality: 'hard', latency_ms: 30 },
  { from: 'svc-api-gateway', to: 'svc-search-api', criticality: 'hard', latency_ms: 18 },
  { from: 'svc-api-gateway', to: 'svc-user-profile', criticality: 'hard', latency_ms: 15 },
  { from: 'svc-api-gateway', to: 'svc-recommendation-api', criticality: 'soft', latency_ms: 30 },
  { from: 'svc-api-gateway', to: 'svc-catalog', criticality: 'hard', latency_ms: 14 },
  { from: 'svc-bff-web', to: 'svc-auth', criticality: 'hard', latency_ms: 12 },
  { from: 'svc-bff-web', to: 'svc-user-profile', criticality: 'hard', latency_ms: 18 },
  { from: 'svc-bff-web', to: 'svc-cart', criticality: 'hard', latency_ms: 20 },
  { from: 'svc-bff-web', to: 'svc-recommendation-api', criticality: 'soft', latency_ms: 32 },
  { from: 'svc-bff-mobile', to: 'svc-auth', criticality: 'hard', latency_ms: 14 },
  { from: 'svc-bff-mobile', to: 'svc-checkout', criticality: 'hard', latency_ms: 35 },
  { from: 'svc-bff-mobile', to: 'svc-user-profile', criticality: 'hard', latency_ms: 18 },
  { from: 'svc-bff-mobile', to: 'svc-tracking', criticality: 'soft', latency_ms: 28 },
  { from: 'svc-graphql-gateway', to: 'svc-auth', criticality: 'hard', latency_ms: 16 },
  { from: 'svc-graphql-gateway', to: 'svc-catalog', criticality: 'hard', latency_ms: 18 },
  { from: 'svc-graphql-gateway', to: 'svc-search-api', criticality: 'hard', latency_ms: 20 },
  {
    from: 'svc-graphql-gateway',
    to: 'svc-recommendation-api',
    criticality: 'soft',
    latency_ms: 35,
  },
  { from: 'svc-auth', to: 'svc-postgres-main', criticality: 'hard', latency_ms: 3 },
  { from: 'svc-auth', to: 'svc-session-store', criticality: 'hard', latency_ms: 2 },
  { from: 'svc-auth', to: 'svc-redis-cache', criticality: 'soft', latency_ms: 1 },
  { from: 'svc-auth', to: 'svc-sso', criticality: 'soft', latency_ms: 24 },
  { from: 'svc-session-store', to: 'svc-redis-cache', criticality: 'hard', latency_ms: 1 },
  { from: 'svc-sso', to: 'svc-postgres-main', criticality: 'hard', latency_ms: 4 },
  { from: 'svc-order-api', to: 'svc-auth', criticality: 'hard', latency_ms: 12 },
  { from: 'svc-order-api', to: 'svc-postgres-main', criticality: 'hard', latency_ms: 5 },
  { from: 'svc-order-api', to: 'svc-inventory', criticality: 'hard', latency_ms: 30 },
  { from: 'svc-order-api', to: 'svc-pricing', criticality: 'hard', latency_ms: 18 },
  { from: 'svc-order-api', to: 'svc-notification-api', criticality: 'soft', latency_ms: 20 },
  { from: 'svc-order-api', to: 'svc-event-bus', criticality: 'soft', latency_ms: 8 },
  { from: 'svc-cart', to: 'svc-auth', criticality: 'hard', latency_ms: 11 },
  { from: 'svc-cart', to: 'svc-redis-cache', criticality: 'soft', latency_ms: 2 },
  { from: 'svc-cart', to: 'svc-pricing', criticality: 'hard', latency_ms: 20 },
  { from: 'svc-cart', to: 'svc-catalog', criticality: 'hard', latency_ms: 22 },
  { from: 'svc-checkout', to: 'svc-order-api', criticality: 'hard', latency_ms: 28 },
  { from: 'svc-checkout', to: 'svc-cart', criticality: 'hard', latency_ms: 14 },
  { from: 'svc-checkout', to: 'svc-payment-gateway', criticality: 'hard', latency_ms: 40 },
  { from: 'svc-checkout', to: 'svc-inventory', criticality: 'hard', latency_ms: 25 },
  { from: 'svc-checkout', to: 'svc-auth', criticality: 'hard', latency_ms: 13 },
  { from: 'svc-checkout', to: 'svc-coupon', criticality: 'soft', latency_ms: 20 },
  { from: 'svc-pricing', to: 'svc-postgres-main', criticality: 'hard', latency_ms: 4 },
  { from: 'svc-pricing', to: 'svc-redis-cache', criticality: 'soft', latency_ms: 2 },
  { from: 'svc-coupon', to: 'svc-postgres-main', criticality: 'hard', latency_ms: 4 },
  { from: 'svc-coupon', to: 'svc-redis-cache', criticality: 'soft', latency_ms: 2 },
  { from: 'svc-payment-gateway', to: 'svc-auth', criticality: 'hard', latency_ms: 12 },
  { from: 'svc-payment-gateway', to: 'svc-payment-processor', criticality: 'hard', latency_ms: 35 },
  { from: 'svc-payment-gateway', to: 'svc-fraud-detection', criticality: 'hard', latency_ms: 45 },
  { from: 'svc-payment-gateway', to: 'svc-billing', criticality: 'hard', latency_ms: 28 },
  { from: 'svc-payment-processor', to: 'svc-kafka', criticality: 'hard', latency_ms: 7 },
  { from: 'svc-payment-processor', to: 'svc-postgres-main', criticality: 'hard', latency_ms: 6 },
  { from: 'svc-billing', to: 'svc-postgres-main', criticality: 'hard', latency_ms: 5 },
  { from: 'svc-billing', to: 'svc-event-bus', criticality: 'soft', latency_ms: 8 },
  { from: 'svc-fraud-detection', to: 'svc-ml-inference', criticality: 'hard', latency_ms: 38 },
  { from: 'svc-fraud-detection', to: 'svc-feature-store', criticality: 'hard', latency_ms: 12 },
  { from: 'svc-notification-api', to: 'svc-email-worker', criticality: 'soft', latency_ms: 10 },
  { from: 'svc-notification-api', to: 'svc-sms-worker', criticality: 'soft', latency_ms: 12 },
  { from: 'svc-notification-api', to: 'svc-push-worker', criticality: 'soft', latency_ms: 10 },
  { from: 'svc-notification-api', to: 'svc-event-bus', criticality: 'hard', latency_ms: 6 },
  { from: 'svc-email-worker', to: 'svc-kafka', criticality: 'hard', latency_ms: 8 },
  { from: 'svc-sms-worker', to: 'svc-kafka', criticality: 'hard', latency_ms: 8 },
  { from: 'svc-push-worker', to: 'svc-kafka', criticality: 'hard', latency_ms: 8 },
  { from: 'svc-search-api', to: 'svc-auth', criticality: 'hard', latency_ms: 12 },
  { from: 'svc-search-api', to: 'svc-catalog', criticality: 'hard', latency_ms: 20 },
  { from: 'svc-search-api', to: 'svc-search-indexer', criticality: 'soft', latency_ms: 18 },
  { from: 'svc-search-api', to: 'svc-redis-cache', criticality: 'soft', latency_ms: 3 },
  { from: 'svc-search-indexer', to: 'svc-kafka', criticality: 'hard', latency_ms: 8 },
  { from: 'svc-search-indexer', to: 'svc-catalog', criticality: 'hard', latency_ms: 25 },
  { from: 'svc-recommendation-api', to: 'svc-ml-inference', criticality: 'hard', latency_ms: 45 },
  { from: 'svc-recommendation-api', to: 'svc-ranking', criticality: 'hard', latency_ms: 32 },
  { from: 'svc-recommendation-api', to: 'svc-catalog', criticality: 'hard', latency_ms: 20 },
  { from: 'svc-catalog', to: 'svc-postgres-main', criticality: 'hard', latency_ms: 5 },
  { from: 'svc-catalog', to: 'svc-redis-cache', criticality: 'soft', latency_ms: 2 },
  { from: 'svc-inventory', to: 'svc-postgres-main', criticality: 'hard', latency_ms: 5 },
  { from: 'svc-inventory', to: 'svc-warehouse', criticality: 'hard', latency_ms: 22 },
  { from: 'svc-warehouse', to: 'svc-postgres-main', criticality: 'hard', latency_ms: 6 },
  { from: 'svc-shipping', to: 'svc-warehouse', criticality: 'hard', latency_ms: 30 },
  { from: 'svc-tracking', to: 'svc-shipping', criticality: 'hard', latency_ms: 24 },
  { from: 'svc-user-profile', to: 'svc-auth', criticality: 'hard', latency_ms: 12 },
  { from: 'svc-user-profile', to: 'svc-postgres-main', criticality: 'hard', latency_ms: 5 },
  { from: 'svc-user-profile', to: 'svc-avatar', criticality: 'soft', latency_ms: 18 },
  { from: 'svc-avatar', to: 'svc-postgres-main', criticality: 'hard', latency_ms: 4 },
  { from: 'svc-analytics-worker', to: 'svc-event-bus', criticality: 'hard', latency_ms: 7 },
  { from: 'svc-analytics-worker', to: 'svc-data-warehouse', criticality: 'hard', latency_ms: 60 },
  { from: 'svc-stream-processor', to: 'svc-kafka', criticality: 'hard', latency_ms: 8 },
  { from: 'svc-stream-processor', to: 'svc-data-warehouse', criticality: 'hard', latency_ms: 55 },
  { from: 'svc-ml-inference', to: 'svc-feature-store', criticality: 'hard', latency_ms: 20 },
  { from: 'svc-feature-store', to: 'svc-postgres-main', criticality: 'hard', latency_ms: 6 },
  { from: 'svc-ranking', to: 'svc-feature-store', criticality: 'hard', latency_ms: 18 },
];

// Generate dependencies for the 120 programmatic services
// Nodes that are multiples of 15 are isolated (no dependencies).
for (let i = 1; i <= 120; i++) {
  if (i % 15 === 0) continue; // Isolated

  // Each non-isolated node depends on 2-5 other nodes
  const numDeps = (i % 4) + 2;

  for (let j = 0; j < numDeps; j++) {
    // Pick target: mostly other generated nodes, but sometimes core nodes
    const targetId =
      j === 0
        ? `svc-${['api-gateway', 'postgres-main', 'redis-cache', 'auth'][i % 4]}`
        : `svc-gen-${((i + j * 7) % 120) + 1}`;

    // Prevent self-loops
    if (targetId === `svc-gen-${i}`) continue;

    dependenciesData.push({
      from: `svc-gen-${i}`,
      to: targetId,
      criticality: j % 2 === 0 ? 'hard' : 'soft',
      latency_ms: 5 + (i % 25),
    });
  }
}
