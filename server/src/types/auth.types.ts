// ─── User & Workspace ──────────────────────────────────────────────
export type UserRole = 'owner' | 'responder' | 'viewer';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  title: string;
}

export interface AuthWorkspace {
  id: string;
  name: string;
  slug: string;
  defaultSeverity: 'SEV1' | 'SEV2' | 'SEV3';
}

export interface MeResponse {
  user: AuthUser;
  workspace: AuthWorkspace;
  role: UserRole;
  featureFlags: {
    canCreateSimulations: boolean;
    canManageWorkspace: boolean;
    canSharePlans: boolean;
  };
}

// ─── Session augmentation ─────────────────────────────────────────
declare module 'express-session' {
  interface SessionData {
    userId: string;
    workspaceId: string;
    role: UserRole;
  }
}
