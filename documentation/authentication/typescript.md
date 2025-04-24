# TypeScript Integration

This document covers how to leverage TypeScript with BetterAuth for improved type safety, intellisense, and developer experience.

## TypeScript Configuration

BetterAuth is built with TypeScript and provides comprehensive type definitions out of the box. For optimal TypeScript integration, ensure your `tsconfig.json` has the following settings:

```json
{
  "compilerOptions": {
    "target": "es2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## Type Definitions

### Core Types

BetterAuth exports type definitions for all of its core functionality. Here are the most commonly used types:

```typescript
// Import types from BetterAuth
import type {
  BetterAuthOptions,
  User,
  Session,
  Account,
  VerificationToken,
  Provider,
  Adapter,
  AdapterUser,
  BetterAuthError,
} from 'better-auth';
```

### Configuration Types

When configuring BetterAuth, TypeScript helps ensure your configuration is valid:

```typescript
import type { BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

const authConfig = {
  appName: 'Your App',
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  
  // TypeScript will validate adapter options
  database: prismaAdapter(prisma, {
    provider: 'postgresql', // Type checked
  }),
  
  // Type checking for oauth providers
  socialProviders: {
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID || '',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
      tenantId: process.env.MICROSOFT_TENANT_ID || '',
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
  
  // Type checking for hook parameters and return values
  hooks: {
    async beforeSignIn({ provider, credentials }) {
      // TypeScript knows the shape of these parameters
      return undefined; // Return type checked
    },
  },
} satisfies BetterAuthOptions;
```

### Centralized Type Definitions

For consistency and maintainability, we centralize our auth-related type definitions in dedicated `.d.ts` files in the `/src/types` directory:

```typescript
// src/types/auth.d.ts
import { auth } from "@/lib/auth/server";
import type { Role } from "@/types/roles";
import type { ReactNode } from "react";

/**
 * Session data structure explicitly defined for clarity
 */
export interface SessionData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  expiresAt: Date;
  token: string;
  fresh: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Microsoft profile interface for OAuth provider data
 */
export interface MicrosoftProfile {
  groups?: string[];
  roles?: string[];
  email?: string;
  name?: string;
}

/**
 * Extended token type for JWT with impersonation support
 */
export interface AuthToken {
  id?: string;
  email?: string;
  name?: string | null;
  picture?: string | null;
  image?: string | null;
  sub?: string;
  roles?: string[] | Role[];
  groups?: string[];
  isImpersonating?: boolean;
  originalRoles?: string[] | Role[];
  iat?: number;
  exp?: number;
  jti?: string;
}

/**
 * User interface for use throughout the application
 */
export interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  roles?: Role[];
  isImpersonating?: boolean;
  originalRoles?: Role[];
  groups?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Extended session type with our custom fields
 */
export interface ExtendedSession {
  user: User & {
    roles?: Role[];
    groups?: string[];
    originalRoles?: Role[];
    isImpersonating?: boolean;
  };
  roles?: Role[];
  groups?: string[];
  originalRoles?: Role[];
  isImpersonating?: boolean;
}

/**
 * Props for components that conditionally render based on roles
 */
export interface RoleAccessProps {
  /**
   * List of roles that are allowed to access the content
   */
  allowedRoles: Role[];

  /**
   * The content to show if the user has the required roles
   */
  children: ReactNode;

  /**
   * Optional fallback content for unauthorized users
   */
  fallback?: ReactNode;

  /**
   * If true, the user must have all specified roles
   * Default is false (any role is sufficient)
   */
  requireAll?: boolean;
  
  /**
   * If true, renders a loading skeleton while checking authentication
   * If false (default), nothing is rendered during loading
   */
  showLoadingSkeleton?: boolean;
}

/**
 * Props for the access denied alert component
 */
export interface AccessDeniedAlertProps {
  /**
   * Title for the alert
   */
  title?: string;

  /**
   * Description of why access is denied
   */
  description?: ReactNode;

  /**
   * Additional content to display below the description
   */
  children?: ReactNode;

  /**
   * Optional CSS class names
   */
  className?: string;
}

/**
 * Props for the protected layout component
 */
export interface ProtectedLayoutProps {
  /**
   * The content to render if the user has access
   */
  children: ReactNode;

  /**
   * List of roles that are allowed to access this section
   */
  allowedRoles: Role[];

  /**
   * Custom title for the unauthorized view
   */
  unauthorizedTitle?: string;

  /**
   * Custom message for the unauthorized view
   */
  unauthorizedMessage?: string;

  /**
   * If true, the user must have all specified roles
   * If false (default), having any of the specified roles is sufficient
   */
  requireAll?: boolean;

  /**
   * If true, shows a loading state while checking authentication
   */
  showLoading?: boolean;
}
```

```typescript
// src/types/roles.ts
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
```

```typescript
// src/types/plugins.d.ts
import type { User } from './auth';
import type { Dispatch, SetStateAction } from 'react';

/**
 * Auth context for the application, provided by AuthProvider
 */
export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
}

/**
 * API Key model for the API Keys plugin
 */
export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: Date;
  expiresAt: Date | null;
  lastUsed: Date | null;
  createdBy: string;
  scopes: string[];
  enabled: boolean;
}

// Additional plugin types and interfaces...
```

### Role-Based Authentication Components

Our application uses a set of reusable, type-safe components for role-based access control:

```typescript
// RoleGuard component that conditionally renders content based on user roles
import { Skeleton } from '@/components/ui/skeleton';
import { useImpersonationAwareRole } from '@/hooks/use-impersonation-aware-role';
import { useAuth } from '@/providers/auth-provider';
import type { RoleAccessProps } from '@/types/auth';

/**
 * Component that conditionally renders content based on user roles
 * Fully supports role impersonation for testing purposes
 */
export function RoleGuard({
  children,
  allowedRoles,
  fallback,
  requireAll = false,
  showLoadingSkeleton = false,
}: RoleAccessProps) {
  const { isLoading, isAuthenticated } = useAuth();
  const { hasAnyRole, hasAllRoles } = useImpersonationAwareRole();
  
  // Check if user has required roles
  const hasRequiredRoles = requireAll
    ? hasAllRoles(allowedRoles)
    : hasAnyRole(allowedRoles);
  
  // Render content or fallback based on role check
  return hasRequiredRoles ? <>{children}</> : fallback ? <>{fallback}</> : null;
}
```

### Impersonation-Aware Role Hooks

For testing and debugging purposes, we've implemented impersonation-aware role hooks that respect both real and impersonated roles:

```typescript
// src/hooks/use-impersonation-aware-role.ts
import { useAuth } from '@/providers/auth-provider';
import { hasAnyRole as checkAnyRole, hasRole, ROLES } from '@/lib/auth/role-utils';
import type { Role } from '@/types/roles';
import { useCallback } from 'react';

/**
 * Hook for checking role access with impersonation awareness
 */
export function useImpersonationAwareRole() {
  const { user, isAuthenticated } = useAuth();
  
  const hasAnyRole = useCallback(
    (roles: Role[]): boolean => {
      if (!isAuthenticated || !user || !user.roles) return false;
      return checkAnyRole(user.roles, roles);
    },
    [isAuthenticated, user]
  );
  
  const isRealAdmin = useCallback((): boolean => {
    if (!isAuthenticated || !user) return false;
    
    // If impersonating, check original roles, otherwise check current roles
    const rolesToCheck = user.isImpersonating 
      ? (user.originalRoles || [])
      : user.roles || [];
      
    return hasRole(rolesToCheck as Role[], ROLES.ADMIN);
  }, [isAuthenticated, user]);
  
  // Additional role checking methods...
  
  return {
    hasAnyRole,
    hasAllRoles,
    isImpersonating,
    getOriginalRoles,
    isAdmin,
    isRealAdmin,
  };
}
```

## Type Inference

BetterAuth provides built-in type inference for many common operations:

```typescript
async function handleSignIn(email: string, password: string) {
  try {
    // TypeScript knows the parameter and return types
    const result = await signIn('email-password', {
      email,
      password,
    });
    
    // result is properly typed
    if (result.error) {
      console.error(result.error);
    }
  } catch (error) {
    console.error(error);
  }
}
```

## Type Safety for Server Components

Ensure your server components have proper type safety:

```typescript
// src/app/profile/page.tsx
import { headers } from 'next/headers';
import { auth } from '@/lib/auth/server';
import type { ExtendedSession } from '@/types/auth.d';

export default async function ProfilePage() {
  // Type-safe session access
  const session = await auth.api.getSession({
    headers: await headers(),
  }) as ExtendedSession | null;
  
  // Type guard for authenticated state
  if (!session?.user) {
    return <div>Not authenticated</div>;
  }
  
  // TypeScript knows the shape of session.user including our custom properties
  const { name, email, roles } = session.user;
  
  return (
    <div>
      <h1>Profile: {name}</h1>
      <p>Email: {email}</p>
      <p>Roles: {roles?.join(', ') ?? 'No roles assigned'}</p>
    </div>
  );
}
```

## Type-Safe API Routes

Create type-safe API routes with proper type checking:

```typescript
// src/app/api/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/session';
import { ROLES, type Role } from '@/types/roles';

// Define request body type
interface UpdateUserRequest {
  name?: string;
  roles?: Role[]; // Type-safe with Role enum
}

export async function PUT(req: NextRequest) {
  try {
    // Ensure authenticated and authorized
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (!session.user.roles?.includes(ROLES.ADMIN)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Parse and validate request body with types
    const body: UpdateUserRequest = await req.json();
    
    // Validate roles using type guard
    if (body.roles) {
      const validRoles = body.roles.every(role => 
        Object.values(ROLES).includes(role)
      );
      
      if (!validRoles) {
        return NextResponse.json(
          { error: 'Invalid roles provided' },
          { status: 400 }
        );
      }
    }
    
    // Process the request...
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Type-Safe Server Actions

Server actions with strong typing:

```typescript
'use server'

import { z } from 'zod';
import { auth } from '@/lib/auth/server';
import { getServerSession } from '@/lib/auth/session';
import { ROLES, type Role } from '@/types/roles';

// Define schema for type safety and validation
const UpdateRolesSchema = z.object({
  userId: z.string(),
  roles: z.array(z.enum([
    ROLES.ADMIN,
    ROLES.SECURITY,
    ROLES.DEVOPS,
    ROLES.DBA,
    ROLES.COLLAB,
    ROLES.TCC,
    ROLES.FIELDTECH,
    ROLES.USER
  ]))
});

// Type inferencing with zod
type UpdateRolesInput = z.infer<typeof UpdateRolesSchema>;

/**
 * Type-safe server action for updating user roles
 */
export async function updateUserRoles(input: UpdateRolesInput) {
  try {
    // Validate with zod
    const validatedData = UpdateRolesSchema.parse(input);
    
    // Get session with proper typing
    const session = await getServerSession();
    
    // Check permissions
    if (!session?.user?.roles?.includes(ROLES.ADMIN)) {
      return { success: false, error: 'Unauthorized' };
    }
    
    // Update user roles
    await auth.api.updateUser({
      id: validatedData.userId,
      data: { roles: validatedData.roles }
    });
    
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Type-safe error handling
      return { 
        success: false, 
        error: 'Validation error', 
        issues: error.errors 
      };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
```

## Typed Error Handling

Handle authentication errors with proper typing:

```typescript
import { BetterAuthError } from 'better-auth';

async function handleSignIn(email: string, password: string) {
  try {
    await signIn('email-password', { email, password });
  } catch (error) {
    // Type guard for BetterAuth errors
    if (error instanceof BetterAuthError) {
      // TypeScript knows about the error code property
      switch (error.code) {
        case 'user_not_found':
          return { success: false, message: 'User not found' };
        case 'invalid_credentials':
          return { success: false, message: 'Invalid email or password' };
        case 'email_not_verified':
          return { success: false, message: 'Please verify your email first' };
        default:
          return { success: false, message: `Authentication error: ${error.message}` };
      }
    }
    
    // Handle other types of errors
    return { success: false, message: 'An unexpected error occurred' };
  }
}
```

## Type Safety for Role Guards

Create type-safe components for role-based access control:

```tsx
// src/components/auth/role-gate.tsx
import { useRole } from '@/hooks/use-role';
import { type RoleGateProps } from '@/types/auth.d';

/**
 * Type-safe component for conditional rendering based on user roles
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

## Type Discrimination for Microsoft Accounts

Handle provider-specific typing with discriminated unions:

```typescript
// Define type for Microsoft account
interface MicrosoftAccount {
  provider: 'microsoft';
  type: 'oauth';
  providerAccountId: string;
  access_token: string;
  id_token?: string;
  refresh_token?: string;
  expires_at?: number;
  tenant_id?: string;
}

// Define type for Google account
interface GoogleAccount {
  provider: 'google';
  type: 'oauth';
  providerAccountId: string;
  access_token: string;
  id_token?: string;
  refresh_token?: string;
  expires_at?: number;
}

// Union type for all supported accounts
type SocialAccount = MicrosoftAccount | GoogleAccount;

// Function using type discrimination
function handleSocialAccount(account: SocialAccount) {
  // TypeScript knows which properties are available based on provider
  if (account.provider === 'microsoft') {
    // TypeScript knows this is a MicrosoftAccount
    console.log('Microsoft tenant ID:', account.tenant_id);
  } else if (account.provider === 'google') {
    // TypeScript knows this is a GoogleAccount
    // account.tenant_id would be a type error here
    console.log('Google account:', account.providerAccountId);
  }
}
```

## Type Safety Best Practices

1. **Use Type Declarations**: Place type definitions in `.d.ts` files for clarity
2. **Module Augmentation**: Use module augmentation to extend BetterAuth types
3. **Type Guards**: Create type guards for runtime type checking
4. **Strict Mode**: Keep `strict: true` in your TypeScript configuration
5. **Type Imports**: Use `import type` for type-only imports
6. **Avoid Any**: Avoid using `any` type; use proper type definitions
7. **Function Types**: Provide explicit return types for functions
8. **Utility Types**: Leverage TypeScript utility types (Partial, Pick, etc.)
9. **Consistent Naming**: Use consistent naming patterns (e.g., prefixing interfaces with `I`)
10. **Type Comments**: Document complex types with JSDoc comments

## Example 1: Type-Safe Role Checking

```typescript
// Example of type-safe role checking in a server component
import { ROLES, type Role } from '@/types/roles';

// ... rest of the code remains the same ...
