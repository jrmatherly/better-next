# Session Management

This document covers how sessions are managed in BetterAuth, including configuration, retrieval, and manipulation of user sessions both on the client and server side.

## Session Configuration

Sessions in BetterAuth are highly configurable. Configure session behavior in your auth config file:

```typescript
// In src/lib/auth/config.ts
export const authConfig = {
  // Other config...
  
  session: {
    // How long until the session expires (in seconds)
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    
    // How often to update the session token (in seconds)
    updateAge: 60 * 60 * 24, // 1 day
    
    // How long a session is considered "fresh" (in seconds)
    // 0 means always considered fresh
    freshAge: 0,
    
    // Cookie configuration for storing session data
    cookie: {
      name: 'better-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    
    // Cookie cache configuration (improves performance)
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
} satisfies BetterAuthOptions;
```

## Accessing the User Session

### Client-Side Session Access

Use the `useSession` hook to access the current user's session in client components:

```tsx
'use client'

import { useSession } from '@/lib/auth/client';

export function UserProfile() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  
  if (status !== 'authenticated') {
    return <div>Not signed in</div>;
  }
  
  return (
    <div>
      <h1>Welcome, {session.user.name || session.user.email}</h1>
      <p>Email: {session.user.email}</p>
      {session.user.image && (
        <img 
          src={session.user.image} 
          alt={session.user.name || 'User'} 
          width={48} 
          height={48} 
        />
      )}
      
      {/* Display user roles if available */}
      {session.user.roles && (
        <div>
          <h2>Your Roles:</h2>
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

For non-React environments or for imperative calls, use `getSession`:

```typescript
'use client'

import { getSession } from '@/lib/auth/client';

async function fetchUserData() {
  const session = await getSession();
  
  if (!session) {
    console.log('User is not signed in');
    return null;
  }
  
  console.log('User is signed in', session.user);
  return session.user;
}
```

### Server-Side Session Access

In server components and API routes, use the server-side session access methods:

#### In Server Components (App Router)

```tsx
// In a server component
import { getServerSession } from 'better-auth/integrations/next';
import { authConfig } from '@/lib/auth/config';

export default async function ProfilePage() {
  const session = await getServerSession(authConfig);
  
  if (!session) {
    return <div>Please sign in to view this page</div>;
  }
  
  return (
    <div>
      <h1>Server Side Profile</h1>
      <p>Welcome {session.user.name || session.user.email}</p>
      
      {/* Display any session data */}
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}
```

#### In API Routes (App Router)

```typescript
// In app/api/protected-route/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'better-auth/integrations/next';
import { authConfig } from '@/lib/auth/config';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authConfig);
  
  if (!session) {
    return NextResponse.json(
      { error: 'You must be signed in to access this endpoint' },
      { status: 401 }
    );
  }
  
  return NextResponse.json({
    message: 'This is protected data',
    user: session.user,
  });
}
```

## Session Management Operations

### Revoking Sessions

You can revoke the current session or other sessions:

```typescript
// Client-side
import { revokeSession, revokeOtherSessions, revokeSessions } from '@/lib/auth/client';

// Revoke current session (logs the user out)
async function handleLogout() {
  await revokeSession();
  // Redirect user to login page
}

// Revoke all other sessions except the current one
async function handleRevokeOtherSessions() {
  await revokeOtherSessions();
  // Show success message
}

// Revoke specific sessions by ID
async function handleRevokeSpecificSessions(sessionIds: string[]) {
  await revokeSessions(sessionIds);
  // Show success message
}
```

### Listing Active Sessions

List all active sessions for the current user:

```tsx
'use client'

import { useState, useEffect } from 'react';
import { listSessions } from '@/lib/auth/client';

export function ActiveSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchSessions() {
      try {
        const sessionList = await listSessions();
        setSessions(sessionList);
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchSessions();
  }, []);
  
  if (loading) {
    return <div>Loading sessions...</div>;
  }
  
  return (
    <div>
      <h2>Your Active Sessions</h2>
      <table>
        <thead>
          <tr>
            <th>Device</th>
            <th>IP Address</th>
            <th>Last Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session.id}>
              <td>{session.device || 'Unknown device'}</td>
              <td>{session.ip || 'Unknown'}</td>
              <td>{new Date(session.lastActive).toLocaleString()}</td>
              <td>
                <button 
                  onClick={() => revokeSessions([session.id])}
                  className="text-red-500"
                >
                  Revoke
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## Session Internals

BetterAuth uses a secure cookie-based session strategy by default:

1. When a user signs in, a session is created and stored in the database
2. A session token is generated and stored in an HTTP-only cookie
3. On subsequent requests, the session token is verified and used to retrieve the user's session
4. The session is automatically refreshed based on the `updateAge` configuration

### Session Structure

A typical session object looks like this:

```typescript
{
  sessionToken: 'session-token-value',
  userId: 'user-id',
  expires: '2025-05-23T16:07:40.000Z',
  user: {
    id: 'user-id',
    name: 'John Doe',
    email: 'john@example.com',
    image: 'https://example.com/profile.jpg',
    roles: ['admin', 'user'],
    // Additional custom fields
  },
  // Provider-specific tokens when storeTokens is enabled
  accounts: {
    microsoft: {
      access_token: 'microsoft-access-token',
      refresh_token: 'microsoft-refresh-token',
      id_token: 'microsoft-id-token',
      token_type: 'Bearer',
      scope: 'openid profile email User.Read',
      expires_at: 1682345678
    }
  }
}
```

## Extending the Session

You can extend the session object with custom data:

```typescript
// In your auth config
export const authConfig = {
  // Other config...
  
  callbacks: {
    async session({ session, user }) {
      // Add custom data to the session
      return {
        ...session,
        user: {
          ...session.user,
          roles: user.roles || [],
          customData: user.customData,
          lastLogin: user.lastLogin,
        },
      };
    },
  },
};
```

## Session Security

BetterAuth implements several security features for sessions:

1. **HTTP-Only Cookies**: Session tokens are stored in HTTP-only cookies to prevent JavaScript access
2. **Secure Flag**: In production, cookies are marked as secure to ensure they're only sent over HTTPS
3. **SameSite Protection**: Cookies use SameSite=Lax by default to prevent CSRF attacks
4. **Session Rotation**: Session tokens are rotated based on the updateAge configuration
5. **Session Expiration**: Sessions expire after a configurable period of inactivity

## Session with Redis Secondary Storage

For high-performance environments or multi-server setups, Redis can be used as a secondary storage for sessions:

```typescript
import { PrismaClient } from '@prisma/client';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { createRedisSecondaryStorage } from 'better-auth/storage/redis';
import Redis from 'ioredis';

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL);

export const authConfig = {
  // Other config...
  
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
    secondaryStorage: createRedisSecondaryStorage({
      redis,
      prefix: 'better-auth:',
      ttl: 60 * 60 * 24 * 30, // 30 days (should match session expiresIn)
    }),
  }),
};
```

This configuration:

1. Uses Prisma for primary storage of user and account data
2. Uses Redis for faster session retrieval and validation
3. Automatically synchronizes session data between Prisma and Redis
4. Improves performance for high-traffic applications
