# Server-Side Authentication

This document covers server-side authentication capabilities in BetterAuth, including how to access and validate user sessions, protect routes, and perform server-side authentication operations.

## Server Session Access

BetterAuth provides several methods to access the user's session on the server side.

### In Next.js App Router

#### In Server Components

```tsx
// In a server component
import { getServerSession } from 'better-auth/integrations/next';
import { authConfig } from '@/lib/auth/config';

export default async function DashboardPage() {
  const session = await getServerSession(authConfig);
  
  if (!session) {
    // Handle unauthenticated state (redirect or display message)
    return <div>Please sign in to access this page</div>;
  }
  
  // Access user information
  const { user } = session;
  
  return (
    <div>
      <h1>Welcome, {user.name || user.email}</h1>
      <p>Your role(s): {user.roles?.join(', ') || 'No roles assigned'}</p>
      
      {/* Render dashboard content */}
    </div>
  );
}
```

#### In Route Handlers (API Routes)

```typescript
// In app/api/user-data/route.ts
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
  
  // Process authenticated request
  return NextResponse.json({
    user: session.user,
    message: 'Authenticated successfully',
  });
}
```

#### In Server Actions

```typescript
'use server'

import { getServerSession } from 'better-auth/integrations/next';
import { authConfig } from '@/lib/auth/config';

export async function fetchUserData() {
  const session = await getServerSession(authConfig);
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  // Return user data or fetch from database
  return {
    user: session.user,
    // Add additional user data
  };
}
```

## Role-Based Access Control

### Checking User Roles

```typescript
import { getServerSession } from 'better-auth/integrations/next';
import { authConfig } from '@/lib/auth/config';

// Function to check if user has required roles
export async function hasRequiredRoles(requiredRoles: string[] = []) {
  const session = await getServerSession(authConfig);
  
  if (!session) {
    return false;
  }
  
  const userRoles = session.user.roles || [];
  
  // Check if user has any of the required roles
  return requiredRoles.some(role => userRoles.includes(role));
}

// Example usage in a server component
export default async function AdminPage() {
  const isAdmin = await hasRequiredRoles(['admin']);
  
  if (!isAdmin) {
    return <div>Unauthorized: Admin access required</div>;
  }
  
  return <AdminDashboard />;
}
```

### Create Role-Based Middleware

```typescript
// In middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createNextMiddleware } from 'better-auth/integrations/next';
import { authConfig } from './lib/auth/config';

const betterAuthMiddleware = createNextMiddleware(authConfig);

export default async function middleware(req: NextRequest) {
  // Run BetterAuth middleware first
  const res = await betterAuthMiddleware(req);
  if (res) return res;
  
  // Get session from request - BetterAuth attaches it
  const session = (req as any).session;
  
  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    const userRoles = session.user.roles || [];
    if (!userRoles.includes('admin')) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }
  
  // Continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};
```

## Server-Side Authentication Operations

### User Management

```typescript
'use server'

import { BetterAuth } from 'better-auth';
import { authConfig } from '@/lib/auth/config';

// Initialize BetterAuth instance
const auth = new BetterAuth(authConfig);

// Create a new user
export async function createUser(data: {
  email: string;
  password: string;
  name?: string;
  roles?: string[];
}) {
  try {
    const user = await auth.user.create({
      email: data.email,
      password: data.password,
      name: data.name,
      // Add custom fields
      roles: data.roles || ['user'],
    });
    
    return { success: true, user };
  } catch (error) {
    console.error('Failed to create user:', error);
    return { success: false, error: error.message };
  }
}

// Get user by ID
export async function getUserById(userId: string) {
  try {
    const user = await auth.user.getById(userId);
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Update user roles
export async function updateUserRoles(userId: string, roles: string[]) {
  try {
    const user = await auth.user.update(userId, {
      roles,
    });
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Delete user
export async function deleteUserById(userId: string) {
  try {
    await auth.user.delete(userId);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### Session Management

```typescript
'use server'

import { BetterAuth } from 'better-auth';
import { authConfig } from '@/lib/auth/config';

const auth = new BetterAuth(authConfig);

// List sessions for a user
export async function listUserSessions(userId: string) {
  try {
    const sessions = await auth.session.list(userId);
    return { success: true, sessions };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Revoke a specific session
export async function revokeSession(sessionId: string) {
  try {
    await auth.session.revoke(sessionId);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Revoke all sessions for a user except current
export async function revokeOtherSessions(userId: string, currentSessionId: string) {
  try {
    const sessions = await auth.session.list(userId);
    
    // Revoke all sessions except the current one
    await Promise.all(
      sessions
        .filter(session => session.id !== currentSessionId)
        .map(session => auth.session.revoke(session.id))
    );
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

## Role-Based Access Control Helpers

```typescript
// In lib/auth/rbac.ts
import { getServerSession } from 'better-auth/integrations/next';
import { authConfig } from '@/lib/auth/config';

export type Role = 'admin' | 'devops' | 'security' | 'dba' | 'fieldtech' | 'endpoint' | 'collab' | 'user';

// Function to check if user has any of the required roles
export async function checkUserRoles(requiredRoles: Role[]) {
  const session = await getServerSession(authConfig);
  
  if (!session) {
    return false;
  }
  
  const userRoles = session.user.roles || [];
  return requiredRoles.some(role => userRoles.includes(role));
}

// Function to check if user has admin role
export async function isAdmin() {
  return checkUserRoles(['admin']);
}

// Function to check if user has specific role
export async function hasRole(role: Role) {
  return checkUserRoles([role]);
}

// Get the highest role from a user's roles list
export function getHighestRole(roles: string[] = []): Role | null {
  const roleHierarchy: Role[] = [
    'admin',
    'security',
    'devops',
    'dba',
    'tcc',
    'fieldtech',
    'endpoint',
    'collab',
    'user'
  ];
  
  for (const role of roleHierarchy) {
    if (roles.includes(role)) {
      return role as Role;
    }
  }
  
  return null;
}

// Guard function for server components
export async function withRoleGuard(
  component: React.ReactNode,
  fallback: React.ReactNode,
  requiredRoles: Role[]
) {
  const hasPermission = await checkUserRoles(requiredRoles);
  
  if (!hasPermission) {
    return fallback;
  }
  
  return component;
}
```

## Impersonation Mode

BetterAuth can be extended to support impersonation, which allows administrators to temporarily assume another user's permissions:

```typescript
// In lib/auth/impersonation.ts
'use server'

import { cookies } from 'next/headers';
import { BetterAuth } from 'better-auth';
import { authConfig } from '@/lib/auth/config';
import { getServerSession } from 'better-auth/integrations/next';

const auth = new BetterAuth(authConfig);

// Start impersonation
export async function startImpersonation(targetRole: string) {
  const session = await getServerSession(authConfig);
  
  if (!session) {
    throw new Error('Not authenticated');
  }
  
  // Check if user is admin
  const userRoles = session.user.roles || [];
  if (!userRoles.includes('admin')) {
    throw new Error('Only administrators can impersonate users');
  }
  
  // Store original roles in a secure cookie
  const originalRoles = JSON.stringify(userRoles);
  cookies().set('original-roles', originalRoles, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
  });
  
  // Update the user's session with new role
  await auth.session.update(session.sessionToken, {
    user: {
      ...session.user,
      roles: [targetRole],
      isImpersonating: true,
      impersonatedRole: targetRole,
    },
  });
  
  return { success: true };
}

// End impersonation
export async function endImpersonation() {
  const session = await getServerSession(authConfig);
  
  if (!session) {
    throw new Error('Not authenticated');
  }
  
  // Get original roles from cookie
  const originalRolesCookie = cookies().get('original-roles');
  if (!originalRolesCookie) {
    throw new Error('No impersonation in progress');
  }
  
  const originalRoles = JSON.parse(originalRolesCookie.value);
  
  // Restore original roles
  await auth.session.update(session.sessionToken, {
    user: {
      ...session.user,
      roles: originalRoles,
      isImpersonating: undefined,
      impersonatedRole: undefined,
    },
  });
  
  // Clear the cookie
  cookies().delete('original-roles');
  
  return { success: true };
}

// Check if user is impersonating
export async function isImpersonating() {
  const session = await getServerSession(authConfig);
  
  if (!session) {
    return false;
  }
  
  return !!session.user.isImpersonating;
}
```

## Authentication Hooks (Before/After)

BetterAuth supports before and after hooks for authentication events:

```typescript
// In auth config
export const authConfig = {
  // Other config...
  
  hooks: {
    // Before hooks
    async beforeSignIn({ provider, credentials }) {
      // Custom logic before sign in
      console.log(`Sign in attempt with ${provider}`);
      
      // Example: Add rate limiting for specific providers
      if (provider === 'email-password') {
        // Check rate limiting
      }
      
      // Return modified credentials or undefined to continue
      return undefined;
    },
    
    async beforeSignUp({ credentials }) {
      // Validate or modify credentials before sign up
      if (credentials.email.includes('example.com')) {
        throw new Error('example.com emails are not allowed to register');
      }
      
      return undefined;
    },
    
    // After hooks
    async afterSignIn({ user, account, isNewUser }) {
      // Custom logic after successful sign in
      console.log(`User ${user.email} signed in successfully`);
      
      // Example: Record login timestamp
      await auth.user.update(user.id, {
        lastLogin: new Date(),
      });
      
      // Example: Assign default role to new users
      if (isNewUser) {
        await auth.user.update(user.id, {
          roles: ['user'],
        });
      }
    },
    
    async afterSignUp({ user }) {
      // Custom logic after successful sign up
      console.log(`New user registered: ${user.email}`);
      
      // Example: Send welcome email or provision resources
    },
  },
};
```

## Protected API Routes with Context

```typescript
// In app/api/protected-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandler } from 'better-auth/integrations/next';
import { authConfig } from '@/lib/auth/config';

// Create a handler with custom context
const handler = createRouteHandler({
  config: authConfig,
  
  // Require authentication for all methods
  requireAuth: true,
  
  // Define allowed roles (optional)
  allowedRoles: ['admin', 'user'],
  
  // Create context from request and session
  async createContext({ req, session }) {
    // Add custom context data
    return {
      session,
      requestInfo: {
        ip: req.ip,
        userAgent: req.headers.get('user-agent'),
        path: req.nextUrl.pathname,
      },
    };
  },
  
  // Define route handlers
  async GET({ context }) {
    const { session, requestInfo } = context;
    
    // Use session and context data
    console.log(`Request from ${requestInfo.ip} by user ${session.user.email}`);
    
    return NextResponse.json({
      message: 'Protected data',
      user: session.user,
    });
  },
  
  async POST({ context, req }) {
    const { session } = context;
    const body = await req.json();
    
    // Process authenticated request with body data
    
    return NextResponse.json({
      message: 'Data processed successfully',
    });
  },
});

export const { GET, POST } = handler;
```

## Custom Authentication Logic

For complex authentication scenarios, you can access the BetterAuth instance directly:

```typescript
'use server'

import { BetterAuth } from 'better-auth';
import { authConfig } from '@/lib/auth/config';
import { cookies } from 'next/headers';

const auth = new BetterAuth(authConfig);

// Custom sign in with additional verification
export async function customSignIn(email: string, password: string, mfaCode: string) {
  try {
    // First, validate credentials
    const user = await auth.emailPassword.validate({
      email,
      password,
    });
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Then, validate MFA code
    const isValidMfa = await validateMfaCode(user.id, mfaCode);
    if (!isValidMfa) {
      throw new Error('Invalid MFA code');
    }
    
    // Create session manually
    const session = await auth.session.create({
      userId: user.id,
      // Set session expiry
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
    });
    
    // Set session cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    };
    
    cookies().set(
      auth.options.session.cookie.name,
      session.sessionToken,
      cookieOptions
    );
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Helper function to validate MFA code
async function validateMfaCode(userId: string, code: string) {
  // Implement your MFA validation logic
  return true; // Placeholder
}
```

## Error Handling

```typescript
'use server'

import { BetterAuth, BetterAuthError } from 'better-auth';
import { authConfig } from '@/lib/auth/config';

const auth = new BetterAuth(authConfig);

export async function authenticateWithErrorHandling(email: string, password: string) {
  try {
    const user = await auth.emailPassword.validate({
      email,
      password,
    });
    
    return { success: true, user };
  } catch (error) {
    if (error instanceof BetterAuthError) {
      // Handle specific BetterAuth errors
      switch (error.code) {
        case 'user_not_found':
          return { success: false, error: 'User not found' };
        case 'invalid_credentials':
          return { success: false, error: 'Invalid email or password' };
        case 'email_not_verified':
          return { success: false, error: 'Please verify your email before signing in' };
        default:
          return { success: false, error: 'Authentication failed' };
      }
    } else {
      // Handle unexpected errors
      console.error('Unexpected error during authentication:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
}
```
