import { AUTHENTICATED_URL } from '@/lib/settings';
import type { Session } from '@/types/auth';
import { betterFetch } from '@better-fetch/fetch';
import { type NextRequest, NextResponse } from 'next/server';

// Define public routes
const publicRoutes = ['/login', '/sign-up'];

// Define protected route patterns
//const authRoutes = ['/login', '/sign-up'];
const protectedRoutes = [
  '/user',
  '/vmware',
  '/documentation',
  '/files',
  '/insights',
  '/resources',
  '/api',
];
//const protectedRoutesPrefix = "/user";

// Define role-protected routes
const adminRoutes = ['/admin', '/admin/dashboard', '/api/admin'];
const securityRoutes = ['/security'];
const devopsRoutes = ['/devops'];
const dbaRoutes = ['/dba'];
const collabRoutes = ['/collaboration-services'];
const tccRoutes = ['/tcc'];
const fieldtechRoutes = ['/field-technology'];
const endpointRoutes = ['/endpoint-technology'];
const workloadRoutes = ['/workload-hosting'];
//const apiImpersonationRoutes = ['/api/impersonation'];

// Plugin-specific routes that require protection
const apiKeyRoutes = ['/user/settings/api-keys'];
const jwtToolsRoutes = ['/admin/tools/jwt'];

// Helper to check if any route prefix matches the path
const pathStartsWith = (path: string, prefixes: string[]): boolean => {
  return prefixes.some(prefix => path.startsWith(prefix));
};

/**
 * Middleware for session verification
 * Uses the getSessionCookie helper from BetterAuth for optimized performance
 * Defers role-based authorization to server components and layouts
 */
export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const pathName = request.nextUrl.pathname;

  // Skip middleware for home page
  if (pathName === '/') {
    return NextResponse.next();
  }

  // Define route patterns from pathName
  //const isAuthRoute = authRoutes.includes(pathName);
  const isPublicRoute = publicRoutes.includes(pathName);
  //const isProtectedRoute = pathName.startsWith(protectedRoutesPrefix);
  const isProtectedRoute = protectedRoutes.includes(pathName);
  const isRoleProtectedRoute = pathStartsWith(pathName, [
    ...adminRoutes,
    ...securityRoutes,
    ...devopsRoutes,
    ...dbaRoutes,
    ...fieldtechRoutes,
    ...collabRoutes,
    ...endpointRoutes,
    ...workloadRoutes,
    ...tccRoutes,
    ...apiKeyRoutes,
    ...jwtToolsRoutes,
  ]);

  // Check for session cookie existence (fast path)
  /* const hasSessionCookie = getSessionCookie(request); */
  const cookies = request.headers.get('cookie');

  const startTime = Date.now();

  const { data: session } = await betterFetch<Session>(
    '/api/auth/get-session',
    {
      baseURL: process.env.NEXT_PUBLIC_APP_URL,
      headers: {
        cookie: cookies || '',
      },
    }
  );

  const endTime = Date.now();
  const duration = endTime - startTime;

  // biome-ignore lint/suspicious/noConsole: allow console in middleware
  console.debug(`Session fetch time: ${duration}ms`);
  // biome-ignore lint/suspicious/noConsole: allow console in middleware
  console.log(cookies);

  if (isPublicRoute) {
    if (session) {
      return NextResponse.redirect(new URL(AUTHENTICATED_URL, request.url));
    }
    return NextResponse.next();
  }
  if (!session && (isProtectedRoute || isRoleProtectedRoute)) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    return Response.redirect(
      new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
