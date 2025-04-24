# Microsoft Authentication & Role-Based Access Control Implementation Plan

## Overview

This document outlines the implementation plan for enhancing our Next.js application with Microsoft Enterprise authentication and RBAC based on app roles defined in Azure AD. We will leverage BetterAuth for authentication and implement a role system that uses Azure AD app roles for permissions.

## Current Configuration

Our Microsoft Azure Enterprise Application is configured with:

- **App Roles**: Defined roles (Admin, Security, User, DevOps, Collab, DBA, TCC, FieldTech)
- **Group Membership Claims**: Set to "ApplicationGroup" to include groups in tokens
- **Optional Claims**: Groups included with SAM account name format (but NOT emitted as roles)
- **API Permissions**:
  - Microsoft Graph:
    - email
    - offline_access
    - openid
    - profile
    - User.Read
    - GroupMember.Read.All
    - ProfilePhoto.Read.All
    - User.ReadBasic.All

## Implementation Phases

### Phase 1: Microsoft Provider Integration

#### 1.1 Environment Configuration

Ensure the following environment variables are set:

```text
MICROSOFT_CLIENT_ID=<client-id>
MICROSOFT_CLIENT_SECRET=<client-secret>
MICROSOFT_TENANT_ID=<tenant-id>
```

#### 1.2 Update BetterAuth Configuration

Update `src/lib/auth/config.ts` to add Microsoft as a social provider:

```typescript
export const authConfig = {
  // Existing configuration...
  
  socialProviders: {
    microsoft: {
      clientId: MICROSOFT_CLIENT_ID || '',
      clientSecret: MICROSOFT_CLIENT_SECRET || '',
      tenantId: MICROSOFT_TENANT_ID || '',
      scope: [
        'email',
        'offline_access',
        'openid',
        'profile',
        'User.Read',
        'GroupMember.Read.All',
        'ProfilePhoto.Read.All',
        'User.ReadBasic.All'
      ]
    }
  },
  
  // Other configuration options...
} satisfies BetterAuthOptions;
```

#### 1.3 Create Sign-In Components

Create reusable sign-in button and auth components:

```typescript
// src/components/auth/microsoft-sign-in-button.tsx
export function MicrosoftSignInButton() {
  const handleSignIn = () => {
    signIn('microsoft', { callbackUrl: '/dashboard' });
  };
  
  return (
    <Button 
      onClick={handleSignIn}
      className="flex items-center gap-2"
    >
      <MicrosoftIcon />
      Sign in with Microsoft
    </Button>
  );
}
```

### Phase 2: Type Definitions and Role Management

#### 2.1 Define Role Types and Constants

Create centralized type definitions in `src/types/auth.d.ts`:

```typescript
import { auth } from "@/lib/auth/server";
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

// Base type from BetterAuth
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.User;

/**
 * Extended session type with roles and impersonation support
 */
export type ExtendedSession = Session & {
  user: Session['user'] & {
    roles?: Role[];
    groups?: string[];
    originalRoles?: Role[];
    isImpersonating?: boolean;
  };
};

// Module augmentation for BetterAuth
declare module '@/lib/auth/server' {
  interface User {
    roles?: Role[];
    groups?: string[];
    originalRoles?: Role[];
    isImpersonating?: boolean;
  }
}
```

#### 2.2 Role Utility Functions

Create utility functions in `src/lib/auth/roles.ts`:

```typescript
import { ROLES, type Role } from "@/types/auth.d";

/**
 * Type guard to check if a value is a valid Role
 */
export function isValidRole(role: string): role is Role {
  return Object.values(ROLES).includes(role as Role);
}

/**
 * Parse roles from token data, ensuring type safety
 */
export function parseRoles(tokenRoles: unknown): Role[] {
  if (!Array.isArray(tokenRoles)) {
    return [ROLES.USER]; // Default to basic user role
  }
  
  return tokenRoles
    .filter((role): role is string => typeof role === 'string')
    .filter(isValidRole);
}

// Re-export ROLES for backward compatibility and convenience
export { ROLES };
```

#### 2.3 Session Enhancement Hook

Create a hook to process Microsoft identity tokens and extract roles:

```typescript
// src/lib/auth/hooks.ts
import { ROLES } from '@/lib/auth/roles';
import { parseRoles } from '@/lib/auth/role-utils';
import { authLogger } from '@/lib/logger';
import type { ExtendedSession } from '@/types/auth.d';

export const enhanceSession = async ({ 
  session, 
  token 
}: { 
  session: ExtendedSession; 
  token: Record<string, unknown>; 
}): Promise<ExtendedSession> => {
  if (!session?.user) {
    return session;
  }

  // Extract roles from token (should come in the roles claim)
  const userRoles = parseRoles(token?.roles);
  
  // If no valid roles were assigned, set default role
  if (userRoles.length === 0) {
    userRoles.push(ROLES.USER);
  }
  
  // Optionally extract and store groups if needed for other purposes
  const userGroups = Array.isArray(token?.groups) 
    ? token.groups.filter((group: unknown): group is string => typeof group === 'string')
    : [];
  
  // Log role assignment for debugging (using authLogger instead of console)
  if (process.env.NODE_ENV !== 'production') {
    authLogger.debug('[Auth] Assigned roles:', userRoles);
    if (userGroups.length > 0) {
      authLogger.debug('[Auth] User groups:', userGroups);
    }
  }
  
  // Return enhanced session with roles (and optionally groups)
  return {
    ...session,
    user: {
      ...session.user,
      roles: userRoles,
      ...(userGroups.length > 0 && { groups: userGroups }),
    },
  };
}
```

### Phase 3: RBAC Implementation

#### 3.1 Client-Side Role Hook

Create a hook for client-side role checks:

```typescript
// src/hooks/use-role.ts
import { useSession } from '@/lib/auth/client';
import { ROLES } from '@/lib/auth/roles';
import type { ExtendedSession, Role } from '@/types/auth.d';
import { useState, useCallback } from 'react';

export function useRole() {
  // Cast the session response to the appropriate type
  const sessionResponse = useSession();
  const session = sessionResponse.data as ExtendedSession | null;
  const isLoading = sessionResponse.isPending || false;
  const isAuthenticated = !!session?.user;
  
  // State for handling impersonation loading state
  const [isImpersonating, setIsImpersonating] = useState(
    session?.user?.isImpersonating || false
  );
  const [impersonationLoading, setImpersonationLoading] = useState(false);
  
  // Get all roles assigned to the user
  const roles = session?.user?.roles || [];
  
  // Impersonation functions
  const startImpersonation = useCallback(async (role: Role) => {
    // Implementation details...
  }, [session]);
  
  const endImpersonation = useCallback(async () => {
    // Implementation details...
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
    
    // Role check methods
    hasRole: (role: Role) => roles.includes(role),
    hasAnyRole: (checkRoles: Role[]) => checkRoles.some(role => roles.includes(role)),
    hasAllRoles: (checkRoles: Role[]) => checkRoles.every(role => roles.includes(role)),
    
    // Convenience methods for common role checks
    isAdmin: () => roles.includes(ROLES.ADMIN),
    isSecurity: () => roles.includes(ROLES.SECURITY),
    isDevOps: () => roles.includes(ROLES.DEVOPS),
    isDBA: () => roles.includes(ROLES.DBA),
    isCollab: () => roles.includes(ROLES.COLLAB),
    isTCC: () => roles.includes(ROLES.TCC),
    isFieldTech: () => roles.includes(ROLES.FIELDTECH),
    
    // Method to get the highest role based on a predefined hierarchy
    getHighestRole: () => {
      // Role hierarchy from highest to lowest permissions
      const roleHierarchy: Role[] = [
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
      return roleHierarchy.find(role => roles.includes(role)) || ROLES.USER;
    },
  };
}
```

#### 3.2 Role-Based UI Components

Create a component for conditional UI rendering based on roles:

```typescript
// src/components/auth/role-gate.tsx
import { useRole } from '@/hooks/use-role';
import { type RoleGateProps } from '@/types/auth.d';

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

#### 3.3 Server-Side Guards

Implement server-side role-based access control:

```typescript
// src/lib/auth/guards.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import type { ExtendedSession, Role } from '@/types/auth.d';
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
        // Ensure roles property exists, default to empty array if not present
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
  // Implementation details...
}

/**
 * Guard for protecting API routes with role-based access
 */
export function withRoleGuard(allowedRoles: Role[], requireAll = false) {
  // Implementation details...
}
```

#### 3.4 Route Protection with Middleware

Create middleware for route protection based on roles:

```typescript
// src/middleware.ts
import { env } from '@/env';
import { authLogger } from '@/lib/logger';
import { AUTHENTICATED_URL } from '@/lib/settings';
import { betterFetch } from '@better-fetch/fetch';
import { type NextRequest, NextResponse } from 'next/server';
import { ROLES } from '@/lib/auth/roles';
import { checkRoleAccess } from '@/lib/auth/guards';
import type { ExtendedSession } from '@/types/auth.d';

const authRoutes = ['/login', '/sign-up'];
const protectedRoutesPrefix = '/app';

// Define role-protected routes
const adminRoutes = ['/admin', '/app/admin'];
const securityRoutes = ['/security', '/app/security'];
const devopsRoutes = ['/dev', '/app/dev'];
const dbaRoutes = ['/db', '/app/db'];
const apiImpersonationRoutes = ['/api/impersonation'];

export default async function authMiddleware(request: NextRequest) {
  // Middleware implementation...

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
  }

  return NextResponse.next();
}
```

### Phase 4: Impersonation Support

#### 4.1 Impersonation API Routes

```typescript
// src/app/api/impersonation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { getServerSession } from '@/lib/auth/session';
import { ROLES, type Role } from '@/types/auth.d';

// Start impersonation - POST /api/impersonation
export async function POST(req: NextRequest) {
  const session = await getServerSession();
  
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
    return NextResponse.json(
      { error: 'Failed to start impersonation' },
      { status: 500 }
    );
  }
}

// End impersonation - DELETE /api/impersonation
export async function DELETE() {
  const session = await getServerSession();
  
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
    return NextResponse.json(
      { error: 'Failed to end impersonation' },
      { status: 500 }
    );
  }
}
```

## Best Practices

1. **Type Safety**:
   - Use TypeScript for all files, with proper type definitions
   - Keep type definitions in `.d.ts` files for clarity
   - Use explicit type annotations for function parameters and return types

2. **Session Management**:
   - Use BetterAuth's server-side APIs for secure session handling
   - Store minimal data in sessions (e.g., user ID, roles)
   - Use session enhancement for role assignment

3. **Role-Based Access Control**:
   - Always check roles on both client and server sides
   - Use middleware for route protection
   - Implement fine-grained access controls with role checks

4. **Security Considerations**:
   - Validate all inputs, especially in API routes
   - Use HTTPS for all communication
   - Implement proper error handling and logging
   - Set appropriate cookie security options

## Troubleshooting

- **Microsoft Token Issues**: Enable debug logging to view token contents
- **Session Data Issues**: Check BetterAuth session store configuration
- **Role Assignment Issues**: Verify Azure AD app role configuration
