import { authLogger } from '@/lib/logger';
import type { ExtendedSession } from '@/types/auth.d';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { auth } from './server';

/**
 * Get the server session using the official BetterAuth approach
 */
export async function getServerSession(): Promise<ExtendedSession | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // If no session, return null
    if (!session) return null;

    // Map the BetterAuth session to ensure role property is set
    return {
      ...session,
      user: {
        ...session.user,
        // Ensure role property exists, default to user if not present
        role:
          ((session.user as Record<string, unknown>)?.role as string) || 'user',
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
export function hasRequiredRoles(
  session: { user?: { role?: string } } | null | undefined,
  allowedRoles: string[],
  requireAll = false
): boolean {
  // No session means no access
  if (!session?.user?.role) {
    return false;
  }

  // Check against the allowed roles
  return requireAll
    ? allowedRoles.length === 1 && allowedRoles[0] === session.user.role
    : allowedRoles.includes(session.user.role);
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
  allowedRoles: string[],
  redirectTo = '/unauthorized',
  requireAll = false
): Promise<NextResponse> {
  // Get server session
  const session = await getServerSession();

  // Not authenticated - redirect to sign in
  if (!session?.user) {
    const signInUrl = new URL('/login', req.url);
    signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Check if user has required roles
  const hasAccess = hasRequiredRoles(session, allowedRoles, requireAll);

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
export function withRoleGuard(allowedRoles: string[], requireAll = false) {
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
    const hasAccess = hasRequiredRoles(session, allowedRoles, requireAll);

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

/**
 * Higher-order component for protecting server components with role-based access control
 *
 * @param Component - The server component to protect
 * @param allowedRoles - Roles that are allowed to access the component
 * @param options - Optional configuration
 * @param options.redirectTo - URL to redirect to if access is denied (default: /unauthorized)
 * @param options.requireAll - If true, requires all roles instead of any (default: false)
 * @param options.fallback - Component to render when loading the session (optional)
 */
export function withRoleProtection<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: string[],
  options: {
    redirectTo?: string;
    requireAll?: boolean;
    fallback?: React.ReactNode;
  } = {}
) {
  const {
    redirectTo = '/unauthorized',
    requireAll = false,
    fallback = null,
  } = options;

  async function ProtectedComponent(props: P) {
    const session = await getServerSession();

    // Not authenticated - redirect to sign in
    if (!session?.user) {
      redirect('/login');
    }

    // Check if user has required roles
    const hasAccess = hasRequiredRoles(session, allowedRoles, requireAll);

    // If no access, redirect to the specified URL
    if (!hasAccess) {
      redirect(redirectTo);
    }

    // Render the protected component with its props
    return React.createElement(Component, props);
  }

  // Update display name for better debugging
  const displayName = Component.displayName || Component.name || 'Component';
  ProtectedComponent.displayName = `withRoleProtection(${displayName})`;

  return ProtectedComponent;
}
