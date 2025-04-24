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
    
    // Disable cookie cache to prevent session data size issues
    cookieCache: {
      enabled: false, // Disabled to prevent "Session data too large" errors
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

## Session Storage Options

BetterAuth provides several options for session storage. Our implementation uses the following strategy:

### Database Storage

By default, BetterAuth stores session data in the database when cookie caching is disabled. This is our chosen approach because:

1. It's reliable across all environments including middleware
2. It handles large session data from Microsoft SSO without size limitations
3. It works seamlessly with our Prisma adapter
4. It simplifies our authentication architecture

To configure database-only session storage, we disable the cookie cache:

```typescript
// src/lib/auth/config.ts
export const authConfig = {
  // Other config...
  session: {
    freshAge: 0,
    expiresIn: 60 * 60 * 24 * 3, // 3 days
    updateAge: 60 * 60 * 12, // 12 hours
    cookieCache: {
      enabled: false, // Disabled to prevent "Session data too large" errors with Microsoft SSO
    },
    // BetterAuth automatically uses the database when cookieCache is disabled
  },
};
```

### Cookie Storage (Not Used)

While BetterAuth can store sessions in cookies, we've disabled this option because:

1. Microsoft authentication can return large amounts of profile data
2. Storing this data in cookies can lead to "Session data too large" errors
3. Cookie storage has size limitations (~4KB)

### Secondary Storage (Removed)

> **⚠️ Note: We previously attempted to use Redis as secondary storage but have removed it due to compatibility issues with middleware and session management.**

We found that using Redis as secondary storage led to issues with session recognition despite having valid session cookies. For this reason, we've simplified our approach to use only database storage for sessions.

## Handling Large Session Data

Microsoft authentication can return large amounts of data, especially when requesting user groups, roles, and other profile information. To manage this:

**Disabled Cookie Cache**: We prevent session data from being stored in cookies, avoiding size limits.
**Database Storage**: All session data is stored in the PostgreSQL database.
**Minimized JWT Payload**: We only include essential data in the JWT token:

```typescript
// src/lib/auth/server.ts
async jwt({ token, account, user, profile }) {
  // Only store essential data in the token
  token.roles = parseRoles(msRoles.length > 0 ? msRoles : user.roles);
  token.groups = msGroups.filter((group: unknown): group is string => typeof group === 'string');
  token.isImpersonating = user.isImpersonating || false;
  token.originalRoles = user.originalRoles || [];
}
```

**Minimized Session Data**: The session callback also keeps only necessary data:

```typescript
async session({ session, token }) {
  return {
    ...session,
    user: {
      id: token.id as string,
      email: token.email as string,
      name: (token.name as string) || null,
      image: (token.image as string) || null,
      roles: parseRoles(token.roles),
      isImpersonating: !!token.isImpersonating,
      ...(token.isImpersonating ? { originalRoles: (token.originalRoles as string[]) || [] } : {}),
      ...(Array.isArray(token.groups) && token.groups.length > 0 ? {
        groups: (token.groups as string[]).slice(0, 5) // Limit to top 5 groups
      } : {}),
    },
  };
}
```

This approach ensures that our sessions work reliably across all environments, including middleware.
