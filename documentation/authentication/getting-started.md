# Getting Started with BetterAuth

This guide covers the basic setup and configuration of BetterAuth in a Next.js application.

## Installation

```bash
npm install better-auth
# If using Prisma adapter
npm install @prisma/client
```

For development and CLI tools:

```bash
npm install --save-dev @better-auth/cli
```

## Basic Configuration

BetterAuth requires two main configuration files:

1. **Server-side configuration** - Sets up auth settings, adapters, and plugins
2. **Client-side configuration** - Creates client-side auth hooks and utilities

### Server-Side Configuration

Create a configuration file (e.g., `/src/lib/auth/config.ts`):

```typescript
import { PrismaClient } from '@prisma/client';
import type { BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

const prisma = new PrismaClient();

export const authConfig = {
  appName: 'Your App Name',
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'],
  logger: {
    disabled: process.env.NODE_ENV === 'production',
    level: 'debug',
  },
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  session: {
    freshAge: 0,
    expiresIn: 60 * 60 * 24 * 3, // 3 days
    updateAge: 60 * 60 * 12, // 12 hours
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
} satisfies BetterAuthOptions;
```

### Client-Side Configuration

Create a client file (e.g., `/src/lib/auth/client.ts`):

```typescript
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

export const {
  signIn,
  signOut,
  signUp,
  updateUser,
  changePassword,
  changeEmail,
  deleteUser,
  useSession,
  revokeSession,
  getSession,
  resetPassword,
  sendVerificationEmail,
  linkSocial,
  forgetPassword,
  verifyEmail,
  listAccounts,
  listSessions,
  revokeOtherSessions,
  revokeSessions,
} = authClient;
```

## Next.js Integration

### Create Auth API Route Handler

Create a route handler at `/app/api/auth/[...better-auth]/route.ts`:

```typescript
import { createNextAppRouter } from 'better-auth/integrations/next';
import { authConfig } from '@/lib/auth/config';

export const { GET, POST, PUT, DELETE, PATCH } = createNextAppRouter(authConfig);
```

### Set Up Middleware

Create or update your Next.js middleware at `/middleware.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createNextMiddleware } from 'better-auth/integrations/next';
import { authConfig } from './lib/auth/config';

const betterAuthMiddleware = createNextMiddleware(authConfig);

export default async function middleware(req: NextRequest) {
  // Apply BetterAuth middleware
  const res = await betterAuthMiddleware(req);
  if (res) return res;
  
  // Your custom middleware logic here
  return NextResponse.next();
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};
```

## Basic Usage

### Authentication Components

Create a basic sign-in form component:

```tsx
import { useState } from 'react';
import { signIn } from '@/lib/auth/client';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn('email-password', {
        email,
        password,
      });
      // Redirect or handle successful login
    } catch (err) {
      setError('Invalid credentials');
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit">Sign In</button>
    </form>
  );
}
```

### Checking Authentication Status

```tsx
import { useSession } from '@/lib/auth/client';

export function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return <div>Please sign in to view this page</div>;
  }

  return (
    <div>
      <h1>Welcome {session.user.name || session.user.email}</h1>
      <p>Your account details:</p>
      <pre>{JSON.stringify(session.user, null, 2)}</pre>
    </div>
  );
}
```

## Command Line Interface

BetterAuth comes with a CLI tool for generating schema and TypeScript types:

```bash
# Generate schema from config
npm run betterauth:generate
```

## Next Steps

Continue exploring BetterAuth's features:

- [Authentication Providers](./authentication-providers.md) - Set up social sign-on
- [Session Management](./session-management.md) - Customize session handling
- [Role-Based Access Control](./rbac.md) - Implement permission management
