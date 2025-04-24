import { env } from '@/env';
import { checkRoleAccess } from '@/lib/auth/guards';
import { authLogger } from '@/lib/logger';
import { AUTHENTICATED_URL } from '@/lib/settings';
import type { ExtendedSession } from '@/types/auth.d';
import { ROLES } from '@/types/roles';
import { betterFetch } from '@better-fetch/fetch';
import { type NextRequest, NextResponse } from 'next/server';

const authRoutes = ['/login', '/sign-up'];
const protectedRoutesPrefix = '/app';

// Define role-protected routes
const adminRoutes = ['/admin', '/app/admin'];
const securityRoutes = ['/security', '/app/security'];
const devopsRoutes = ['/dev', '/app/dev'];
const dbaRoutes = ['/db', '/app/db'];
const apiImpersonationRoutes = ['/api/impersonation'];

// Plugin-specific routes that require protection
const apiKeyRoutes = ['/settings/api-keys'];
const jwtToolsRoutes = ['/tools/jwt'];
const organizationRoutes = ['/organizations'];

// Helper to check if any route prefix matches the path
const pathStartsWith = (path: string, prefixes: string[]): boolean => {
  return prefixes.some(prefix => path.startsWith(prefix));
};

export default async function authMiddleware(request: NextRequest) {
  const { nextUrl } = request;
  const pathName = request.nextUrl.pathname;
  const isAuthRoute = authRoutes.includes(pathName);
  const isProtectedRoute = pathName.startsWith(protectedRoutesPrefix);
  const isImpersonationApi = apiImpersonationRoutes.some(
    route => pathName === route
  );
  const cookies = request.headers.get('cookie');

  const startTime = Date.now();

  const { data: session } = await betterFetch<ExtendedSession>(
    '/api/auth/get-session',
    {
      baseURL: env.NEXT_PUBLIC_APP_URL,
      headers: {
        cookie: cookies || '',
      },
    }
  );

  const endTime = Date.now();
  const duration = endTime - startTime;

  authLogger.info(`____Get Session Time: ${duration}ms`);

  // For auth routes, redirect to app if already authenticated
  if (isAuthRoute) {
    if (session) {
      return NextResponse.redirect(new URL(AUTHENTICATED_URL, nextUrl));
    }
    return NextResponse.next();
  }

  // For protected routes, redirect to login if not authenticated
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(pathName)}`, nextUrl)
    );
  }

  // Handle role-based access control for specific routes
  if (session) {
    // Admin routes require admin role
    if (pathStartsWith(pathName, adminRoutes)) {
      if (!checkRoleAccess(session, [ROLES.ADMIN], false)) {
        return NextResponse.redirect(new URL('/unauthorized', nextUrl));
      }
    }

    // Security routes require security role or admin
    if (pathStartsWith(pathName, securityRoutes)) {
      if (!checkRoleAccess(session, [ROLES.SECURITY, ROLES.ADMIN], false)) {
        return NextResponse.redirect(new URL('/unauthorized', nextUrl));
      }
    }

    // DevOps routes require devops role or admin
    if (pathStartsWith(pathName, devopsRoutes)) {
      if (!checkRoleAccess(session, [ROLES.DEVOPS, ROLES.ADMIN], false)) {
        return NextResponse.redirect(new URL('/unauthorized', nextUrl));
      }
    }

    // Database routes require dba role or admin
    if (pathStartsWith(pathName, dbaRoutes)) {
      if (!checkRoleAccess(session, [ROLES.DBA, ROLES.ADMIN], false)) {
        return NextResponse.redirect(new URL('/unauthorized', nextUrl));
      }
    }

    // Plugin-specific routes require admin role
    if (
      pathStartsWith(pathName, apiKeyRoutes) ||
      pathStartsWith(pathName, jwtToolsRoutes) ||
      pathStartsWith(pathName, organizationRoutes)
    ) {
      if (!checkRoleAccess(session, [ROLES.ADMIN], false)) {
        return NextResponse.redirect(new URL('/unauthorized', nextUrl));
      }
    }

    // Special handling for impersonation API - allow any authenticated user but
    // actual authorization checks will happen in the API route handler
    if (isImpersonationApi) {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
