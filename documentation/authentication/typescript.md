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

Using `satisfies` ensures TypeScript checks your configuration without forcing type narrowing.

### Centralized Type Definitions

For consistency and maintainability, we centralize our auth-related type definitions in a dedicated `.d.ts` file:

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

// Add UI component props types
export interface RoleGateProps {
  allowedRoles: Role[];
  children: ReactNode;
  fallback?: ReactNode;
  requireAll?: boolean;
  showFallbackOnLoading?: boolean;
}

// Add role information to the existing BetterAuth User type through module augmentation
declare module '@/lib/auth/server' {
  interface User {
    roles?: Role[];
    groups?: string[];
    originalRoles?: Role[];
    isImpersonating?: boolean;
  }
}
```

### Module Augmentation

When extending BetterAuth's types, use module augmentation to add new properties to existing types:

```typescript
// src/types/auth.d.ts
import { auth } from "@/lib/auth/server";

// Augment BetterAuth's User interface
declare module '@/lib/auth/server' {
  interface User {
    // Add custom user fields
    roles?: string[];
    department?: string;
    permissions?: string[];
  }
}
```

This approach allows you to maintain type safety while adding custom fields to BetterAuth's User type.

### Creating Role-Related Utility Functions

Create strongly-typed utility functions in a dedicated file:

```typescript
// src/lib/auth/roles.ts
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

// Re-export ROLES for convenience
export { ROLES };
```

### Type-Safe Hooks

Create strongly-typed custom hooks:

```typescript
// src/hooks/use-role.ts
import { useSession } from '@/lib/auth/client';
import { ROLES } from '@/lib/auth/roles';
import type { ExtendedSession, Role } from '@/types/auth.d';
import { useState, useCallback } from 'react';

export function useRole() {
  const sessionResponse = useSession();
  const session = sessionResponse.data as ExtendedSession | null;
  const roles = session?.user?.roles || [];
  
  return {
    roles,
    hasRole: (role: Role) => roles.includes(role),
    hasAnyRole: (checkRoles: Role[]) => checkRoles.some(role => roles.includes(role)),
    hasAllRoles: (checkRoles: Role[]) => checkRoles.every(role => roles.includes(role)),
    isAdmin: () => roles.includes(ROLES.ADMIN),
    // ...other convenience methods
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
