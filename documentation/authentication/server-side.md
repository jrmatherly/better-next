# Server-Side Authentication

This document covers server-side authentication with BetterAuth, including session access, protected routes, and server components integration.

## Server Session Access

### Getting the Session in Server Components

Access the user's session in server components:

```typescript
// In a server component
import { headers } from 'next/headers';
import { auth } from '@/lib/auth/server';
import type { ExtendedSession } from '@/types/auth.d';

export default async function ProfilePage() {
  // Get the session using the official BetterAuth approach
  const session = await auth.api.getSession({
    headers: await headers(),
  }) as ExtendedSession | null;
  
  if (!session?.user) {
    // Handle unauthenticated state
    return (
      <div>
        <h1>Profile</h1>
        <p>Please sign in to view your profile</p>
      </div>
    );
  }
  
  // Use the user's data from the session
  return (
    <div>
      <h1>Profile</h1>
      <p>Welcome, {session.user.name || session.user.email}</p>
      
      {/* Access roles from the session */}
      {session.user.roles && (
        <div>
          <h2>Your Roles</h2>
          <ul>
            {session.user.roles.map(role => (
              <li key={role}>{role}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### Session Utility Function

Create a reusable function to get the session with proper typing:

```typescript
// src/lib/auth/session.ts
import { headers } from 'next/headers';
import { auth } from '@/lib/auth/server';
import type { ExtendedSession } from '@/types/auth.d';

/**
 * Get the server session with proper typing
 */
export async function getServerSession(): Promise<ExtendedSession | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    // If no session, return null
    if (!session) return null;
    
    // Cast to ExtendedSession type
    return session as ExtendedSession;
  } catch (error) {
    console.error('Error getting server session:', error);
    return null;
  }
}
```

## Protected Server Components

Create a higher-order component for role-based protection:

```typescript
// src/lib/auth/protect.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth/session';
import { ROLES, type Role } from '@/types/roles';
import { checkRoleAccess } from '@/lib/auth/guards';

interface ProtectOptions {
  redirectTo?: string;
  requireAll?: boolean;
}

/**
 * Higher-order function to protect server components with role-based access
 * 
 * @param Component The server component to protect
 * @param allowedRoles Roles that are allowed to access this component
 * @param options Configuration options
 */
export function withRoleProtection<T>(
  Component: (props: T) => Promise<React.ReactNode> | React.ReactNode,
  allowedRoles: Role[],
  options: ProtectOptions = {}
) {
  const { redirectTo = '/unauthorized', requireAll = false } = options;
  
  return async function ProtectedComponent(props: T) {
    // Get the user's session
    const session = await getServerSession();
    
    // Not authenticated, redirect to sign in
    if (!session?.user) {
      redirect('/api/auth/signin');
    }
    
    // Check if user has the required roles
    const hasAccess = checkRoleAccess(session, allowedRoles, requireAll);
    
    // If no access, redirect to unauthorized page
    if (!hasAccess) {
      redirect(redirectTo);
    }
    
    // User has the required roles, render the component
    return Component(props);
  };
}
```

### Example Usage

```typescript
// src/app/admin/page.tsx
import { withRoleProtection } from '@/lib/auth/protect';
import { ROLES } from '@/types/roles';

async function AdminPage() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      {/* Admin content */}
    </div>
  );
}

// Protect the component, only allowing admins
export default withRoleProtection(AdminPage, [ROLES.ADMIN]);
```

## Role-Based Server Actions

Add role checks to server actions:

```typescript
// src/app/admin/user/actions.ts
'use server'

import { auth } from '@/lib/auth/server';
import { getServerSession } from '@/lib/auth/session';
import { ROLES, type Role } from '@/types/roles';

/**
 * Update a user's roles
 * Only administrators can perform this action
 */
export async function updateUserRoles(userId: string, roles: Role[]) {
  try {
    // Get the current user's session
    const session = await getServerSession();
    
    // Check if the user is an admin
    if (!session?.user?.roles?.includes(ROLES.ADMIN)) {
      return { success: false, error: 'Unauthorized - Admin access required' };
    }
    
    // Update the user's roles
    await auth.api.updateUser({
      id: userId,
      data: { roles }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating user roles:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
```

## Route Handlers (API Routes)

Protect API routes with role-based middleware:

```typescript
// src/app/api/admin-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withRoleGuard } from '@/lib/auth/guards';
import { ROLES } from '@/types/roles';

// Role guard middleware
const adminGuard = withRoleGuard([ROLES.ADMIN]);

export async function GET(req: NextRequest) {
  // Check admin role first
  const unauthorizedResponse = await adminGuard(req);
  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }
  
  // User is authenticated and has admin role, proceed with the request
  return NextResponse.json({
    data: 'Sensitive admin data',
    timestamp: new Date().toISOString(),
  });
}
```

## The ExtendedSession Type

The `ExtendedSession` type extends the default BetterAuth session with additional properties:

```typescript
// This is defined in src/types/auth.d.ts
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
```

## Session Enhancement

During authentication, sessions are enhanced with roles from the token:

```typescript
// src/lib/auth/hooks.ts
import { ROLES } from '@/types/roles';
import { parseRoles } from '@/lib/auth/role-utils';
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

  // Extract roles from token
  const userRoles = parseRoles(token?.roles);
  
  // If no valid roles were assigned, set default role
  if (userRoles.length === 0) {
    userRoles.push(ROLES.USER);
  }
  
  // Extract groups if available
  const userGroups = Array.isArray(token?.groups) 
    ? token.groups.filter((group: unknown): group is string => typeof group === 'string')
    : [];
  
  // Return enhanced session with roles
  return {
    ...session,
    user: {
      ...session.user,
      roles: userRoles,
      ...(userGroups.length > 0 && { groups: userGroups }),
    },
  };
};
```

## Server-Side User Management

```typescript
'use server'

import { auth } from '@/lib/auth/server';
import { getServerSession } from '@/lib/auth/session';
import { ROLES, type Role } from '@/types/roles';

/**
 * Create a new user with specified roles
 * Only administrators can create users
 */
export async function createUser(data: {
  email: string;
  password: string;
  name?: string;
  roles?: Role[];
}) {
  try {
    // Verify admin permission
    const session = await getServerSession();
    
    if (!session?.user?.roles?.includes(ROLES.ADMIN)) {
      return { success: false, error: 'Unauthorized - Admin access required' };
    }
    
    // Create the user with specified roles
    const user = await auth.api.createUser({
      email: data.email,
      password: data.password,
      name: data.name,
      // Add roles (defaulting to basic user)
      roles: data.roles || [ROLES.USER],
    });
    
    return { success: true, user };
  } catch (error) {
    console.error('Failed to create user:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get user by ID with role-based permission check
 */
export async function getUserById(userId: string) {
  try {
    const session = await getServerSession();
    
    // Only admins or the user themselves can access user data
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }
    
    const isAdmin = session.user.roles?.includes(ROLES.ADMIN);
    const isSelf = session.user.id === userId;
    
    if (!isAdmin && !isSelf) {
      return { success: false, error: 'Forbidden - Insufficient permissions' };
    }
    
    const user = await auth.api.getUser(userId);
    return { success: true, user };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Delete user by ID (admin only)
 */
export async function deleteUserById(userId: string) {
  try {
    const session = await getServerSession();
    
    // Only admins can delete users
    if (!session?.user?.roles?.includes(ROLES.ADMIN)) {
      return { success: false, error: 'Unauthorized - Admin access required' };
    }
    
    await auth.api.deleteUser(userId);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
```

## Session Management Operations

```typescript
'use server'

import { auth } from '@/lib/auth/server';
import { getServerSession } from '@/lib/auth/session';
import { ROLES } from '@/types/roles';

/**
 * List all sessions for a user
 * Only admins or the user themselves can list sessions
 */
export async function listUserSessions(userId: string) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }
    
    const isAdmin = session.user.roles?.includes(ROLES.ADMIN);
    const isSelf = session.user.id === userId;
    
    if (!isAdmin && !isSelf) {
      return { success: false, error: 'Forbidden - Insufficient permissions' };
    }
    
    const sessions = await auth.api.getUserSessions(userId);
    return { success: true, sessions };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Revoke a specific session
 * Only admins or the user themselves can revoke sessions
 */
export async function revokeSession(sessionId: string) {
  try {
    const currentSession = await getServerSession();
    
    if (!currentSession?.user) {
      return { success: false, error: 'Unauthorized' };
    }
    
    // Get the session to be revoked to check ownership
    const sessionToRevoke = await auth.api.getSession({ sessionId });
    
    if (!sessionToRevoke) {
      return { success: false, error: 'Session not found' };
    }
    
    const isAdmin = currentSession.user.roles?.includes(ROLES.ADMIN);
    const isSelf = sessionToRevoke.user.id === currentSession.user.id;
    
    if (!isAdmin && !isSelf) {
      return { success: false, error: 'Forbidden - Insufficient permissions' };
    }
    
    await auth.api.revokeSession({ sessionId });
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Revoke all sessions for a user except the current one
 * Only admins or the user themselves can perform this action
 */
export async function revokeOtherSessions(userId: string) {
  try {
    const currentSession = await getServerSession();
    
    if (!currentSession?.user) {
      return { success: false, error: 'Unauthorized' };
    }
    
    const isAdmin = currentSession.user.roles?.includes(ROLES.ADMIN);
    const isSelf = currentSession.user.id === userId;
    
    if (!isAdmin && !isSelf) {
      return { success: false, error: 'Forbidden - Insufficient permissions' };
    }
    
    // Get the current session ID
    const currentSessionId = auth.api.getSessionId();
    
    if (!currentSessionId) {
      return { success: false, error: 'Failed to identify current session' };
    }
    
    // Get all sessions for the user
    const sessions = await auth.api.getUserSessions(userId);
    
    // Revoke all sessions except the current one
    await Promise.all(
      sessions
        .filter(session => session.id !== currentSessionId)
        .map(session => auth.api.revokeSession({ sessionId: session.id }))
    );
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
```

## Authentication Hooks

BetterAuth supports hooks for customizing authentication behavior:

```typescript
// In your auth configuration
import { auth } from '@/lib/auth/server';
import { ROLES, type Role } from '@/types/roles';
import { parseRoles } from '@/lib/auth/role-utils';

// Example of extending the auth config with hooks
const configWithHooks = {
  // ... other configuration
  
  hooks: {
    // Before hooks
    async beforeSignIn({ provider, credentials }) {
      // Log sign-in attempts in development
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Sign in attempt with ${provider}`);
      }
      
      // Example: Implement rate limiting for specific providers
      if (provider === 'email-password') {
        // Check rate limiting
        // This is where you might implement IP-based rate limiting
      }
      
      // Return modified credentials or undefined to continue
      return undefined;
    },
    
    async beforeSignUp({ credentials }) {
      // Validate or modify credentials before sign up
      if (credentials.email.includes('example.com')) {
        throw new Error('example.com emails are not allowed to register');
      }
      
      // You could add additional validation
      // or pre-processing of user data here
      
      return undefined;
    },
    
    // After hooks
    async afterSignIn({ user, account, isNewUser }) {
      // Custom logic after successful sign in
      console.log(`User ${user.email} signed in successfully`);
      
      // Example: Record login timestamp
      await auth.api.updateUser({
        id: user.id,
        data: {
          lastLogin: new Date(),
        }
      });
      
      // Example: Extract roles from token for social sign-ins
      if (account?.provider === 'microsoft' && account.access_token) {
        // Get token info from Microsoft
        const tokenInfo = await fetchMicrosoftTokenInfo(account.access_token);
        
        // Extract and set roles
        if (tokenInfo.roles) {
          const roles = parseRoles(tokenInfo.roles);
          
          await auth.api.updateUser({
            id: user.id,
            data: { roles },
          });
        }
      }
    },
    
    async afterSignUp({ user }) {
      // Custom logic after successful sign up
      console.log(`New user registered: ${user.email}`);
      
      // Assign default role to new users
      await auth.api.updateUser({
        id: user.id,
        data: {
          roles: [ROLES.USER],
        }
      });
      
      // Example: Send welcome email or provision resources
      // await sendWelcomeEmail(user.email);
    },
  },
};

// Helper function to fetch token info (implementation depends on your requirements)
async function fetchMicrosoftTokenInfo(accessToken: string) {
  // This would typically make a request to Microsoft's token info endpoint
  // Example implementation
  try {
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching token info:', error);
    return {};
  }
}
```

## Protected API Routes with Context

Create API routes with custom context and role-based protection:

```typescript
// src/app/api/protected-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/session';
import { ROLES, type Role } from '@/types/roles';

// Define a type for your context
interface RequestContext {
  session: ExtendedSession;
  requestInfo: {
    ip: string | null;
    userAgent: string | null;
    path: string;
  };
}

// Create a middleware that builds context and checks roles
async function withContext(
  req: NextRequest,
  allowedRoles: Role[] = [],
  requireAll = false
): Promise<{ context: RequestContext | null; response: NextResponse | null }> {
  // Get the session
  const session = await getServerSession();
  
  // Not authenticated
  if (!session?.user) {
    return {
      context: null,
      response: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    };
  }
  
  // Check roles if specified
  if (allowedRoles.length > 0) {
    const userRoles = session.user.roles || [];
    
    const hasAccess = requireAll
      ? allowedRoles.every(role => userRoles.includes(role))
      : allowedRoles.some(role => userRoles.includes(role));
    
    if (!hasAccess) {
      return {
        context: null,
        response: NextResponse.json(
          { error: 'Forbidden - Insufficient permissions' },
          { status: 403 }
        )
      };
    }
  }
  
  // Create context with request information
  const context: RequestContext = {
    session,
    requestInfo: {
      ip: req.ip || req.headers.get('x-forwarded-for'),
      userAgent: req.headers.get('user-agent'),
      path: req.nextUrl.pathname,
    },
  };
  
  return { context, response: null };
}

// GET endpoint with admin-only access
export async function GET(req: NextRequest) {
  const { context, response } = await withContext(req, [ROLES.ADMIN]);
  
  // Return early if auth failed
  if (response) return response;
  
  // Use context in your handler
  const { session, requestInfo } = context!;
  
  console.log(`Admin data requested by ${session.user.email} from ${requestInfo.ip}`);
  
  return NextResponse.json({
    message: 'Protected admin data',
    user: session.user,
    timestamp: new Date().toISOString(),
  });
}

// POST endpoint with multiple allowed roles
export async function POST(req: NextRequest) {
  const { context, response } = await withContext(
    req, 
    [ROLES.ADMIN, ROLES.SECURITY, ROLES.DEVOPS]
  );
  
  // Return early if auth failed
  if (response) return response;
  
  try {
    // Parse request body
    const body = await req.json();
    
    // Use context in your handler
    const { session } = context!;
    
    // Process authenticated request with body data
    return NextResponse.json({
      message: 'Data processed successfully',
      processedBy: session.user.email,
      data: body,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request data' },
      { status: 400 }
    );
  }
}
```

## Custom Authentication Logic

For complex authentication scenarios, you can implement custom logic:

```typescript
'use server'

import { auth } from '@/lib/auth/server';
import { cookies } from 'next/headers';
import { ROLES, type Role } from '@/types/roles';

/**
 * Custom sign-in with additional verification
 * This example adds multi-factor authentication
 */
export async function customSignInWithMFA(email: string, password: string, mfaCode: string) {
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
    const session = await auth.api.createSession({
      userId: user.id,
      // Set session expiry
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
    });
    
    // Get session cookie options from auth config
    const cookieOptions = auth.getCookieOptions();
    
    // Set session cookie
    cookies().set(
      auth.getCookieName(),
      session.sessionToken,
      cookieOptions
    );
    
    return { success: true, user };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Validate MFA code (implementation will depend on your MFA solution)
 */
async function validateMfaCode(userId: string, code: string): Promise<boolean> {
  // This is a placeholder - implement your MFA validation logic
  // For example, you might use TOTP, SMS, or email verification
  
  // Example implementation for a time-based one-time password (TOTP)
  try {
    // Look up user's MFA secret
    const user = await auth.api.getUser(userId);
    const mfaSecret = user.mfaSecret;
    
    if (!mfaSecret) {
      return false; // MFA not set up for this user
    }
    
    // Validate TOTP
    // In a real implementation, you would use a library like 'otplib'
    // return otplib.authenticator.verify({ token: code, secret: mfaSecret });
    
    return code === '123456'; // Placeholder - NEVER use in production
  } catch (error) {
    console.error('MFA validation error:', error);
    return false;
  }
}
```

## Integrating with tRPC

For projects using tRPC, add session and role checks to your procedures:

```typescript
// src/server/api/trpc.ts
import { TRPCError } from '@trpc/server';
import { getServerSession } from '@/lib/auth/session';
import { ROLES, type Role } from '@/types/roles';

/**
 * Create a tRPC procedure that requires authentication
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const session = await getServerSession();
  
  if (!session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
  }
  
  return next({
    ctx: {
      ...ctx,
      session,
      user: session.user,
    },
  });
});

/**
 * Create a tRPC procedure that requires specific roles
 */
export function createRoleProtectedProcedure(
  allowedRoles: Role[],
  requireAll = false
) {
  return protectedProcedure.use(async ({ ctx, next }) => {
    const userRoles = ctx.session.user.roles || [];
    
    const hasAccess = requireAll
      ? allowedRoles.every(role => userRoles.includes(role))
      : allowedRoles.some(role => userRoles.includes(role));
    
    if (!hasAccess) {
      throw new TRPCError({ 
        code: 'FORBIDDEN', 
        message: 'Insufficient role permissions' 
      });
    }
    
    return next({ ctx });
  });
}

// Create specific role-protected procedures
export const adminProcedure = createRoleProtectedProcedure([ROLES.ADMIN]);
export const securityProcedure = createRoleProtectedProcedure([ROLES.SECURITY, ROLES.ADMIN]);
```

## Impersonation in Server Components

Handle impersonation state in server components:

```typescript
// src/components/admin/user-impersonation.tsx
import { getServerSession } from '@/lib/auth/session';
import { ROLES } from '@/types/roles';
import { ImpersonationControls } from '@/components/auth/impersonation-controls';

export async function UserImpersonation() {
  const session = await getServerSession();
  
  // Only admin users should see impersonation controls
  if (!session?.user?.roles?.includes(ROLES.ADMIN)) {
    return null;
  }
  
  return (
    <div className="mt-6 p-4 border rounded">
      <h2 className="text-lg font-semibold">Role Impersonation</h2>
      <p className="text-sm text-gray-600 mb-4">
        Test the application with different user roles.
      </p>
      
      {/* Client component with impersonation controls */}
      <ImpersonationControls />
    </div>
  );
}
```

## Security Considerations

1. **Always Verify Server-Side**: Never rely solely on client-side role checks.

2. **Session Encryption**: Ensure session data is encrypted in transit and at rest.

3. **Role Validation**: Validate roles against a predefined list (as we do with the `ROLES` constant).

4. **No Sensitive Data in Session**: Keep only necessary information in the session.

5. **Refresh Validation**: Validate roles on session refresh.

6. **Proper Error Handling**: Return appropriate HTTP status codes (401, 403) for authentication/authorization failures.

7. **CSRF Protection**: Implement CSRF protection for all mutating actions.

8. **Secure Cookies**: Use secure, HTTP-only cookies for session storage.

9. **Role Impersonation**: Limit role impersonation to administrators and ensure proper security controls.

10. **Audit Logging**: Log authentication events, role changes, and security-sensitive actions.
