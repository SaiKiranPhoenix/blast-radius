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

export interface FeatureFlags {
  canCreateSimulations: boolean;
  canManageWorkspace: boolean;
  canSharePlans: boolean;
}

export interface MeResponse {
  user: AuthUser;
  workspace: AuthWorkspace;
  role: UserRole;
  featureFlags: FeatureFlags;
}

export type AuthState = 'loading' | 'unauthenticated' | 'demo' | 'authenticated';
