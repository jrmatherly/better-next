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
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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

### User Type Extension

You can extend the default user type to include custom fields:

```typescript
// src/types/better-auth.d.ts
import 'better-auth';

declare module 'better-auth' {
  interface User {
    // Add custom user fields
    roles?: string[];
    isActive?: boolean;
    company?: string;
    preferences?: Record<string, any>;
  }
  
  // Extend session user as well
  interface SessionUser {
    roles?: string[];
    isActive?: boolean;
    preferences?: Record<string, any>;
  }
}
```

### Creating Custom Type Guards

Type guards can be useful for checking user permissions:

```typescript
// src/lib/auth/type-guards.ts
import type { User, Session } from 'better-auth';

// Type guard for checking if a user has a specific role
export function hasRole(
  user: User | Session['user'] | null | undefined,
  role: string
): boolean {
  if (!user) return false;
  return user.roles?.includes(role) ?? false;
}

// Type guard for checking if a user is an admin
export function isAdmin(
  user: User | Session['user'] | null | undefined
): boolean {
  return hasRole(user, 'admin');
}

// Usage
if (isAdmin(session?.user)) {
  // TypeScript knows this is an admin user
  console.log('Admin user', session.user);
}
```

## Client-Side TypeScript Integration

### useSession Hook with TypeScript

The `useSession` hook is fully typed:

```typescript
'use client'

import { useSession } from '@/lib/auth/client';

function ProfileComponent() {
  // TypeScript knows the shape of session and status
  const { data: session, status } = useSession();
  
  // Type-safe status checks
  if (status === 'loading') return <div>Loading...</div>;
  
  if (status === 'unauthenticated') {
    return <div>Please sign in</div>;
  }
  
  // TypeScript knows session.user exists and its shape here
  return (
    <div>
      <h1>Welcome, {session.user.name || session.user.email}</h1>
      {/* Access custom fields with type safety */}
      {session.user.roles?.includes('admin') && (
        <div>Admin panel link</div>
      )}
    </div>
  );
}
```

### Type-Safe Authentication Functions

BetterAuth's client functions are fully typed:

```typescript
'use client'

import { signIn, signUp, updateUser } from '@/lib/auth/client';

// Type-safe sign in
async function handleSignIn(email: string, password: string) {
  try {
    // TypeScript knows the parameter and return types
    const result = await signIn('email-password', {
      email,
      password,
      // TypeScript will error on invalid options
    });
    
    // Type-safe access to result
    console.log('User signed in:', result.user.email);
  } catch (error) {
    // TypeScript knows this can be a BetterAuthError
    console.error('Error:', error);
  }
}

// Type-safe user updates
async function updateProfileData(name: string, image?: string) {
  try {
    // TypeScript validates update parameters
    const result = await updateUser({
      name,
      image,
      // TypeScript will error on invalid fields
    });
    
    return result;
  } catch (error) {
    console.error('Error updating profile:', error);
    return null;
  }
}
```

## Server-Side TypeScript Integration

### Type-Safe Session Access

```typescript
// In a server component
import { getServerSession } from 'better-auth/integrations/next';
import { authConfig } from '@/lib/auth/config';

export default async function ProfilePage() {
  // TypeScript knows the shape of the session
  const session = await getServerSession(authConfig);
  
  if (!session) {
    return <div>Please sign in</div>;
  }
  
  // Type-safe access to session fields
  return (
    <div>
      <h1>Hello, {session.user.name}</h1>
      <p>Email: {session.user.email}</p>
      
      {/* TypeScript knows about custom fields */}
      <p>Roles: {session.user.roles?.join(', ')}</p>
    </div>
  );
}
```

### Type-Safe API Routes

```typescript
// In app/api/user-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'better-auth/integrations/next';
import { authConfig } from '@/lib/auth/config';

// Define response type
interface UserDataResponse {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    roles?: string[];
  } | null;
  message: string;
}

export async function GET(
  req: NextRequest
): Promise<NextResponse<UserDataResponse>> {
  const session = await getServerSession(authConfig);
  
  if (!session) {
    return NextResponse.json({
      user: null,
      message: 'Not authenticated',
    });
  }
  
  // Type-safe response
  return NextResponse.json({
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      roles: session.user.roles,
    },
    message: 'Authenticated',
  });
}
```

## Error Handling with TypeScript

BetterAuth provides TypeScript definitions for error types:

```typescript
import { BetterAuthError } from 'better-auth';

async function handleAuthWithErrorTypes() {
  try {
    // Some auth operation
    await signIn('email-password', {
      email: 'user@example.com',
      password: 'password',
    });
  } catch (error) {
    // Type guard for BetterAuthError
    if (error instanceof BetterAuthError) {
      // TypeScript knows about error properties
      console.error(`Auth error: ${error.code} - ${error.message}`);
      
      // Type-safe error code checking
      switch (error.code) {
        case 'invalid_credentials':
          return { error: 'Invalid email or password' };
        case 'user_not_found':
          return { error: 'User not found' };
        default:
          return { error: 'An error occurred during authentication' };
      }
    }
    
    // Other error types
    console.error('Unexpected error:', error);
    return { error: 'An unexpected error occurred' };
  }
}
```

## Type-Safe Role-Based Access Control

Implement type-safe RBAC with TypeScript:

```typescript
// Define available roles as a union type
type Role = 'admin' | 'manager' | 'user' | 'guest';

// Type-safe hook for checking roles
function useHasRole(requiredRole: Role): boolean {
  const { data: session } = useSession();
  return session?.user?.roles?.includes(requiredRole) ?? false;
}

// Type-safe component for role-based rendering
interface RoleGuardProps {
  requiredRole: Role;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

function RoleGuard({ requiredRole, children, fallback = null }: RoleGuardProps) {
  const hasRequiredRole = useHasRole(requiredRole);
  return hasRequiredRole ? <>{children}</> : <>{fallback}</>;
}

// Usage with type safety
function AdminContent() {
  return (
    <RoleGuard requiredRole="admin">
      <div>Admin only content</div>
    </RoleGuard>
  );
}
```

## Plugin Type Extensions

When using plugins with BetterAuth, TypeScript helps ensure proper configuration:

```typescript
import { jwtPlugin } from 'better-auth/plugins';

// Type-safe plugin configuration
const jwtConfig = jwtPlugin({
  secret: process.env.JWT_SECRET!,
  // TypeScript validates all options
  options: {
    expiresIn: 60 * 60, // 1 hour
    algorithm: 'HS256', // Type-checked algorithm
  },
});
```

For custom plugins, you can define TypeScript interfaces:

```typescript
// Define plugin options interface
interface CustomPluginOptions {
  enabled?: boolean;
  maxItems?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

// Define plugin function with type safety
function customPlugin(options: CustomPluginOptions = {}): BetterAuthPlugin {
  const {
    enabled = true,
    maxItems = 10,
    logLevel = 'info',
  } = options;
  
  return {
    name: 'custom-plugin',
    setup: ({ auth, config }) => {
      // Implementation
    },
  };
}
```

## Generating TypeScript Types

BetterAuth provides a CLI tool for generating TypeScript types from your auth configuration:

```bash
# Generate TypeScript types
npx @better-auth/cli generate-types
```

This creates a `better-auth.d.ts` file with types specific to your configuration, including:

- User type with your custom fields
- Session type with your session configuration
- Provider types based on your configured providers
- API endpoint types for your auth routes

## Type-Safe Database Queries

When working with the database, leverage TypeScript with Prisma:

```typescript
// Type-safe user query with Prisma
async function getUserWithRoles(userId: string) {
  // TypeScript knows the shape of User model from Prisma
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      roles: true,
      accounts: {
        select: {
          provider: true,
          providerAccountId: true,
        },
      },
    },
  });
  
  return user;
}
```

## Best Practices for TypeScript with BetterAuth

1. **Use `satisfies` for Configuration**: Use `satisfies BetterAuthOptions` for type checking without type narrowing.

2. **Extend User Types**: Create a declaration file to extend BetterAuth types with your custom fields.

3. **Create Type Guards**: Define type guards for common checks like role verification.

4. **Use Discriminated Unions for States**: When handling multiple states, use discriminated unions for type safety.

5. **Leverage Generic Types**: Use TypeScript's generic types for flexible, type-safe functions.

6. **Define API Contracts**: Create interfaces for request/response data in your API routes.

7. **Type Check Hooks**: Ensure your hooks have proper parameter and return types.

8. **Avoid `any`**: Prefer specific types over `any` to maintain type safety.

9. **Use Zod for Runtime Validation**: Combine TypeScript with Zod for runtime validation.

10. **Keep Type Definitions Updated**: Update your type definitions when your auth configuration changes.

## Integration with Other TypeScript Libraries

### Zod Integration

Combine BetterAuth with Zod for runtime validation:

```typescript
import { z } from 'zod';
import { signUp } from '@/lib/auth/client';

// Define schema for sign-up data
const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Type inferred from schema
type SignUpData = z.infer<typeof signUpSchema>;

// Type-safe and runtime-validated sign-up
async function handleSignUp(data: SignUpData) {
  // Validate data at runtime
  const result = signUpSchema.safeParse(data);
  
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }
  
  try {
    // TypeScript knows the shape of validated data
    await signUp(result.data);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### React Hook Form Integration

Combine BetterAuth with React Hook Form for type-safe forms:

```typescript
'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from '@/lib/auth/client';

// Define schema for sign-in data
const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SignInData = z.infer<typeof signInSchema>;

export function SignInForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
  });
  
  const onSubmit = async (data: SignInData) => {
    try {
      await signIn('email-password', data);
      // Handle successful sign-in
    } catch (error) {
      // Handle error
      console.error('Sign-in failed:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" {...register('email')} />
        {errors.email && <p>{errors.email.message}</p>}
      </div>
      
      <div>
        <label htmlFor="password">Password</label>
        <input id="password" type="password" {...register('password')} />
        {errors.password && <p>{errors.password.message}</p>}
      </div>
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  );
}
```
