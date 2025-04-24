# Role-Based Access Control (RBAC)

This document covers how to implement Role-Based Access Control (RBAC) with BetterAuth, including role assignment, access control mechanisms, and best practices.

## RBAC Overview

Role-Based Access Control is a security approach that restricts system access to authorized users based on their assigned roles. BetterAuth provides built-in support for implementing RBAC for your application.

## Implementing RBAC with Azure AD

Our implementation leverages Azure AD app roles for centralized role management. This approach provides several benefits:

1. Centralized role management in Azure AD
2. Simplified role assignment through the Azure portal
3. Roles included directly in authentication tokens
4. Consistent role-based access across the application

### Azure AD Configuration

1. **Define App Roles**: In Azure AD, configure app roles matching your application's permission model. In our case:
   - Admin
   - Security
   - DevOps
   - DBA
   - Collab
   - TCC
   - FieldTech
   - User (default)

2. **Assign Roles to Users**: In Azure AD, assign appropriate roles to users or groups.

3. **Configure Token Claims**: Ensure app roles are included in tokens (not as groups).

## Type Definitions

Define your role types centrally in a `.d.ts` file for type safety and consistency:

```typescript
// src/types/roles.d.ts
import { type ReactNode } from "react";

/**
 * Application roles based on Azure AD app roles
 */
export const ROLES = {
  ADMIN: 'admin',
  SECURITY: 'security',
  DEVOPS: 'devops',
  DBA: 'dba',
  COLLAB: 'collab',
  TCC: 'tcc',
  FIELDTECH: 'fieldtech', 
  USER: 'user',
} as const;

/**
 * Role type derived from the ROLES constant
 */
export type Role = (typeof ROLES)[keyof typeof ROLES];

/**
 * Extended session type with roles
 */
export type ExtendedSession = Session & {
  user: Session['user'] & {
    roles?: Role[];
    // Additional claims from Azure AD
    groups?: string[];
    // Support for impersonation
    originalRoles?: Role[];
    isImpersonating?: boolean;
  };
};

/**
 * Props for the RoleGate component
 */
export interface RoleGateProps {
  /**
   * The roles allowed to access the component
   */
  allowedRoles: Role[];
  
  /**
   * Content to display if the user has the required roles
   */
  children: ReactNode;
  
  /**
   * Content to display if the user doesn't have the required roles
   */
  fallback?: ReactNode;
  
  /**
   * If true, requires the user to have ALL the specified roles
   * If false (default), the user only needs to have ANY of the specified roles
   */
  requireAll?: boolean;
  
  /**
   * If true (default), renders the fallback content when the session is loading
   * If false, renders nothing during loading
   */
  showFallbackOnLoading?: boolean;
}

// Add role information to the existing BetterAuth User type
declare module '@/lib/auth/server' {
  interface User {
    roles?: Role[];
    groups?: string[];
    originalRoles?: Role[];
    isImpersonating?: boolean;
  }
}
```

## Centralized Role Utilities

We maintain all role-related utility functions in a single source of truth:

```typescript
// src/lib/auth/role-utils.ts
import { ROLES, type Role } from '@/types/roles';

/**
 * Type guard to check if a value is a valid Role
 */
export function isValidRole(role: string): role is Role {
  return Object.values(ROLES).includes(role as Role);
}

/**
 * Parse roles from token data, ensuring type safety
 * Returns an array of valid roles, or [ROLES.USER] if no valid roles are found
 */
export function parseRoles(tokenRoles: unknown): Role[] {
  // Handle non-array input
  if (!Array.isArray(tokenRoles)) {
    return [ROLES.USER]; // Default to basic user role
  }
  
  // Filter for valid string roles that match our ROLES enum
  const validRoles = tokenRoles
    .filter((role): role is string => typeof role === 'string')
    .filter(isValidRole);
  
  // Return the valid roles, or default to USER role if none found
  return validRoles.length > 0 ? validRoles : [ROLES.USER];
}

/**
 * Check if a user has a specific role
 */
export function hasRole(roles: Role[] | undefined, role: Role): boolean {
  return Array.isArray(roles) && roles.includes(role);
}

/**
 * Check if a user has any of the specified roles
 */
export function hasAnyRole(roles: Role[] | undefined, allowedRoles: Role[]): boolean {
  return Array.isArray(roles) && roles.some(role => allowedRoles.includes(role));
}

/**
 * Get the highest priority role from a list of roles
 * Uses a simple priority hierarchy with ADMIN at the top
 */
export function getHighestRole(roles: Role[] | undefined): Role {
  if (!Array.isArray(roles) || roles.length === 0) {
    return ROLES.USER;
  }
  
  // Role priority (highest to lowest)
  const rolePriority: Role[] = [
    ROLES.ADMIN,
    ROLES.SECURITY,
    ROLES.DEVOPS,
    ROLES.DBA,
    ROLES.COLLAB,
    ROLES.TCC,
    ROLES.FIELDTECH,
    ROLES.USER
  ];
  
  // Find the highest role in the hierarchy that the user has
  return rolePriority.find(role => roles.includes(role)) || ROLES.USER;
}
```

## Client-Side RBAC

### useRole Hook

Our custom hook leverages the centralized role utilities instead of duplicating logic:

```typescript
// src/hooks/use-role.ts
import { useSession } from '@/lib/auth/client';
import { 
  ROLES, 
  type Role 
} from '@/types/roles';
import {
  hasRole as checkHasRole,
  hasAnyRole as checkHasAnyRole,
  getHighestRole as getHighestRoleUtil
} from '@/lib/auth/role-utils';
import type { ExtendedSession } from '@/types/auth.d';
import { useState, useCallback } from 'react';

export function useRole() {
  // Get session data with type casting
  const sessionResponse = useSession();
  const session = sessionResponse.data as ExtendedSession | null;
  const isLoading = sessionResponse.isPending || false;
  const isAuthenticated = !!session?.user;
  
  // Get all roles assigned to the user
  const roles = session?.user?.roles || [];
  
  // Handle impersonation state
  const [isImpersonating, setIsImpersonating] = useState(
    session?.user?.isImpersonating || false
  );
  const [impersonationLoading, setImpersonationLoading] = useState(false);
  
  // Impersonation functions (implementation omitted for brevity)
  const startImpersonation = useCallback(async (role: Role) => {
    /* Implementation... */
  }, [session]);
  
  const endImpersonation = useCallback(async () => {
    /* Implementation... */
  }, []);
  
  return {
    // Basic session information
    roles,
    isLoading,
    isAuthenticated,
    
    // Impersonation state
    isImpersonating: session?.user?.isImpersonating || false,
    impersonationLoading,
    startImpersonation,
    endImpersonation,
    originalRoles: session?.user?.originalRoles || [],
    
    // Use utility functions from role-utils.ts
    hasRole: (role: Role) => checkHasRole(roles, role),
    hasAnyRole: (checkRoles: Role[]) => checkHasAnyRole(roles, checkRoles),
    hasAllRoles: (checkRoles: Role[]) => checkRoles.every(role => roles.includes(role)),
    
    // Convenience methods for common role checks - using the centralized utility
    isAdmin: () => checkHasRole(roles, ROLES.ADMIN),
    isSecurity: () => checkHasRole(roles, ROLES.SECURITY),
    isDevOps: () => checkHasRole(roles, ROLES.DEVOPS),
    isDBA: () => checkHasRole(roles, ROLES.DBA),
    isCollab: () => checkHasRole(roles, ROLES.COLLAB),
    isTCC: () => checkHasRole(roles, ROLES.TCC),
    isFieldTech: () => checkHasRole(roles, ROLES.FIELDTECH),
    
    // Use the utility function instead of duplicating the role hierarchy logic
    getHighestRole: () => getHighestRoleUtil(roles),
  };
}
```

### Role-Based UI Component

Create a reusable component for conditional rendering based on user roles:

```tsx
// src/components/auth/role-gate.tsx
import { useRole } from '@/hooks/use-role';
import { type RoleGateProps } from '@/types/roles';

/**
 * Component for conditional rendering based on user roles
 * 
 * Use this component to show or hide UI elements based on the user's roles.
 * This is useful for building role-specific navigation, feature flags, etc.
 */
export function RoleGate({
  allowedRoles,
  children,
  fallback,
  requireAll = false,
  showFallbackOnLoading = true,
}: RoleGateProps) {
  const { isLoading, hasAnyRole, hasAllRoles } = useRole();
  
  // Optional handling for loading state
  if (isLoading) {
    return showFallbackOnLoading ? <>{fallback}</> : null;
  }
  
  // Check permission based on required access pattern
  const hasAccess = requireAll
    ? hasAllRoles(allowedRoles)
    : hasAnyRole(allowedRoles);
    
  // Render based on access check
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
```

### Usage Example

```tsx
import { RoleGate } from '@/components/auth/role-gate';
import { ROLES } from '@/lib/auth/roles';

export function AdminPanel() {
  return (
    <RoleGate 
      allowedRoles={[ROLES.ADMIN]} 
      fallback={<p>You don't have access to this content.</p>}
    >
      <div className="p-4 bg-white rounded shadow">
        <h2 className="text-lg font-bold">Admin Panel</h2>
        {/* Admin-only content */}
      </div>
    </RoleGate>
  );
}

export function SecurityDashboard() {
  return (
    <RoleGate 
      allowedRoles={[ROLES.ADMIN, ROLES.SECURITY]} 
      fallback={<p>This content requires security access.</p>}
    >
      <div className="p-4 bg-white rounded shadow">
        <h2 className="text-lg font-bold">Security Dashboard</h2>
        {/* Security content */}
      </div>
    </RoleGate>
  );
}
```

## Server-Side RBAC

### Server-Side Role Guards

Create utility functions for server-side role checks:

```typescript
// src/lib/auth/guards.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import type { ExtendedSession, Role } from '@/types/roles';
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
    return {
      ...session,
      user: {
        ...session.user,
        // Ensure roles property exists
        roles: Array.isArray((session.user as Record<string, unknown>)?.roles)
          ? (session.user as Record<string, unknown>).roles as Role[]
          : []
      }
    } as ExtendedSession;
  } catch (error) {
    console.error('Error getting server session:', error);
    return null;
  }
}

/**
 * Check if the user's session contains the required roles
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
 */
export function withRoleGuard(allowedRoles: Role[], requireAll = false) {
  return async (req: Request) => {
    const session = await getServerSession();
    
    // Not authenticated
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if user has required roles
    const hasAccess = checkRoleAccess(session, allowedRoles, requireAll);
    
    // If no access, return forbidden response
    if (!hasAccess) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Continue with the request if authorized
    return null;
  };
}
```

### Route Protection with Middleware

Implement route protection in Next.js middleware:

```typescript
// src/middleware.ts
import { env } from '@/env';
import { authLogger } from '@/lib/logger';
import { AUTHENTICATED_URL } from '@/lib/settings';
import { betterFetch } from '@better-fetch/fetch';
import { type NextRequest, NextResponse } from 'next/server';
import { ROLES } from '@/lib/auth/roles';
import { checkRoleAccess } from '@/lib/auth/guards';
import type { ExtendedSession } from '@/types/roles';

// Define protected route patterns
const authRoutes = ['/login', '/sign-up'];
const protectedRoutesPrefix = '/app';
const adminRoutes = ['/admin', '/app/admin'];
const securityRoutes = ['/security', '/app/security'];
const devopsRoutes = ['/dev', '/app/dev'];
const dbaRoutes = ['/db', '/app/db'];
const apiImpersonationRoutes = ['/api/impersonation'];

// Helper to check if a path matches any prefixes
const pathStartsWith = (path: string, prefixes: string[]): boolean => {
  return prefixes.some(prefix => path.startsWith(prefix));
};

export default async function authMiddleware(request: NextRequest) {
  const { nextUrl } = request;
  const pathName = request.nextUrl.pathname;
  const isAuthRoute = authRoutes.includes(pathName);
  const isProtectedRoute = pathName.startsWith(protectedRoutesPrefix);
  const isImpersonationApi = apiImpersonationRoutes.some(route => pathName === route);
  const cookies = request.headers.get('cookie');

  // Get the user session
  const { data: session } = await betterFetch<ExtendedSession>(
    '/api/auth/get-session',
    {
      baseURL: env.NEXT_PUBLIC_APP_URL,
      headers: {
        cookie: cookies || '',
      },
    }
  );

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

    // Special handling for impersonation API
    if (isImpersonationApi) {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
```

## Role Impersonation for Admins

Enable privileged users to temporarily assume other roles for testing:

```typescript
// src/app/api/impersonation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { ROLES, type Role } from '@/types/roles';
import { headers } from 'next/headers';

// Helper to get the session
async function getSession() {
  try {
    return await auth.api.getSession({
      headers: await headers(),
    });
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

// Start impersonation - POST /api/impersonation
export async function POST(req: NextRequest) {
  const session = await getSession();
  
  // Only admins can impersonate
  if (!session?.user?.roles?.includes(ROLES.ADMIN)) {
    return NextResponse.json(
      { error: 'Unauthorized - Only admins can impersonate' },
      { status: 403 }
    );
  }
  
  try {
    const body = await req.json();
    const { role } = body;
    
    // Validate role exists
    if (!Object.values(ROLES).includes(role as Role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }
    
    // Store original roles and set new role
    await auth.api.updateUser({
      data: {
        originalRoles: session.user.roles,
        roles: [role],
        isImpersonating: true
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error starting impersonation:', error);
    return NextResponse.json(
      { error: 'Failed to start impersonation' },
      { status: 500 }
    );
  }
}

// End impersonation - DELETE /api/impersonation
export async function DELETE() {
  const session = await getSession();
  
  if (!session?.user?.isImpersonating) {
    return NextResponse.json(
      { error: 'Not currently impersonating' },
      { status: 400 }
    );
  }
  
  try {
    // Restore original roles
    await auth.api.updateUser({
      data: {
        roles: session.user.originalRoles || [ROLES.USER],
        originalRoles: undefined,
        isImpersonating: false
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error ending impersonation:', error);
    return NextResponse.json(
      { error: 'Failed to end impersonation' },
      { status: 500 }
    );
  }
}
```

## Testing RBAC Implementation

### Testing Role Assignments

Verify that roles are correctly assigned from Azure AD tokens:

1. Create test users with different role assignments in Azure AD
2. Authenticate with these test users
3. Check that the session contains the expected roles
4. Verify that role-based access controls work as expected

### Testing Role Guards

Create automated tests for your role guards:

```typescript
// tests/rbac.test.ts
import { checkRoleAccess } from '@/lib/auth/guards';
import { ROLES } from '@/lib/auth/roles';
import type { ExtendedSession } from '@/types/roles';

describe('RBAC Guards', () => {
  test('checkRoleAccess should deny access when session is null', () => {
    expect(checkRoleAccess(null, [ROLES.ADMIN])).toBe(false);
  });
  
  test('checkRoleAccess should deny access when user has no required roles', () => {
    const mockSession = {
      user: {
        id: '1',
        roles: [ROLES.USER],
      },
    } as ExtendedSession;
    
    expect(checkRoleAccess(mockSession, [ROLES.ADMIN])).toBe(false);
  });
  
  test('checkRoleAccess should grant access when user has any required role', () => {
    const mockSession = {
      user: {
        id: '1',
        roles: [ROLES.ADMIN, ROLES.USER],
      },
    } as ExtendedSession;
    
    expect(checkRoleAccess(mockSession, [ROLES.ADMIN, ROLES.SECURITY])).toBe(true);
  });
  
  test('checkRoleAccess should require all roles when requireAll is true', () => {
    const mockSession = {
      user: {
        id: '1',
        roles: [ROLES.ADMIN, ROLES.SECURITY],
      },
    } as ExtendedSession;
    
    expect(checkRoleAccess(
      mockSession, 
      [ROLES.ADMIN, ROLES.SECURITY], 
      true
    )).toBe(true);
    
    expect(checkRoleAccess(
      mockSession, 
      [ROLES.ADMIN, ROLES.DEVOPS], 
      true
    )).toBe(false);
  });
});
```

## Best Practices

1. **Centralized Type Definitions**: Keep all role and permission types in a single type definition file.

2. **Role Constants**: Define roles as constants to avoid string literals and enable type checking.

3. **Clean Separation of Concerns**: Keep type definitions separate from implementation code.

4. **Server-Side Verification**: Always verify permissions on the server side, regardless of client-side checks.

5. **Default Role**: Provide a default role (e.g., 'user') for all authenticated users.

6. **Role Hierarchies**: Define clear role hierarchies for permission inheritance.

7. **Consistent Access Control**: Apply role checks consistently across client-side, server-side, and API routes.

8. **Documentation**: Maintain clear documentation of what each role can access.

9. **Impersonation**: Implement role impersonation for admins to test different user experiences.

10. **Type Safety**: Use TypeScript to enforce type safety in role-based operations.
