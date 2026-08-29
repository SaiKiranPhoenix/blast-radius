import { getDriver } from '../config/neo4j';
import { env } from '../config/env';
import { nodeProps } from '../utils/neo4jHelpers';
import { AppError } from '../utils/AppError';
import type { UserRole, AuthUser, AuthWorkspace, MeResponse } from '../types/auth.types';

// ─── Raw Neo4j shapes ─────────────────────────────────────────────

interface UserRecord {
  id: string;
  name: string;
  email: string;
  title: string;
  role?: string;
}

interface WorkspaceRecord {
  id: string;
  name: string;
  slug: string;
  defaultSeverity: string;
  createdAt: string;
}

// ─── Feature flag builder ─────────────────────────────────────────

function featureFlags(role: UserRole): MeResponse['featureFlags'] {
  return {
    canCreateSimulations: role === 'owner' || role === 'responder',
    canManageWorkspace: role === 'owner',
    canSharePlans: true,
  };
}

// ─── Service functions ────────────────────────────────────────────

/**
 * Finds a user by email and returns their memberships.
 * Returns null when no user matches.
 */
export const getUserByEmail = async (
  email: string,
): Promise<{ user: AuthUser; workspaceId: string; role: UserRole } | null> => {
  const session = getDriver().session({ database: env.NEO4J_DATABASE });
  try {
    const result = await session.run(
      `
      MATCH (u:User {email: $email})
      OPTIONAL MATCH (u)-[m:MEMBER_OF]->(w:Workspace)
      RETURN u, w.id AS workspaceId, m.role AS role
      LIMIT 1
      `,
      { email },
    );

    if (result.records.length === 0) return null;

    const record = result.records[0];
    const raw = nodeProps<UserRecord>(record.get('u'));

    return {
      user: { id: raw.id, name: raw.name, email: raw.email, title: raw.title },
      workspaceId: (record.get('workspaceId') as string | null) ?? '',
      role: ((record.get('role') as string | null) ?? 'viewer') as UserRole,
    };
  } finally {
    await session.close();
  }
};

/**
 * Returns the demo responder user (for "Continue with demo workspace" flow).
 */
export const getDemoUser = async (): Promise<{
  user: AuthUser;
  workspaceId: string;
  role: UserRole;
} | null> => {
  return getUserByEmail('sam@demo.blastradius.app');
};

/**
 * Fetches a workspace by id. Throws 404 if missing.
 */
export const getWorkspaceById = async (id: string): Promise<AuthWorkspace> => {
  const session = getDriver().session({ database: env.NEO4J_DATABASE });
  try {
    const result = await session.run(`MATCH (w:Workspace {id: $id}) RETURN w LIMIT 1`, { id });

    if (result.records.length === 0) {
      throw AppError.notFound('Workspace', id);
    }

    const raw = nodeProps<WorkspaceRecord>(result.records[0].get('w'));
    return {
      id: raw.id,
      name: raw.name,
      slug: raw.slug,
      defaultSeverity: (raw.defaultSeverity as AuthWorkspace['defaultSeverity']) ?? 'SEV2',
    };
  } finally {
    await session.close();
  }
};

/**
 * Fetches a user by id. Throws 404 if missing.
 */
export const getUserById = async (id: string): Promise<AuthUser> => {
  const session = getDriver().session({ database: env.NEO4J_DATABASE });
  try {
    const result = await session.run(`MATCH (u:User {id: $id}) RETURN u LIMIT 1`, { id });

    if (result.records.length === 0) {
      throw AppError.notFound('User', id);
    }

    const raw = nodeProps<UserRecord>(result.records[0].get('u'));
    return { id: raw.id, name: raw.name, email: raw.email, title: raw.title };
  } finally {
    await session.close();
  }
};

/**
 * Builds the full MeResponse from session data.
 */
export const getMeData = async (
  userId: string,
  workspaceId: string,
  role: UserRole,
): Promise<MeResponse> => {
  const [user, workspace] = await Promise.all([getUserById(userId), getWorkspaceById(workspaceId)]);

  return { user, workspace, role, featureFlags: featureFlags(role) };
};
