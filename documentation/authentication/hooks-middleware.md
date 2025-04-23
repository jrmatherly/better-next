# Hooks and Middleware

This document covers BetterAuth hooks and middleware functionality, including before/after hooks, context management, and customizing the authentication flow.

## Hooks Overview

BetterAuth provides a powerful hooks system that allows you to intercept and modify authentication flows at various points. Hooks are callback functions that execute at specific times during the authentication process.

### Available Hooks

BetterAuth supports the following hooks:

#### Before Hooks (Pre-execution)

- `beforeSignIn` - Before a user signs in
- `beforeSignUp` - Before a user account is created
- `beforeCreateSession` - Before a new session is created
- `beforeUpdateUser` - Before a user is updated
- `beforeDeleteUser` - Before a user is deleted
- `beforeLinkAccount` - Before a social account is linked
- `beforeCreateVerificationToken` - Before creating an email verification token

#### After Hooks (Post-execution)

- `afterSignIn` - After a user successfully signs in
- `afterSignUp` - After a user account is successfully created
- `afterCreateSession` - After a new session is created
- `afterUpdateUser` - After a user is updated
- `afterDeleteUser` - After a user is deleted
- `afterLinkAccount` - After a social account is linked
- `afterCreateVerificationToken` - After creating an email verification token

## Configuring Hooks

Hooks are configured in your auth configuration file:

```typescript
// src/lib/auth/config.ts
import { PrismaClient } from '@prisma/client';
import type { BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

const prisma = new PrismaClient();

export const authConfig = {
  // Core configuration...
  appName: 'Your App Name',
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  
  // Configure hooks
  hooks: {
    // Before hooks
    async beforeSignIn({ provider, credentials }) {
      console.log(`Sign in attempt with ${provider}`);
      
      // Example: Add custom validation for email-password provider
      if (provider === 'email-password') {
        // Check if user is allowed to sign in
        const email = credentials.email;
        const blockedDomains = ['blocked-domain.com'];
        
        if (blockedDomains.some(domain => email.endsWith(`@${domain}`))) {
          throw new Error('This email domain is not allowed');
        }
      }
      
      // Return modified credentials or undefined to continue
      return undefined;
    },
    
    async beforeSignUp({ credentials }) {
      console.log(`Sign up attempt: ${credentials.email}`);
      
      // Example: Add custom validation
      if (credentials.email.includes('+')) {
        throw new Error('Email addresses with "+" are not allowed');
      }
      
      // Modify credentials
      return {
        ...credentials,
        email: credentials.email.toLowerCase().trim(),
      };
    },
    
    async beforeUpdateUser({ userId, data }) {
      console.log(`Updating user: ${userId}`);
      
      // Example: Prevent certain fields from being updated
      if (data.email && data.email.includes('@admin.com')) {
        throw new Error('Cannot use admin email domain');
      }
      
      // Return modified data or undefined to continue
      return undefined;
    },
    
    // After hooks
    async afterSignIn({ user, account, isNewUser }) {
      console.log(`User ${user.email} signed in successfully`);
      
      // Example: Record login timestamp
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });
      
      // Example: Send welcome email to new users
      if (isNewUser) {
        await sendWelcomeEmail(user.email);
      }
    },
    
    async afterSignUp({ user }) {
      console.log(`New user registered: ${user.email}`);
      
      // Example: Create default data for new user
      await prisma.userProfile.create({
        data: {
          userId: user.id,
          // Default profile data
        },
      });
      
      // Example: Assign default role to new users
      await prisma.user.update({
        where: { id: user.id },
        data: { roles: ['user'] },
      });
    },
    
    async afterCreateSession({ session, user }) {
      console.log(`New session created for user: ${user.id}`);
      
      // Example: Log session creation
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'session_created',
          metadata: {
            sessionId: session.id,
            userAgent: session.userAgent,
            ip: session.ip,
          },
        },
      });
    },
  },
} satisfies BetterAuthOptions;
```

## Using Context in Hooks

Hooks receive a context object that provides access to various utilities and data. The context is different depending on the hook.

### Hook Context Properties

```typescript
// Common hook context properties
interface HookContext {
  // Auth instance
  auth: BetterAuth;
  
  // Database transaction (if available)
  tx?: any;
  
  // Request information (if available)
  req?: {
    url: string;
    method: string;
    headers: Record<string, string>;
    ip?: string;
    userAgent?: string;
  };
}

// Sign in hook context
interface SignInHookContext extends HookContext {
  provider: string;
  credentials: Record<string, any>;
  user?: User;
}

// Sign up hook context
interface SignUpHookContext extends HookContext {
  credentials: {
    email: string;
    password: string;
    name?: string;
    [key: string]: any;
  };
}

// Update user hook context
interface UpdateUserHookContext extends HookContext {
  userId: string;
  data: Record<string, any>;
  user?: User;
}
```

### Using Database Transactions in Hooks

BetterAuth supports database transactions in hooks to ensure data consistency:

```typescript
export const authConfig = {
  // Other config...
  
  // Configure database with transactions
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
    useTransactions: true,
  }),
  
  hooks: {
    async afterSignUp({ user, tx }) {
      // Use the transaction provided in the context
      // This ensures that if this operation fails, the sign-up will be rolled back
      await tx.userProfile.create({
        data: {
          userId: user.id,
          bio: 'New user',
        },
      });
      
      await tx.subscription.create({
        data: {
          userId: user.id,
          plan: 'free',
          status: 'active',
        },
      });
    },
  },
};
```

## Custom Hook Implementation

You can implement custom hooks for specific use cases:

### Example: Implement a Password Strength Hook

```typescript
// src/lib/auth/password-validation.ts
import zxcvbn from 'zxcvbn'; // Password strength library

export function createPasswordStrengthHook(minScore = 3) {
  return async function beforeSignUp({ credentials }) {
    // Skip if no password (e.g., social sign-up)
    if (!credentials.password) return undefined;
    
    // Check password strength
    const result = zxcvbn(credentials.password);
    
    if (result.score < minScore) {
      throw new Error(
        `Password is too weak. ${result.feedback.warning}. ${result.feedback.suggestions.join(' ')}`
      );
    }
    
    return undefined;
  };
}
```

Then use it in your auth config:

```typescript
import { createPasswordStrengthHook } from './password-validation';

export const authConfig = {
  // Other config...
  
  hooks: {
    beforeSignUp: createPasswordStrengthHook(3),
    // Other hooks...
  },
};
```

### Example: Implement User Activity Logging

```typescript
// src/lib/auth/activity-logging.ts
import { prisma } from '@/lib/prisma';

export function createActivityLoggingHooks() {
  return {
    async afterSignIn({ user, req }) {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'sign_in',
          ip: req?.ip,
          userAgent: req?.userAgent,
          timestamp: new Date(),
        },
      });
    },
    
    async afterSignOut({ user, req }) {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'sign_out',
          ip: req?.ip,
          userAgent: req?.userAgent,
          timestamp: new Date(),
        },
      });
    },
  };
}
```

Then use it in your auth config:

```typescript
import { createActivityLoggingHooks } from './activity-logging';

const activityHooks = createActivityLoggingHooks();

export const authConfig = {
  // Other config...
  
  hooks: {
    afterSignIn: activityHooks.afterSignIn,
    afterSignOut: activityHooks.afterSignOut,
    // Other hooks...
  },
};
```

## Middleware in Next.js

BetterAuth provides middleware integration for Next.js to protect routes and handle authentication at the request level.

### Basic Middleware Setup

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createNextMiddleware } from 'better-auth/integrations/next';
import { authConfig } from './lib/auth/config';

// Create BetterAuth middleware
const betterAuthMiddleware = createNextMiddleware(authConfig);

export default async function middleware(req: NextRequest) {
  // Apply BetterAuth middleware
  const res = await betterAuthMiddleware(req);
  if (res) return res;
  
  // Your custom middleware logic here
  const path = req.nextUrl.pathname;
  
  // Example: Redirect unauthenticated users from protected routes
  if (path.startsWith('/app') && !(req as any).session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  // Continue with the request
  return NextResponse.next();
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    // Match all paths except static files and images
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};
```

### Advanced Middleware with Role-Based Protection

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createNextMiddleware } from 'better-auth/integrations/next';
import { authConfig } from './lib/auth/config';

const betterAuthMiddleware = createNextMiddleware(authConfig);

// Define protected paths and required roles
const PROTECTED_PATHS = {
  '/admin': ['admin'],
  '/dashboard': ['admin', 'user'],
  '/reports': ['admin', 'analyst'],
};

// Define public paths that don't require authentication
const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/',
  '/about',
  '/contact',
];

export default async function middleware(req: NextRequest) {
  // Apply BetterAuth middleware
  const res = await betterAuthMiddleware(req);
  if (res) return res;
  
  const path = req.nextUrl.pathname;
  const session = (req as any).session;
  
  // Allow public paths
  if (PUBLIC_PATHS.some(publicPath => path === publicPath || path.startsWith(`${publicPath}/`))) {
    return NextResponse.next();
  }
  
  // Check authentication for other paths
  if (!session) {
    const url = new URL('/login', req.url);
    url.searchParams.set('callbackUrl', req.url);
    return NextResponse.redirect(url);
  }
  
  // Check role-based access for protected paths
  const userRoles = session.user.roles || [];
  
  for (const [protectedPath, requiredRoles] of Object.entries(PROTECTED_PATHS)) {
    if (path === protectedPath || path.startsWith(`${protectedPath}/`)) {
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

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|api/public|favicon.ico|.*\\.png$).*)',
  ],
};
```

## Context In Route Handlers

BetterAuth allows you to create custom context objects for route handlers:

```typescript
// app/api/custom-context/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandler } from 'better-auth/integrations/next';
import { authConfig } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

// Create a handler with custom context
const handler = createRouteHandler({
  config: authConfig,
  
  // Require authentication for all methods
  requireAuth: true,
  
  // Define allowed roles (optional)
  allowedRoles: ['admin', 'user'],
  
  // Create context from request and session
  async createContext({ req, session }) {
    // Retrieve additional user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        subscription: true,
      },
    });
    
    // Add request details
    const requestInfo = {
      ip: req.ip,
      userAgent: req.headers.get('user-agent'),
      path: req.nextUrl.pathname,
      method: req.method,
    };
    
    // Return custom context
    return {
      session,
      user,
      requestInfo,
      // Add utility functions to context
      utils: {
        async logActivity(action: string, details?: any) {
          await prisma.activityLog.create({
            data: {
              userId: user.id,
              action,
              details,
              ip: requestInfo.ip,
              userAgent: requestInfo.userAgent,
            },
          });
        },
      },
    };
  },
  
  // Define route handlers that use the context
  async GET({ context }) {
    const { session, user, requestInfo, utils } = context;
    
    // Log this activity
    await utils.logActivity('api_access', { endpoint: requestInfo.path });
    
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscription: user.subscription?.plan || 'free',
      },
      request: {
        ip: requestInfo.ip,
        path: requestInfo.path,
      },
    });
  },
  
  async POST({ context, req }) {
    const { session, utils } = context;
    const body = await req.json();
    
    // Log this activity
    await utils.logActivity('data_submission', { data: body });
    
    // Process the request with context
    return NextResponse.json({
      message: 'Data received successfully',
      userId: session.user.id,
    });
  },
});

// Export the handler
export const { GET, POST } = handler;
```

## MapProfileToUser Hook

The `mapProfileToUser` hook allows you to customize how user profiles from OAuth providers are mapped to your user model:

```typescript
// In your auth config
export const authConfig = {
  // Other config...
  
  callbacks: {
    async mapProfileToUser({ profile, provider, account }) {
      // Basic field mapping
      const user = {
        email: profile.email,
        name: profile.name,
        image: profile.picture || profile.avatar_url,
      };
      
      // Provider-specific mapping logic
      if (provider === 'microsoft') {
        // Extract additional information from Microsoft profile
        return {
          ...user,
          // Custom fields from Microsoft profile
          department: profile.jobTitle,
          // Map Microsoft-specific fields
          organizationId: profile.organization?.id,
          // Add default roles
          roles: ['user'],
        };
      }
      
      if (provider === 'github') {
        return {
          ...user,
          // Custom fields from GitHub profile
          username: profile.login,
          // Add default roles
          roles: ['user'],
        };
      }
      
      // Default mapping for other providers
      return {
        ...user,
        roles: ['user'],
      };
    },
  },
};
```

## Best Practices for Hooks and Middleware

### Performance Optimization

1. **Keep Hooks Lean**: Hooks run on every authentication request, so keep them efficient.

2. **Use Async/Await**: All hooks should be async functions for consistency.

3. **Handle Errors**: Properly handle errors within hooks to prevent uncaught exceptions.

4. **Database Queries**: Minimize database queries in hooks, especially in frequently executed hooks.

5. **Caching**: Consider caching results for hooks that perform expensive operations.

### Security Considerations

1. **Validate Input**: Always validate and sanitize user input in hooks.

2. **Avoid Sensitive Information**: Don't expose sensitive information in responses or logs.

3. **Use Transactions**: Use database transactions for operations that modify multiple records.

4. **Rate Limiting**: Implement rate limiting for actions that might be abused.

5. **Audit Logging**: Log security-related events for audit purposes.

### Hook Organization

1. **Modular Hooks**: Organize related hooks into separate modules for better maintainability.

2. **Reusable Hook Factories**: Create factory functions for hooks that follow similar patterns.

3. **Testing Hooks**: Create unit tests for your hooks to ensure they work correctly.

4. **Documentation**: Document your hooks' purpose, inputs, and side effects.

5. **Versioning**: When making significant changes to hooks, consider versioning them to avoid breaking changes.

## Common Hook Use Cases

### User Onboarding

```typescript
// In your auth config
hooks: {
  async afterSignUp({ user }) {
    // Create user-specific resources
    await Promise.all([
      // Create default workspace
      prisma.workspace.create({
        data: {
          name: 'My Workspace',
          userId: user.id,
        },
      }),
      
      // Create welcome notification
      prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Welcome!',
          message: 'Welcome to our platform. Get started by completing your profile.',
          type: 'welcome',
        },
      }),
      
      // Send welcome email
      sendWelcomeEmail(user.email, user.name),
    ]);
  },
}
```

### Custom Validation

```typescript
// In your auth config
hooks: {
  async beforeSignUp({ credentials }) {
    // Custom validation logic
    if (credentials.password && credentials.password.length < 10) {
      throw new Error('Password must be at least 10 characters long');
    }
    
    // Check if email domain is allowed
    const emailDomain = credentials.email.split('@')[1];
    const allowedDomains = ['company.com', 'partner.com'];
    
    if (!allowedDomains.includes(emailDomain)) {
      throw new Error('Only company email addresses are allowed to register');
    }
    
    return undefined;
  },
}
```

### Event Tracking

```typescript
// In your auth config
hooks: {
  async afterSignIn({ user, account, isNewUser }) {
    // Track sign-in event
    await trackEvent('user_signed_in', {
      userId: user.id,
      provider: account?.provider || 'email',
      isNewUser,
    });
  },
  
  async afterSignOut({ user }) {
    // Track sign-out event
    await trackEvent('user_signed_out', {
      userId: user.id,
    });
  },
}
```

### Session Enrichment

```typescript
// In your auth config
hooks: {
  async afterCreateSession({ session, user }) {
    // Enrich session with user permissions and preferences
    const userWithPermissions = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        permissions: true,
        preferences: true,
      },
    });
    
    // Update session with additional data
    await prisma.session.update({
      where: { id: session.id },
      data: {
        metadata: {
          permissions: userWithPermissions.permissions,
          preferences: userWithPermissions.preferences,
        },
      },
    });
  },
}
```
