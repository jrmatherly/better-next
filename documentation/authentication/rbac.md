# Role-Based Access Control (RBAC)

This document covers how to implement Role-Based Access Control (RBAC) with BetterAuth, including role assignment, access control mechanisms, and best practices.

## RBAC Overview

Role-Based Access Control is a security approach that restricts system access to authorized users based on their assigned roles. BetterAuth provides built-in support for implementing RBAC for your application.

## Configuring User Roles

### Extending the User Schema

First, extend your user schema to include roles:

```prisma
// prisma/schema.prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  password      String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Add roles field
  roles         String[]  @default(["user"])
  
  // Relations
  accounts      Account[]
  sessions      Session[]
}
```

### Role Configuration

Define your application's roles and their hierarchy in a dedicated file:

```typescript
// lib/auth/roles.ts

// Define available roles
export const ROLES = {
  ADMIN: 'admin',
  SECURITY: 'security',
  DEVOPS: 'devops',
  DBA: 'dba',
  TCC: 'tcc',
  FIELDTECH: 'fieldtech',
  ENDPOINT: 'endpoint',
  COLLAB: 'collab',
  USER: 'user',
} as const;

export type Role = keyof typeof ROLES;

// Role hierarchy (ordered from highest to lowest privilege)
export const ROLE_HIERARCHY: Role[] = [
  'admin',
  'security',
  'devops',
  'dba',
  'tcc',
  'fieldtech',
  'endpoint',
  'collab',
  'user',
];

// Role descriptions for UI
export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  admin: 'Full system access and control',
  security: 'Security management and monitoring',
  devops: 'Infrastructure and deployment management',
  dba: 'Database administration and management',
  tcc: 'Technical control center operations',
  fieldtech: 'Field technical operations',
  endpoint: 'Endpoint security management',
  collab: 'Collaboration tools management',
  user: 'Standard user access',
};

// Role capabilities for documentation/permissions UI
export const ROLE_CAPABILITIES: Record<Role, string[]> = {
  admin: ['All system capabilities', 'User management', 'Role assignment'],
  security: ['Security alerts', 'Vulnerability management', 'Security reports'],
  devops: ['Deployment management', 'Infrastructure monitoring', 'System health'],
  dba: ['Database access', 'Data management', 'Query execution'],
  tcc: ['Control center operations', 'System monitoring', 'Incident response'],
  fieldtech: ['Field equipment access', 'Remote diagnostics', 'On-site support'],
  endpoint: ['Endpoint management', 'Device security', 'Software deployment'],
  collab: ['Collaboration tools', 'Communication systems', 'User support'],
  user: ['Application access', 'Personal settings', 'Basic features'],
};

// Role colors for UI elements
export const ROLE_COLORS: Record<Role, string> = {
  admin: 'destructive', // Uses ShadcN UI's destructive variant (red)
  security: 'bg-purple-500',
  devops: 'bg-blue-500',
  dba: 'bg-green-500',
  tcc: 'bg-orange-500',
  fieldtech: 'bg-yellow-500',
  endpoint: 'bg-pink-500',
  collab: 'bg-teal-500',
  user: 'bg-gray-500',
};
```

## Including Roles in Session

To access roles in your application, include them in the session:

```typescript
// In your auth config
export const authConfig = {
  // Other config...
  
  callbacks: {
    async session({ session, user }) {
      // Add roles to session
      return {
        ...session,
        user: {
          ...session.user,
          roles: user.roles || [],
        },
      };
    },
  },
};
```

## Assigning Roles

### During User Registration

```typescript
// In your auth config
export const authConfig = {
  // Other config...
  
  // Assign default roles
  callbacks: {
    async createUser({ user }) {
      // Assign default role to new users
      await prisma.user.update({
        where: { id: user.id },
        data: { roles: ['user'] },
      });
      
      return user;
    },
  },
};
```

### Admin Interface for Role Management

```tsx
'use client'

import { useState } from 'react';
import { ROLES, ROLE_DESCRIPTIONS } from '@/lib/auth/roles';
import { updateUserRoles } from './actions';

interface UserRolesProps {
  userId: string;
  currentRoles: string[];
}

export function UserRolesEditor({ userId, currentRoles }: UserRolesProps) {
  const [roles, setRoles] = useState<string[]>(currentRoles);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  
  const handleRoleToggle = (role: string) => {
    setRoles(prev => 
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    
    try {
      const result = await updateUserRoles(userId, roles);
      if (result.success) {
        setMessage('Roles updated successfully');
      } else {
        setMessage(`Failed to update roles: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-lg font-medium">User Roles</h3>
      
      <div className="space-y-2 mt-2">
        {Object.entries(ROLES).map(([key, role]) => (
          <label key={role} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={roles.includes(role)}
              onChange={() => handleRoleToggle(role)}
              className="rounded"
            />
            <span>{key}</span>
            <span className="text-gray-500 text-sm">
              ({ROLE_DESCRIPTIONS[role]})
            </span>
          </label>
        ))}
      </div>
      
      {message && (
        <p className={message.includes('Error') ? 'text-red-500' : 'text-green-500'}>
          {message}
        </p>
      )}
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        {isSubmitting ? 'Saving...' : 'Update Roles'}
      </button>
    </form>
  );
}

// Server action
'use server'

import { BetterAuth } from 'better-auth';
import { authConfig } from '@/lib/auth/config';
import { getServerSession } from 'better-auth/integrations/next';

const auth = new BetterAuth(authConfig);

export async function updateUserRoles(userId: string, roles: string[]) {
  try {
    // Check if current user is admin
    const session = await getServerSession(authConfig);
    
    if (!session || !session.user.roles.includes('admin')) {
      return { success: false, error: 'Unauthorized' };
    }
    
    // Update user roles
    const updatedUser = await auth.user.update(userId, {
      roles,
    });
    
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Failed to update user roles:', error);
    return { success: false, error: error.message };
  }
}
```

## Access Control Implementation

### Client-Side Access Control

#### Role-Based Access Hook

```typescript
'use client'

import { useSession } from '@/lib/auth/client';

export function useAccess() {
  const { data: session, status } = useSession();
  const userRoles = session?.user?.roles || [];
  
  return {
    isAuthenticated: status === 'authenticated',
    roles: userRoles,
    
    // Check if user has specific role
    hasRole: (role: string) => userRoles.includes(role),
    
    // Check if user has any of the specified roles
    hasAnyRole: (roles: string[]) => roles.some(role => userRoles.includes(role)),
    
    // Check if user has all specified roles
    hasAllRoles: (roles: string[]) => roles.every(role => userRoles.includes(role)),
    
    // Shorthand methods for common roles
    isAdmin: () => userRoles.includes('admin'),
    isSecurity: () => userRoles.includes('security'),
    isUser: () => userRoles.includes('user'),
  };
}
```

#### Protected Components

```tsx
'use client'

import { ReactNode } from 'react';
import { useAccess } from '@/hooks/use-access';

interface RoleGuardProps {
  children: ReactNode;
  requiredRoles: string[];
  fallback?: ReactNode;
  requireAll?: boolean; // If true, user must have all roles; if false, any role is sufficient
}

export function RoleGuard({
  children,
  requiredRoles,
  fallback = null,
  requireAll = false,
}: RoleGuardProps) {
  const access = useAccess();
  
  if (!access.isAuthenticated) {
    return fallback;
  }
  
  const hasAccess = requireAll
    ? access.hasAllRoles(requiredRoles)
    : access.hasAnyRole(requiredRoles);
  
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
```

Usage:

```tsx
// In a component or page
import { RoleGuard } from '@/components/role-guard';

export default function AdminPanel() {
  return (
    <RoleGuard
      requiredRoles={['admin']}
      fallback={<div>You need admin access to view this page</div>}
    >
      <div>
        <h1>Admin Panel</h1>
        {/* Admin content */}
      </div>
    </RoleGuard>
  );
}
```

### Server-Side Access Control

#### Role-Based Middleware

```typescript
// In middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createNextMiddleware } from 'better-auth/integrations/next';
import { authConfig } from './lib/auth/config';

const betterAuthMiddleware = createNextMiddleware(authConfig);

// Define role-based path protection
const PROTECTED_PATHS = {
  '/admin': ['admin'],
  '/security': ['admin', 'security'],
  '/devops': ['admin', 'devops'],
  '/app/settings': ['admin', 'user'],
};

export default async function middleware(req: NextRequest) {
  // Run BetterAuth middleware first
  const res = await betterAuthMiddleware(req);
  if (res) return res;
  
  // Get session from request - BetterAuth attaches it
  const session = (req as any).session;
  
  if (!session) {
    // Not authenticated - redirect to login for protected paths
    const path = req.nextUrl.pathname;
    if (Object.keys(PROTECTED_PATHS).some(prefix => path.startsWith(prefix))) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    return NextResponse.next();
  }
  
  // Check role-based access
  const userRoles = session.user.roles || [];
  const path = req.nextUrl.pathname;
  
  // Check each protected path prefix
  for (const [pathPrefix, requiredRoles] of Object.entries(PROTECTED_PATHS)) {
    if (path.startsWith(pathPrefix)) {
      // Check if user has any of the required roles
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
      
      if (!hasRequiredRole) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
      
      break;
    }
  }
  
  // Continue with the request
  return NextResponse.next();
}
```

#### Server Component Role Guards

```tsx
// In a server component
import { getServerSession } from 'better-auth/integrations/next';
import { authConfig } from '@/lib/auth/config';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const session = await getServerSession(authConfig);
  
  if (!session) {
    redirect('/login');
  }
  
  const userRoles = session.user.roles || [];
  
  if (!userRoles.includes('admin')) {
    redirect('/unauthorized');
  }
  
  // Render admin content
  return (
    <div>
      <h1>Admin Dashboard</h1>
      {/* Admin content */}
    </div>
  );
}
```

#### Role Check Utility

```typescript
// In lib/auth/role-check.ts
import { getServerSession } from 'better-auth/integrations/next';
import { authConfig } from '@/lib/auth/config';

export type Role = 'admin' | 'security' | 'devops' | 'dba' | 'tcc' | 'fieldtech' | 'endpoint' | 'collab' | 'user';

// Check if user has required roles
export async function checkUserRoles(requiredRoles: Role | Role[], requireAll = false) {
  const session = await getServerSession(authConfig);
  
  if (!session) {
    return false;
  }
  
  const userRoles = session.user.roles || [];
  const rolesToCheck = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  
  return requireAll
    ? rolesToCheck.every(role => userRoles.includes(role))
    : rolesToCheck.some(role => userRoles.includes(role));
}

// Higher-order function for server components
export function withRoleCheck<T>(
  component: (props: T) => Promise<React.ReactNode>,
  requiredRoles: Role | Role[],
  options = { requireAll: false, redirectTo: '/unauthorized' }
) {
  return async (props: T) => {
    const hasAccess = await checkUserRoles(requiredRoles, options.requireAll);
    
    if (!hasAccess) {
      redirect(options.redirectTo);
    }
    
    return component(props);
  };
}
```

## API Route Protection

```typescript
// In app/api/admin-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'better-auth/integrations/next';
import { authConfig } from '@/lib/auth/config';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authConfig);
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  const userRoles = session.user.roles || [];
  
  if (!userRoles.includes('admin')) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }
  
  // Process admin request
  return NextResponse.json({
    data: 'Admin data',
  });
}
```

## Role-Based UI Elements

### Role-Dependent Navigation

```tsx
'use client'

import { useAccess } from '@/hooks/use-access';

export function Navigation() {
  const access = useAccess();
  
  return (
    <nav>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/app">Dashboard</a></li>
        
        {/* Admin-only links */}
        {access.isAdmin() && (
          <>
            <li><a href="/admin">Admin Panel</a></li>
            <li><a href="/admin/users">User Management</a></li>
          </>
        )}
        
        {/* Security links */}
        {access.hasRole('security') && (
          <li><a href="/security">Security Dashboard</a></li>
        )}
        
        {/* DevOps links */}
        {access.hasRole('devops') && (
          <li><a href="/devops">DevOps Dashboard</a></li>
        )}
        
        {/* User settings available to all authenticated users */}
        {access.isAuthenticated && (
          <li><a href="/settings">Settings</a></li>
        )}
      </ul>
    </nav>
  );
}
```

### Role Badges

Display a user's role with color-coded badges:

```tsx
'use client'

import { Badge } from '@/components/ui/badge';
import { ROLE_COLORS, ROLE_HIERARCHY } from '@/lib/auth/roles';
import { useSession } from '@/lib/auth/client';

export function UserRoleBadge() {
  const { data: session } = useSession();
  
  if (!session?.user?.roles?.length) {
    return null;
  }
  
  // Find the highest role in the hierarchy
  const userRoles = session.user.roles;
  const highestRole = ROLE_HIERARCHY.find(role => userRoles.includes(role));
  
  if (!highestRole) {
    return null;
  }
  
  return (
    <Badge 
      variant={highestRole === 'admin' ? 'destructive' : 'secondary'}
      className={`text-xs ${ROLE_COLORS[highestRole]}`}
    >
      {highestRole}
    </Badge>
  );
}
```

## Role Impersonation for Testing

For administrative users to test the application with different roles:

```tsx
'use client'

import { useState } from 'react';
import { ROLES } from '@/lib/auth/roles';
import { useSession } from '@/lib/auth/client';
import { startImpersonation, endImpersonation } from './actions';

export function RoleImpersonation() {
  const { data: session, status, update } = useSession();
  const [selectedRole, setSelectedRole] = useState('user');
  const [isLoading, setIsLoading] = useState(false);
  
  if (status !== 'authenticated') {
    return null;
  }
  
  const isAdmin = session?.user?.roles?.includes('admin');
  const isImpersonating = session?.user?.isImpersonating;
  
  if (!isAdmin && !isImpersonating) {
    return null;
  }
  
  const handleStartImpersonation = async () => {
    setIsLoading(true);
    try {
      await startImpersonation(selectedRole);
      // Update session to reflect changes
      await update();
    } catch (error) {
      console.error('Failed to start impersonation:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEndImpersonation = async () => {
    setIsLoading(true);
    try {
      await endImpersonation();
      // Update session to reflect changes
      await update();
    } catch (error) {
      console.error('Failed to end impersonation:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="p-4 border rounded-md">
      <h3 className="text-lg font-medium">Role Impersonation</h3>
      
      {isImpersonating ? (
        <div>
          <p className="text-amber-500">
            Currently impersonating: {session.user.impersonatedRole}
          </p>
          <button
            onClick={handleEndImpersonation}
            disabled={isLoading}
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded"
          >
            {isLoading ? 'Ending...' : 'End Impersonation'}
          </button>
        </div>
      ) : (
        <div className="flex flex-col space-y-2">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="border p-2 rounded"
          >
            {Object.entries(ROLES).map(([key, role]) => (
              <option key={role} value={role}>
                {key}
              </option>
            ))}
          </select>
          
          <button
            onClick={handleStartImpersonation}
            disabled={isLoading}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            {isLoading ? 'Starting...' : 'Start Impersonation'}
          </button>
        </div>
      )}
    </div>
  );
}
```

## Best Practices for RBAC

1. **Define Clear Role Hierarchies**: Establish a clear hierarchy of roles with well-defined capabilities.

2. **Principle of Least Privilege**: Assign users the minimum level of access required for their job function.

3. **Role Segregation**: Separate administrative and standard user roles to limit the impact of compromised accounts.

4. **Role Auditing**: Regularly audit role assignments to ensure they remain appropriate.

5. **Role Documentation**: Maintain clear documentation of what each role can access and what actions they can perform.

6. **Consistent Access Control**: Apply role checks consistently across client-side, server-side, and API routes.

7. **Role-Based UI**: Tailor the user interface to show only relevant elements based on the user's roles.

8. **Multiple Role Support**: Allow users to have multiple roles when needed to avoid role proliferation.

9. **Default Role Assignment**: Automatically assign a default role (e.g., 'user') to new users.

10. **Role-Based Testing**: Use impersonation to test the application from the perspective of different roles.

## Role-Based Security Considerations

1. **Protect Role Assignment**: Only allow administrators to modify user roles.

2. **Server-Side Verification**: Always verify roles on the server side, even if client-side checks exist.

3. **Role Data in JWT**: If using JWTs, include role information but be cautious about token size.

4. **Role Updates**: Force a session refresh when a user's roles are changed.

5. **Role Impersonation Security**: Limit impersonation to administrative users and implement safeguards.

6. **Audit Role Changes**: Log all role modification events for security auditing.

7. **Role-Based Rate Limiting**: Consider applying different rate limits based on user roles.

8. **Secure Role Storage**: Ensure roles are stored securely in your database.

9. **Role Escalation Prevention**: Prevent non-privileged users from escalating their own privileges.

10. **Cross-Site Request Forgery (CSRF) Protection**: Implement CSRF protection for role modification actions.
