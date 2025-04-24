# Authentication Providers

This document covers how to configure and use authentication providers with BetterAuth, with a specific focus on Microsoft authentication for enterprise applications.

## Supported Providers

BetterAuth supports multiple authentication providers including:

- Microsoft
- Google
- GitHub
- Twitter
- Facebook
- Email/Password
- Magic Links
- Custom providers

## Microsoft Provider (Azure AD)

Our application uses Microsoft authentication with Azure AD. This section covers how to set up and configure Microsoft authentication for enterprise applications.

### Configuration

Configure Microsoft authentication in your BetterAuth configuration:

```typescript
// src/lib/auth/config.ts
import { BetterAuthOptions } from 'better-auth/next';
import { prisma } from '@/lib/db';
import { prismaAdapter } from '@better-auth/prisma-adapter';
import { openAPI } from '@better-auth/open-api';
import { env } from '@/env';

// Environment variables
const {
  MICROSOFT_CLIENT_ID,
  MICROSOFT_CLIENT_SECRET,
  MICROSOFT_TENANT_ID,
  NEXT_PUBLIC_APP_URL,
} = env;

const APP_NAME = 'Your App Name';

export const authConfig = {
  appName: APP_NAME,
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'],
  logger: {
    disabled: process.env.NODE_ENV === 'production',
    level: 'debug',
  },
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
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
  session: {
    freshAge: 0,
    expiresIn: 60 * 60 * 24 * 3, // 3 days
    updateAge: 60 * 60 * 12, // 12 hours (every 12 hours the session expiration is updated)
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  user: {
    changeEmail: {
      enabled: true,
    },
    deleteUser: {
      enabled: true,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  plugins: [openAPI()],
} satisfies BetterAuthOptions;
```

### Handling Large Session Data

Microsoft authentication can return large amounts of data, especially when requesting user groups, roles, and other profile information. This can cause "Session data too large" errors when this data exceeds cookie size limits.

#### Problem

```plaintext
# SERVER_ERROR: [Error [BetterAuthError]: Session data is too large to store in the cookie. 
# Please disable session cookie caching or reduce the size of the session data]
```

This error occurs during Microsoft sign-in when the session contains too much data for cookies, particularly when requesting many scopes:

```typescript
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
```

#### Solution 1: Disable Cookie Cache

The simplest solution is to disable cookie caching in the session configuration:

```typescript
session: {
  freshAge: 0,
  expiresIn: 60 * 60 * 24 * 3, // 3 days
  updateAge: 60 * 60 * 12, // 12 hours
  cookieCache: {
    enabled: false, // Disabled to prevent "Session data too large" errors
  },
  // BetterAuth will automatically use database storage when cookieCache is disabled
},
```

#### Solution 2: Optimize Session Data

In the session callback, minimize the data stored in the session:

```typescript
callbacks: {
  async session({ session, token }) {
    // Only include essential data in the session
    return {
      ...session,
      user: {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string || null,
        image: token.image as string || null,
        // Only include essential role and impersonation data
        roles: parseRoles(token.roles),
        // Only include groups if they're needed for authorization
        ...(Array.isArray(token.groups) && token.groups.length > 0 ? { 
          groups: (token.groups as string[]).slice(0, 5) // Limit to top 5 groups
        } : {}),
      },
    };
  },
}
```

#### Solution 3: Redis Secondary Storage

For optimal performance with large session data, we've implemented Redis secondary storage using a centralized Redis client:

```typescript
// src/lib/redis.ts
import { createClient } from 'redis';
import type { RedisClientType } from 'redis';
import { dbLogger } from '@/lib/logger';

// Prevent multiple instances of Redis client in development 
const globalForRedis = globalThis as unknown as {
  redis: RedisClientType | undefined;
};

// Create Redis client
const redisClient =
  globalForRedis.redis ??
  createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });

// Connect to Redis (will be handled on first import)
const initRedis = async () => {
  try {
    // Only connect if not already connected
    if (!redisClient.isOpen) {
      await redisClient.connect();
      dbLogger.info('Redis connected successfully for session storage');
    }
  } catch (err) {
    dbLogger.warn('Redis connection failed, falling back to database only', err);
  }
};

// Initialize the connection without awaiting to prevent blocking
initRedis().catch(err => dbLogger.error('Redis initialization error', err));

// Save the instance in development to prevent multiple connections
if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redisClient;

export default redisClient;
```

Then import and use it in your BetterAuth configuration:

```typescript
// src/lib/auth/config.ts
import redisClient from '@/lib/redis';

export const authConfig = {
  // Other config...
  
  // Configure Redis as secondary storage
  secondaryStorage: {
    async get(key: string) {
      try {
        const value = await redisClient.get(key);
        return value;
      } catch (error) {
        console.error('Redis get error', error, key);
        return null;
      }
    },
    async set(key: string, value: string, ttl?: number) {
      try {
        if (ttl) {
          await redisClient.set(key, value, { EX: ttl });
        } else {
          await redisClient.set(key, value);
        }
      } catch (error) {
        console.error('Redis set error', error, key);
      }
    },
    async delete(key: string) {
      try {
        await redisClient.del(key);
      } catch (error) {
        console.error('Redis delete error', error, key);
      }
    }
  },
}
```

This solution provides:

- High-performance session retrieval through Redis
- Automatic fallback to database if Redis is unavailable
- Elimination of session size limitations
- Improved scalability for applications with many users
- Centralized Redis client that can be reused across the application

### Azure AD App Registration

To use Microsoft authentication, you need to set up an app registration in Azure AD:

1. Sign in to the Azure portal
2. Navigate to Azure Active Directory > App registrations > New registration
3. Fill in the registration form:
   - Name: Your application name
   - Supported account types: Accounts in this organizational directory only (Single tenant)
   - Redirect URI: `https://your-domain.com/api/auth/callback/microsoft`
4. Go to Authentication > Add platform > Web
   - Add redirect URI: `http://localhost:3000/api/auth/callback/microsoft` (for local development)
5. Go to Certificates & secrets > New client secret
   - Create a new client secret and note the value (visible only once)
6. Go to API permissions and add the following permissions:
   - Microsoft Graph API permissions:
     - `User.Read` (Delegated)
     - `GroupMember.Read.All` (Delegated)
     - `ProfilePhoto.Read.All` (Delegated)
     - `User.ReadBasic.All` (Delegated)
   - Click "Grant admin consent"
7. Go to App Roles > Create App Role for each role in your application:
   - Display name: Admin
   - Allowed member types: Users/Groups
   - Value: admin (should match the role values in your ROLES constant)
   - Description: Administrator access
   - Do-enabled: Yes
   - Repeat for each role (Security, DevOps, DBA, etc.)

### Azure AD Enterprise Applications

After creating your app registration:

1. Go to Azure AD > Enterprise applications > Find your application
2. Go to Users and groups
3. Assign users and groups to your application, including appropriate app roles

### Environment Variables

Set the following environment variables:

```env
# .env
MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_CLIENT_SECRET=your-client-secret
MICROSOFT_TENANT_ID=your-tenant-id
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Sign-In Integration in UI

Create a sign-in button for Microsoft authentication:

```tsx
// src/components/auth/microsoft-signin-button.tsx
'use client'

import { Button } from '@/components/ui/button';
import { signIn } from '@/lib/auth/client';
import { useState } from 'react';
import { MicrosoftLogo } from '@/components/icons/microsoft';

export function MicrosoftSignInButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn('microsoft');
    } catch (error) {
      console.error('Microsoft sign-in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full flex items-center gap-2"
      onClick={handleSignIn}
      disabled={isLoading}
    >
      <MicrosoftLogo className="h-4 w-4" />
      <span>{isLoading ? 'Signing in...' : 'Sign in with Microsoft'}</span>
    </Button>
  );
}
```

## Role Extraction and Session Enhancement

When users sign in with Microsoft, we need to extract their roles from the token and add them to the session:

```typescript
// src/lib/auth/hooks.ts
import { ROLES, type Role } from '@/types/roles';
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

  // Extract roles from token - these should come from Azure AD app roles
  const userRoles = parseRoles(token?.roles);
  
  // If no valid roles were assigned, set default role
  if (userRoles.length === 0) {
    userRoles.push(ROLES.USER);
  }
  
  // Optionally extract groups if needed
  const userGroups = Array.isArray(token?.groups) 
    ? token.groups.filter((group: unknown): group is string => typeof group === 'string')
    : [];
  
  // Log role assignment for debugging
  if (process.env.NODE_ENV !== 'production') {
    authLogger.debug('[Auth] Assigned roles:', userRoles);
    if (userGroups.length > 0) {
      authLogger.debug('[Auth] User groups:', userGroups);
    }
  }
  
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

### Configuring BetterAuth Callbacks

We need to configure BetterAuth to use our enhanceSession function:

```typescript
// src/lib/auth/server.ts
import { BetterAuth } from 'better-auth';
import { authConfig } from './config';
import { enhanceSession } from './hooks';

// Extend config with callbacks
const configWithCallbacks = {
  ...authConfig,
  callbacks: {
    async session({ session, token }) {
      // Enhance session with roles from token
      return enhanceSession({ session, token });
    },
    // Other callbacks as needed
  },
};

// Create BetterAuth instance
export const auth = new BetterAuth(configWithCallbacks);

// Export auth for use in app
export * from 'better-auth';
```

## Type Definitions for Microsoft Identity

We define our types in a central location to ensure consistency:

```typescript
// src/types/auth.d.ts
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

## Role Utilities

To handle the roles from Microsoft tokens, we create utility functions:

```typescript
// src/lib/auth/role-utils.ts
import { ROLES, type Role } from "@/types/roles";

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
```

## Error Handling

Handle sign-in errors gracefully:

```tsx
// src/app/auth/error/page.tsx
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const error = searchParams.get('error');
  
  const errorMessages: Record<string, string> = {
    default: 'An error occurred during authentication.',
    AccessDenied: 'Access denied. You may not have permission to sign in.',
    OAuthSignin: 'Error starting the OAuth sign-in flow.',
    OAuthCallback: 'Error during the OAuth callback.',
    MicrosoftProviderError: 'Error with Microsoft authentication provider.',
    SessionRequired: 'You must be signed in to access this page.',
  };
  
  const errorMessage = errorMessages[error || ''] || errorMessages.default;
  
  return (
    <div className="container flex flex-col items-center justify-center mt-10">
      <Alert className="max-w-md" variant="destructive">
        <AlertTitle>Authentication Error</AlertTitle>
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
      
      <div className="mt-6 flex gap-4">
        <Button
          variant="outline"
          onClick={() => router.push('/auth/signin')}
        >
          Try Again
        </Button>
        <Button onClick={() => router.push('/')}>
          Return to Home
        </Button>
      </div>
    </div>
  );
}
```

## Testing Microsoft Authentication

To test your Microsoft authentication implementation:

1. Assign app roles to test users in Azure AD
2. Check that roles are correctly extracted from tokens
3. Verify that session enhancement is working as expected
4. Test role-based access controls with different user roles

## Multiple Providers

If your application needs multiple providers alongside Microsoft:

```typescript
// In auth config
socialProviders: {
  microsoft: {
    // Microsoft config
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    scope: ['email', 'profile']
  },
  // Other providers
}
```

## Provider-Specific User Information

Access provider-specific information:

```typescript
// Example of accessing Microsoft-specific user information
export async function getUserMicrosoftInfo(userId: string) {
  try {
    const user = await auth.api.getUser(userId);
    
    // Get accounts linked to the user
    const accounts = await auth.api.getUserAccounts(userId);
    
    // Find the Microsoft account
    const microsoftAccount = accounts.find(account => account.provider === 'microsoft');
    
    if (!microsoftAccount) {
      return { success: false, error: 'User does not have a linked Microsoft account' };
    }
    
    // Access Microsoft-specific information
    return { 
      success: true, 
      data: {
        microsoftId: microsoftAccount.providerAccountId,
        // Other Microsoft account data
      }
    };
  } catch (error) {
    console.error('Error retrieving Microsoft account info:', error);
    return { success: false, error: 'Failed to retrieve Microsoft account information' };
  }
}
```

## Account Linking

Allow users to link multiple authentication providers to their account:

```tsx
// src/components/auth/account-linking.tsx
'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { linkSocial } from '@/lib/auth/client';
import { MicrosoftLogo } from '@/components/icons/microsoft';

interface AccountLinkingProps {
  linkedProviders: string[];
}

export function AccountLinking({ linkedProviders }: AccountLinkingProps) {
  const [isLinking, setIsLinking] = useState(false);
  
  const handleLinkMicrosoft = async () => {
    try {
      setIsLinking(true);
      await linkSocial('microsoft');
    } catch (error) {
      console.error('Error linking Microsoft account:', error);
    } finally {
      setIsLinking(false);
    }
  };
  
  const isMicrosoftLinked = linkedProviders.includes('microsoft');
  
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Linked Accounts</h2>
      
      <div className="space-y-4">
        {isMicrosoftLinked ? (
          <div className="flex items-center gap-2">
            <MicrosoftLogo className="h-4 w-4" />
            <span>Microsoft account linked</span>
          </div>
        ) : (
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleLinkMicrosoft}
            disabled={isLinking}
          >
            <MicrosoftLogo className="h-4 w-4" />
            <span>{isLinking ? 'Linking...' : 'Link Microsoft Account'}</span>
          </Button>
        )}
        
        {/* Other provider linking buttons */}
      </div>
    </div>
  );
}
```

## Best Practices

1. **Secure Configuration**: Keep client secrets in environment variables, never hardcode them.

2. **Proper Scopes**: Request only the minimum required OAuth scopes.

3. **Token Validation**: Validate tokens on the server side.

4. **Role Assignment**: Use Azure AD app roles for role assignment rather than managing roles in your database.

5. **Error Handling**: Implement comprehensive error handling for authentication failures.

6. **Testing**: Test authentication with multiple users having different roles.

7. **Session Enhancement**: Always enhance sessions with roles extracted from tokens.

8. **Type Safety**: Use TypeScript to ensure type safety throughout the authentication flow.

9. **Centralized Types**: Define all authentication-related types in a central location.

10. **Documentation**: Keep documentation up-to-date with the actual implementation.
