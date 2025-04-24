import { authLogger } from '@/lib/logger';
import type { ExtendedSession } from '@/types/auth.d';
import type { Role } from '@/types/roles';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from './server';

/**
 * Get the server session using the official BetterAuth approach
 */
async function getServerSession(): Promise<ExtendedSession | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // If no session, return null
    if (!session) return null;

    // Map the BetterAuth session to include roles
    // This is safe because we're just adding the roles property if it doesn't exist
    return {
      ...session,
      user: {
        ...session.user,
        // Ensure roles property exists, default to empty array if not present
        roles: Array.isArray((session.user as Record<string, unknown>)?.roles)
          ? ((session.user as Record<string, unknown>).roles as Role[])
          : [],
      },
    } as ExtendedSession;
  } catch (error) {
    authLogger.error('Error getting server session:', error);
    return null;
  }
}

/**
 * Check if the user's session contains the required roles
 *
 * @param session - The user's session
 * @param allowedRoles - Roles that are allowed to access the resource
 * @param requireAll - If true, requires all roles instead of any
 */
export function checkRoleAccess(
  session: ExtendedSession | null,
  allowedRoles: Role[],
  requireAll = false
): boolean {
  // No session means no access
  if (!session?.user?.roles) {
    return false;
  }

  // Check if user has the required roles
  return requireAll
    ? allowedRoles.every(role => session.user.roles?.includes(role))
    : allowedRoles.some(role => session.user.roles?.includes(role));
}

/**
 * Middleware guard for role-based route protection
 *
 * @param req - The Next.js request
 * @param allowedRoles - Roles that are allowed to access the route
 * @param redirectTo - URL to redirect to if access is denied (default: /unauthorized)
 * @param requireAll - If true, requires all roles instead of any
 */
export async function requireRole(
  req: NextRequest,
  allowedRoles: Role[],
  redirectTo = '/unauthorized',
  requireAll = false
): Promise<NextResponse> {
  // Get server session
  const session = await getServerSession();

  // Not authenticated - redirect to sign in
  if (!session?.user) {
    const signInUrl = new URL('/api/auth/signin', req.url);
    signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Check if user has required roles
  const hasAccess = checkRoleAccess(session, allowedRoles, requireAll);

  // If no access, redirect to the specified URL
  if (!hasAccess) {
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }

  // Allow access
  return NextResponse.next();
}

/**
 * Guard for protecting API routes with role-based access
 *
 * @param allowedRoles - Roles that are allowed to access the API
 * @param requireAll - If true, requires all roles instead of any
 */
export function withRoleGuard(allowedRoles: Role[], requireAll = false) {
  return async (req: Request) => {
    const session = await getServerSession();

    // Not authenticated
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if user has required roles
    const hasAccess = checkRoleAccess(session, allowedRoles, requireAll);

    // If no access, return forbidden response
    if (!hasAccess) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Proceed with the request - implementation will depend on how you structure your API
    return null; // The actual handler should be called by the consumer of this guard
  };
}
