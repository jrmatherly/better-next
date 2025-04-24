# Client-Side Authentication

This document covers client-side authentication features in BetterAuth, including available hooks, utilities, and best practices for implementing authentication in client components.

## Client Setup

The BetterAuth client is configured in a dedicated file (typically `/src/lib/auth/client.ts`):

```typescript
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  // Optional configuration
  fetchOptions: {
    credentials: 'include',
  },
});

// Export all client functions
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

## Available Hooks

### useSession Hook

The most important hook in BetterAuth is `useSession`, which provides access to the current session state:

```tsx
'use client'

import { useSession } from '@/lib/auth/client';

export function ProfileComponent() {
  const { data: session, status, update } = useSession();
  
  // Status can be: 'loading', 'authenticated', or 'unauthenticated'
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  
  if (status === 'unauthenticated') {
    return <div>Please sign in to view this information</div>;
  }
  
  // User is authenticated
  return (
    <div>
      <h1>Welcome, {session.user.name || session.user.email}</h1>
      <p>Email: {session.user.email}</p>
      
      {/* Update session example */}
      <button onClick={() => update({ user: { name: 'New Name' } })}>
        Update Name
      </button>
    </div>
  );
}
```

#### Session Type Interface

```typescript
interface Session {
  sessionToken: string;
  userId: string;
  expires: string;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    roles?: string[]; // If using RBAC
    [key: string]: any; // Additional custom fields
  };
  accounts?: {
    [provider: string]: {
      access_token?: string;
      refresh_token?: string;
      id_token?: string;
      token_type?: string;
      scope?: string;
      expires_at?: number;
    };
  };
}
```

#### useSession Options

```typescript
const { data, status, update } = useSession({
  required: false, // If true, redirects to signin page when unauthenticated
  onUnauthenticated: () => {
    // Custom action when session is not authenticated
    router.push('/login');
  },
});
```

### useRole Hook

BetterAuth provides a specialized hook for handling role-based access control in client components:

```tsx
'use client'

import { useRole } from '@/hooks/use-role';

export default function RoleDependentComponent() {
  const { 
    hasRole, 
    isAdmin, 
    roles, 
    isAuthenticated, 
    isLoading 
  } = useRole();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <div>Please sign in to access this content.</div>;
  }
  
  // Admin-only content
  if (isAdmin()) {
    return <div>Admin Dashboard</div>;
  }
  
  // Content for users with 'security' role
  if (hasRole('security')) {
    return <div>Security Panel</div>;
  }
  
  // Fallback for authenticated users without specific roles
  return <div>User Dashboard</div>;
}
```

### useRole Implementation

Our implementation uses centralized role utilities to prevent code duplication and ensure consistent behavior across server and client components:

```typescript
// src/hooks/use-role.ts
import { useSession } from '@/lib/auth/client';
import { 
  ROLES, 
  type Role 
} from '@/types/roles';
import {
  hasRole as checkHasRole,
  hasAnyRole as checkHasAnyRole,
  getHighestRole as getHighestRoleUtil
} from '@/lib/auth/role-utils';
import type { ExtendedSession } from '@/types/auth.d';
import { useState, useCallback } from 'react';

export function useRole() {
  // Get the session and cast to our extended session type
  const sessionResponse = useSession();
  const session = sessionResponse.data as ExtendedSession | null;
  const isLoading = sessionResponse.isPending || false;
  const isAuthenticated = !!session?.user;
  
  // Extract user roles or use empty array as fallback
  const roles = session?.user?.roles || [];
  
  // State for managing impersonation
  const [isImpersonating, setIsImpersonating] = useState(
    session?.user?.isImpersonating || false
  );
  const [impersonationLoading, setImpersonationLoading] = useState(false);
  
  // Impersonation API functionality
  const startImpersonation = useCallback(async (role: Role) => {
    // Implementation details...
  }, [session]);
  
  const endImpersonation = useCallback(async () => {
    // Implementation details...
  }, []);
  
  return {
    // Session information
    roles,
    isLoading,
    isAuthenticated,
    
    // Impersonation state and functions
    isImpersonating: session?.user?.isImpersonating || false,
    impersonationLoading,
    startImpersonation,
    endImpersonation,
    originalRoles: session?.user?.originalRoles || [],
    
    // Role checking functions using centralized utilities
    hasRole: (role: Role) => checkHasRole(roles, role),
    hasAnyRole: (checkRoles: Role[]) => checkHasAnyRole(roles, checkRoles),
    hasAllRoles: (checkRoles: Role[]) => checkRoles.every(role => roles.includes(role)),
    
    // Convenience role check methods
    isAdmin: () => checkHasRole(roles, ROLES.ADMIN),
    isSecurity: () => checkHasRole(roles, ROLES.SECURITY),
    isDevOps: () => checkHasRole(roles, ROLES.DEVOPS),
    isDBA: () => checkHasRole(roles, ROLES.DBA),
    isCollab: () => checkHasRole(roles, ROLES.COLLAB),
    isTCC: () => checkHasRole(roles, ROLES.TCC),
    isFieldTech: () => checkHasRole(roles, ROLES.FIELDTECH),
    
    // Role hierarchy helper 
    getHighestRole: () => getHighestRoleUtil(roles),
  };
}
```

This approach ensures consistent role validation across your application by reusing the same utility functions on both server and client.

### Custom Authentication Hooks

You can create custom hooks that build on BetterAuth's functionality:

```typescript
'use client'

import { useSession, signOut } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';

// Hook for checking admin status
export function useIsAdmin() {
  const { data: session, status } = useSession();
  const isAdmin = status === 'authenticated' && 
    session?.user?.roles?.includes('admin');
  
  return { isAdmin, status, session };
}

// Hook for secure sign out with redirect
export function useSecureSignOut() {
  const router = useRouter();
  
  const handleSignOut = async (redirectUrl = '/login') => {
    await signOut();
    router.push(redirectUrl);
  };
  
  return handleSignOut;
}
```

## Authentication Functions

### Sign In

```typescript
'use client'

import { signIn } from '@/lib/auth/client';
import { useState } from 'react';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const result = await signIn('email-password', {
        email,
        password,
        redirect: true, // Auto redirect after successful sign in
        redirectUrl: '/dashboard', // Where to redirect after sign in
      });
      
      console.log('Sign in result:', result);
    } catch (err) {
      setError(err.message || 'Failed to sign in');
      console.error(err);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      {error && <div className="text-red-500">{error}</div>}
      
      <button type="submit">Sign In</button>
    </form>
  );
}
```

### Sign Up

```typescript
'use client'

import { signUp } from '@/lib/auth/client';
import { useState } from 'react';

export function SignUpForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    try {
      const result = await signUp({
        name,
        email,
        password,
      });
      
      setMessage('Account created! Please check your email for verification.');
      console.log('Sign up result:', result);
    } catch (err) {
      setError(err.message || 'Failed to create account');
      console.error(err);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      {error && <div className="text-red-500">{error}</div>}
      {message && <div className="text-green-500">{message}</div>}
      
      <button type="submit">Create Account</button>
    </form>
  );
}
```

### Sign Out

```typescript
'use client'

import { signOut } from '@/lib/auth/client';

export function SignOutButton() {
  const handleSignOut = async () => {
    try {
      await signOut({
        redirectUrl: '/login', // Where to redirect after sign out
        signOutFromProvider: true, // Also sign out from social provider (where supported)
      });
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };
  
  return (
    <button onClick={handleSignOut} className="text-red-500">
      Sign Out
    </button>
  );
}
```

### User Management

Update user profile information:

```typescript
'use client'

import { updateUser } from '@/lib/auth/client';
import { useState } from 'react';
import { useSession } from '@/lib/auth/client';

export function ProfileEditor() {
  const { data: session, update: updateSession } = useSession();
  const [name, setName] = useState(session?.user?.name || '');
  const [message, setMessage] = useState('');
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    try {
      const result = await updateUser({
        name,
      });
      
      // Update session data to reflect changes
      await updateSession();
      
      setMessage('Profile updated successfully');
    } catch (error) {
      setMessage(`Failed to update profile: ${error.message}`);
    }
  };
  
  return (
    <form onSubmit={handleUpdateProfile}>
      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      
      {message && <div>{message}</div>}
      
      <button type="submit">Update Profile</button>
    </form>
  );
}
```

### Password Management

Change or reset password:

```typescript
'use client'

import { changePassword, forgetPassword } from '@/lib/auth/client';
import { useState } from 'react';

// Change password component
export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    try {
      await changePassword({
        currentPassword,
        newPassword,
      });
      
      setMessage('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      setMessage(`Failed to change password: ${error.message}`);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="currentPassword">Current Password</label>
        <input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label htmlFor="newPassword">New Password</label>
        <input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </div>
      
      {message && <div>{message}</div>}
      
      <button type="submit">Change Password</button>
    </form>
  );
}

// Forgot password component
export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    try {
      await forgetPassword(email);
      setMessage('Password reset email sent. Please check your inbox.');
    } catch (error) {
      setMessage(`Failed to send reset email: ${error.message}`);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      {message && <div>{message}</div>}
      
      <button type="submit">Reset Password</button>
    </form>
  );
}
```

### Email Verification

Send or verify email verification:

```typescript
'use client'

import { sendVerificationEmail, verifyEmail } from '@/lib/auth/client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

// Send verification email component
export function SendVerificationEmailButton() {
  const [message, setMessage] = useState('');
  
  const handleSendVerification = async () => {
    setMessage('');
    
    try {
      await sendVerificationEmail();
      setMessage('Verification email sent. Please check your inbox.');
    } catch (error) {
      setMessage(`Failed to send verification email: ${error.message}`);
    }
  };
  
  return (
    <div>
      <button onClick={handleSendVerification}>
        Send Verification Email
      </button>
      {message && <div>{message}</div>}
    </div>
  );
}

// Verify email component (for verification page)
export function VerifyEmailComponent() {
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  
  const token = searchParams.get('token');
  
  const handleVerify = async () => {
    if (!token) {
      setError('Invalid verification token');
      return;
    }
    
    setVerifying(true);
    setError('');
    
    try {
      await verifyEmail(token);
      setVerified(true);
    } catch (error) {
      setError(`Verification failed: ${error.message}`);
    } finally {
      setVerifying(false);
    }
  };
  
  return (
    <div>
      {!verified && !verifying && (
        <button onClick={handleVerify} disabled={!token}>
          Verify Email
        </button>
      )}
      
      {verifying && <div>Verifying your email...</div>}
      {verified && <div>Email verified successfully!</div>}
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}
```

## Authentication Context Provider

BetterAuth automatically sets up a React context provider for authentication. To make it available throughout your app, wrap your application with the `AuthProvider`:

```tsx
// In your root layout.tsx or app component
'use client'

import { AuthProvider } from 'better-auth/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider baseURL={process.env.NEXT_PUBLIC_APP_URL}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

## Protected Routes/Components

Create a reusable component to protect routes:

```tsx
'use client'

import { useSession } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export function ProtectedRoute({ children, requiredRoles = [] }: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?returnUrl=' + encodeURIComponent(window.location.pathname));
    } else if (status === 'authenticated' && requiredRoles.length > 0) {
      // Check roles
      const userRoles = session?.user?.roles || [];
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
      
      if (!hasRequiredRole) {
        router.push('/unauthorized');
      }
    }
  }, [status, router, requiredRoles, session]);
  
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  
  if (status === 'unauthenticated' || 
      (requiredRoles.length > 0 && 
       !requiredRoles.some(role => session?.user?.roles?.includes(role)))) {
    return null;
  }
  
  return <>{children}</>;
}
```

Usage:

```tsx
export default function AdminPage() {
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <div>Admin Dashboard</div>
    </ProtectedRoute>
  );
}
```

## Error Handling

Handle client-side authentication errors:

```typescript
'use client'

import { signIn } from '@/lib/auth/client';

async function handleAuthentication() {
  try {
    await signIn('email-password', {
      email: 'user@example.com',
      password: 'password',
    });
  } catch (error) {
    // Handle specific error types
    if (error.code === 'invalid_credentials') {
      console.error('Invalid email or password');
    } else if (error.code === 'user_not_found') {
      console.error('User not found');
    } else if (error.code === 'email_not_verified') {
      console.error('Please verify your email before signing in');
    } else {
      console.error('Authentication error:', error.message);
    }
  }
}
```

## Advanced Client Configuration

For advanced use cases, you can customize the client configuration:

```typescript
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  
  // Custom fetch options
  fetchOptions: {
    credentials: 'include',
    headers: {
      'X-Custom-Header': 'value',
    },
  },
  
  // Global error handler
  onError: (error) => {
    console.error('BetterAuth error:', error);
    // Custom error reporting
  },
  
  // Session refresh interval (ms)
  refreshInterval: 60 * 1000, // 1 minute
  
  // Customize session data
  transformSession: (session) => {
    // Modify session data before returning to components
    return {
      ...session,
      user: {
        ...session.user,
        displayName: session.user.name || session.user.email?.split('@')[0],
      },
    };
  },
});
```

### RoleAccess Component

```tsx
// src/components/role-access.tsx
import { useRole } from '@/hooks/use-role';

export default function RoleAccessComponent() {
  const { 
    hasRole, 
    isAdmin, 
    roles, 
    isAuthenticated, 
    isLoading 
  } = useRole();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <div>Please sign in to access this content.</div>;
  }
  
  // Admin-only content
  if (isAdmin()) {
    return <div>Admin Dashboard</div>;
  }
  
  // Content for users with 'security' role
  if (hasRole('security')) {
    return <div>Security Panel</div>;
  }
  
  // Fallback for authenticated users without specific roles
  return <div>User Dashboard</div>;
}
