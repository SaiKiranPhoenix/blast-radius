import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock neo4j driver ────────────────────────────────────────────
vi.mock('../../../src/config/neo4j', () => ({
  getDriver: vi.fn(),
}));

vi.mock('../../../src/config/env', () => ({
  env: { NEO4J_DATABASE: 'neo4j' },
}));

import { getDriver } from '../../../src/config/neo4j';
import { getUserByEmail, getDemoUser, getMeData } from '../../../src/services/auth.service';

function makeSession(records: Record<string, unknown>[]) {
  return {
    run: vi.fn().mockResolvedValue({
      records: records.map((r) => ({
        get: (key: string) => r[key],
      })),
    }),
    close: vi.fn().mockResolvedValue(undefined),
  };
}

function makeNode(props: Record<string, unknown>) {
  return { properties: props };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── getUserByEmail ───────────────────────────────────────────────

describe('getUserByEmail', () => {
  it('returns user data when email matches a seeded user', async () => {
    const session = makeSession([
      {
        u: makeNode({
          id: 'user-oncall-eng',
          name: 'Sam Chen',
          email: 'sam@demo.blastradius.app',
          title: 'On-Call Engineer',
        }),
        workspaceId: 'ws-acme',
        role: 'responder',
      },
    ]);
    vi.mocked(getDriver).mockReturnValue({ session: vi.fn().mockReturnValue(session) } as never);

    const result = await getUserByEmail('sam@demo.blastradius.app');

    expect(result).not.toBeNull();
    expect(result?.user.name).toBe('Sam Chen');
    expect(result?.role).toBe('responder');
    expect(result?.workspaceId).toBe('ws-acme');
  });

  it('returns null when email does not match any user', async () => {
    const session = makeSession([]);
    vi.mocked(getDriver).mockReturnValue({ session: vi.fn().mockReturnValue(session) } as never);

    const result = await getUserByEmail('unknown@example.com');
    expect(result).toBeNull();
  });
});

// ─── getDemoUser ──────────────────────────────────────────────────

describe('getDemoUser', () => {
  it('returns the demo responder user', async () => {
    const session = makeSession([
      {
        u: makeNode({
          id: 'user-oncall-eng',
          name: 'Sam Chen',
          email: 'sam@demo.blastradius.app',
          title: 'On-Call Engineer',
        }),
        workspaceId: 'ws-acme',
        role: 'responder',
      },
    ]);
    vi.mocked(getDriver).mockReturnValue({ session: vi.fn().mockReturnValue(session) } as never);

    const result = await getDemoUser();
    expect(result?.user.email).toBe('sam@demo.blastradius.app');
    expect(result?.role).toBe('responder');
  });
});

// ─── getMeData — feature flags ────────────────────────────────────

describe('getMeData', () => {
  function setupSessions(user: Record<string, unknown>, workspace: Record<string, unknown>) {
    let callCount = 0;
    vi.mocked(getDriver).mockReturnValue({
      session: vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return makeSession([{ u: makeNode(user) }]);
        }
        return makeSession([{ w: makeNode(workspace) }]);
      }),
    } as never);
  }

  it('sets canManageWorkspace=true for owner role', async () => {
    setupSessions(
      {
        id: 'user-sre-lead',
        name: 'Alex Rivera',
        email: 'alex@demo.blastradius.app',
        title: 'SRE Lead',
      },
      { id: 'ws-acme', name: 'Acme Corp Demo', slug: 'acme', defaultSeverity: 'SEV2' },
    );

    const me = await getMeData('user-sre-lead', 'ws-acme', 'owner');
    expect(me.featureFlags.canManageWorkspace).toBe(true);
    expect(me.featureFlags.canCreateSimulations).toBe(true);
    expect(me.role).toBe('owner');
  });

  it('sets canManageWorkspace=false for viewer role', async () => {
    setupSessions(
      {
        id: 'user-eng-manager',
        name: 'Jordan Lee',
        email: 'jordan@demo.blastradius.app',
        title: 'Engineering Manager',
      },
      { id: 'ws-acme', name: 'Acme Corp Demo', slug: 'acme', defaultSeverity: 'SEV2' },
    );

    const me = await getMeData('user-eng-manager', 'ws-acme', 'viewer');
    expect(me.featureFlags.canManageWorkspace).toBe(false);
    expect(me.featureFlags.canCreateSimulations).toBe(false);
    expect(me.featureFlags.canSharePlans).toBe(true);
    expect(me.role).toBe('viewer');
  });

  it('sets canCreateSimulations=true for responder role', async () => {
    setupSessions(
      {
        id: 'user-oncall-eng',
        name: 'Sam Chen',
        email: 'sam@demo.blastradius.app',
        title: 'On-Call Engineer',
      },
      { id: 'ws-acme', name: 'Acme Corp Demo', slug: 'acme', defaultSeverity: 'SEV2' },
    );

    const me = await getMeData('user-oncall-eng', 'ws-acme', 'responder');
    expect(me.featureFlags.canCreateSimulations).toBe(true);
    expect(me.featureFlags.canManageWorkspace).toBe(false);
  });
});
