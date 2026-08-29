import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { apiClient, ApiError } from '../lib/api';
import type {
  AuthState,
  AuthUser,
  AuthWorkspace,
  FeatureFlags,
  UserRole,
} from '../types/auth.types';

// ─── Context shape ────────────────────────────────────────────────

interface AuthContextValue {
  state: AuthState;
  user: AuthUser | null;
  workspace: AuthWorkspace | null;
  role: UserRole | null;
  featureFlags: FeatureFlags | null;
  /** Sign in as the demo responder user. */
  loginDemo: () => Promise<void>;
  /** Sign in by email (matches a seeded demo user). */
  loginByEmail: (email: string) => Promise<void>;
  /** Destroy the session. */
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────

export function AuthProvider({ children }: PropsWithChildren): JSX.Element {
  const [state, setState] = useState<AuthState>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [workspace, setWorkspace] = useState<AuthWorkspace | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags | null>(null);

  // ── Apply a successful MeResponse ──────────────────────────────
  const applyMe = useCallback(
    (me: Awaited<ReturnType<typeof apiClient.auth.me>>, authState: AuthState = 'authenticated') => {
      setUser(me.user);
      setWorkspace(me.workspace);
      setRole(me.role);
      setFeatureFlags(me.featureFlags);
      setState(authState);
    },
    [],
  );

  // ── Clear auth state ───────────────────────────────────────────
  const clearMe = useCallback(() => {
    setUser(null);
    setWorkspace(null);
    setRole(null);
    setFeatureFlags(null);
    setState('unauthenticated');
  }, []);

  // ── Bootstrap: probe existing session on mount ─────────────────
  useEffect(() => {
    let cancelled = false;

    apiClient.auth
      .me()
      .then((me) => {
        if (!cancelled) applyMe(me, 'authenticated');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        // 401 = no session → unauthenticated (not an error)
        if (err instanceof ApiError && err.status === 401) {
          setState('unauthenticated');
        } else {
          // Network failure or unexpected error — still mark unauthenticated
          setState('unauthenticated');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [applyMe]);

  // ── Actions ────────────────────────────────────────────────────
  const loginDemo = useCallback(async () => {
    const me = await apiClient.auth.demo();
    applyMe(me, 'demo');
  }, [applyMe]);

  const loginByEmail = useCallback(
    async (email: string) => {
      const me = await apiClient.auth.login(email);
      applyMe(me, 'authenticated');
    },
    [applyMe],
  );

  const logout = useCallback(async () => {
    await apiClient.auth.logout();
    clearMe();
  }, [clearMe]);

  const value = useMemo<AuthContextValue>(
    () => ({ state, user, workspace, role, featureFlags, loginDemo, loginByEmail, logout }),
    [state, user, workspace, role, featureFlags, loginDemo, loginByEmail, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
