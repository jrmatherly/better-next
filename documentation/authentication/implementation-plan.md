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
      clientId: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      tenantId: process.env.MICROSOFT_TENANT_ID,
      authorization: {
        params: {
          scope: 'email offline_access openid profile User.Read GroupMember.Read.All ProfilePhoto.Read.All User.ReadBasic.All'
        }
      }
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

### Phase 2: Role Management

#### 2.1 Create Types for Extended Session

```typescript
// src/types/auth.ts
import { User } from 'better-auth';

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

export type Role = (typeof ROLES)[keyof typeof ROLES];

export interface ExtendedUser extends User {
  roles: Role[];
  groups?: string[]; // Store original Microsoft groups if needed
}

export interface ExtendedSession extends Session {
  user: ExtendedUser;
}
```

#### 2.2 Session Enhancement Hook

Create a hook to process Microsoft identity tokens and extract roles:

```typescript
// src/lib/auth/hooks.ts
import { ROLES, Role } from '@/types/auth';

export const enhanceSession = async ({ session, token }) => {
  // App roles come directly from token.roles claim
  const userRoles = token?.roles && Array.isArray(token.roles) 
    ? token.roles as Role[]
    : [];
  
  // Default role assignment if no roles were assigned
  if (userRoles.length === 0) {
    userRoles.push(ROLES.USER); // Default role
  }
  
  // Optionally store groups if needed for group-based features
  const userGroups = token?.groups && Array.isArray(token.groups)
    ? token.groups
    : [];
  
  return {
    ...session,
    user: {
      ...session.user,
      roles: userRoles,
      groups: userGroups, // Optional, remove if not needed
    }
  };
};
```

### Phase 3: RBAC Implementation

#### 3.1 Client-Side Role Hook

```typescript
// src/hooks/use-role.ts
import { useSession } from '@/lib/auth/client';
import { ROLES, Role, ExtendedSession } from '@/types/auth';

export function useRole() {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  
  return {
    hasRole: (role: Role) => session?.user?.roles?.includes(role) ?? false,
    roles: session?.user?.roles || [],
    isAdmin: () => session?.user?.roles?.includes(ROLES.ADMIN) ?? false,
    isSecurity: () => session?.user?.roles?.includes(ROLES.SECURITY) ?? false,
    isDevOps: () => session?.user?.roles?.includes(ROLES.DEVOPS) ?? false,
    isDBA: () => session?.user?.roles?.includes(ROLES.DBA) ?? false,
    isCollab: () => session?.user?.roles?.includes(ROLES.COLLAB) ?? false,
    isTCC: () => session?.user?.roles?.includes(ROLES.TCC) ?? false,
    isFieldTech: () => session?.user?.roles?.includes(ROLES.FIELDTECH) ?? false,
    // Helper to check if user has at least one of the specified roles
    hasAnyRole: (roles: Role[]) => roles.some(role => session?.user?.roles?.includes(role) ?? false),
  };
}
```

#### 3.2 Role-Based UI Components

```typescript
// src/components/auth/role-gate.tsx
import { ReactNode } from 'react';
import { useRole } from '@/hooks/use-role';
import { Role } from '@/types/auth';

interface RoleGateProps {
  children: ReactNode;
  allowedRoles: Role[];
  fallback?: ReactNode;
}

export function RoleGate({ children, allowedRoles, fallback = null }: RoleGateProps) {
  const { hasAnyRole } = useRole();
  
  if (!hasAnyRole(allowedRoles)) {
    return fallback;
  }
  
  return <>{children}</>;
}
```

#### 3.3 Server-Side Role Guards

```typescript
// src/lib/auth/guards.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server';
import { Role, ExtendedSession } from '@/types/auth';

export async function requireRole(
  req: NextRequest,
  allowedRoles: Role[],
  redirectTo = '/unauthorized'
) {
  const session = await getServerSession() as ExtendedSession | null;
  
  if (!session?.user) {
    return NextResponse.redirect(new URL('/signin', req.url));
  }
  
  const hasPermission = allowedRoles.some(role => 
    session.user.roles?.includes(role)
  );
  
  if (!hasPermission) {
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }
  
  return NextResponse.next();
}
```

#### 3.4 Next.js Middleware for Route Protection

```typescript
// src/middleware.ts
import { NextResponse, NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth/guards';
import { ROLES } from '@/types/auth';

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Admin routes
  if (path.startsWith('/admin')) {
    return requireRole(req, [ROLES.ADMIN]);
  }
  
  // Security routes
  if (path.startsWith('/security')) {
    return requireRole(req, [ROLES.ADMIN, ROLES.SECURITY]);
  }
  
  // Developer routes
  if (path.startsWith('/dev')) {
    return requireRole(req, [ROLES.ADMIN, ROLES.DEVOPS]);
  }
  
  // Database routes
  if (path.startsWith('/db')) {
    return requireRole(req, [ROLES.ADMIN, ROLES.DBA]);
  }
  
  // Authenticated routes (any role can access)
  if (path.startsWith('/dashboard')) {
    return requireRole(req, Object.values(ROLES));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/security/:path*', '/dev/:path*', '/db/:path*', '/dashboard/:path*'],
};
```

### Phase 4: Authentication UI

#### 4.1 Sign-In Page

```typescript
// src/app/(auth)/signin/page.tsx
import { MicrosoftSignInButton } from '@/components/auth/microsoft-sign-in-button';

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Sign in to your account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Use your Microsoft work account to access the application
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <MicrosoftSignInButton />
        </div>
      </div>
    </div>
  );
}
```

#### 4.2 User Profile Component with Role Display

```typescript
// src/components/user/profile.tsx
import { useSession } from '@/lib/auth/client';
import { useRole } from '@/hooks/use-role';
import { ExtendedSession } from '@/types/auth';

export function UserProfile() {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const { roles, isAdmin } = useRole();
  
  if (!session?.user) {
    return null;
  }
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex items-center space-x-4">
        {session.user.image && (
          <img 
            src={session.user.image} 
            alt={session.user.name || 'User'} 
            className="w-12 h-12 rounded-full"
          />
        )}
        
        <div>
          <h3 className="text-lg font-medium">{session.user.name}</h3>
          <p className="text-sm text-gray-500">{session.user.email}</p>
          
          <div className="mt-2">
            <h4 className="text-xs font-medium text-gray-500">Roles:</h4>
            <div className="flex flex-wrap gap-1 mt-1">
              {roles.map(role => (
                <span 
                  key={role}
                  className="px-2 py-1 text-xs font-medium text-white bg-blue-500 rounded-full"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {isAdmin() && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium">Admin Options</h4>
          {/* Admin-specific UI options */}
        </div>
      )}
    </div>
  );
}
```

### Phase 5: Testing & Refinement

#### 5.1 Authentication Flow Testing

- Verify Microsoft sign-in flow
- Confirm access to Microsoft Graph data (profile, photo)
- Test sign-out flow

#### 5.2 Role Assignment Testing

- Verify app role assignments from Azure AD are correctly recognized
- Test access control when assigning/removing roles in Azure AD
- Validate default role assignment for users without assigned roles

#### 5.3 Access Control Testing

- Test client-side role-based UI rendering
- Verify server-side route protection
- Ensure API endpoints respect role-based permissions

#### 5.4 Error Handling

- Implement and test error boundaries for authentication failures
- Add proper error messages for unauthorized access attempts
- Create fallback experiences when role information is missing

## Implementation Timeline

1. **Week 1**: Phase 1 - Microsoft Provider Integration
2. **Week 1-2**: Phase 2 - Role Management
3. **Week 2-3**: Phase 3 - RBAC Implementation
4. **Week 3-4**: Phase 4 - Authentication UI
5. **Week 4**: Phase 5 - Testing & Refinement

## Conclusion

This implementation plan provides a structured approach to integrating Microsoft Enterprise authentication with role-based access control. By following these phases, we will create a robust authentication system that uses Azure AD app roles to control access across our application.

The approach is simplified by using app roles directly from Azure AD rather than mapping groups to roles, resulting in clearer role management and easier troubleshooting.
