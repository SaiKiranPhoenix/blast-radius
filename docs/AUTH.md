# Authentication & Identity

BlastRadius uses a **Demo-only local auth** approach for v1. This decision was made to ensure zero friction during
product evaluation and demo phases without requiring external OAuth provider configuration.

## How it works

1. **No Passwords**: Users log in using their email address. If the email matches one of the seeded demo users, they are
   authenticated.
2. **Session Storage**: Sessions are stored using `express-session` backed by an in-memory store for the demo, and
   maintained via a signed, HTTP-only cookie.
3. **Workspace Isolation**: Authenticated queries append a `workspaceId` filter, ensuring users only see data belonging
   to their active workspace. Unauthenticated API calls (if allowed) fall back to the global demo data.

## Demo Users

The database is seeded with three users to demonstrate different roles and permissions:

- **Owner**: Alex Rivera (`alex@demo.blastradius.app`) - Can manage workspace settings.
- **Responder**: Sam Chen (`sam@demo.blastradius.app`) - Can triage incidents and create simulations.
- **Viewer**: Jordan Lee (`jordan@demo.blastradius.app`) - Can view maps and incidents but cannot mutate state.

### One-Click Demo

Clicking "Continue with demo workspace" on the login page will automatically sign the user in as the **Responder** (Sam
Chen) and redirect to the `/start` screen.

## Upgrade Path (v2)

For production deployments in v2, this layer can easily be swapped:

- **Provider**: Add GitHub OAuth or SAML (e.g., via Passport.js or NextAuth/Auth.js if migrating).
- **Session Store**: Swap the `MemoryStore` in `server/src/middleware/session.ts` for `connect-redis` or
  `connect-neo4j`.
- The frontend `AuthProvider` and backend `RequireAuth` guard remain unchanged, as they rely on the same `/api/me`
  session contract.
