# User Management

This document covers how to manage users and accounts in BetterAuth, including creation, updating, deletion, and related operations.

## User Model

The BetterAuth user model consists of:

- Core user information (id, email, name, etc.)
- Associated accounts (social providers)
- Sessions
- Custom fields (roles, preferences, etc.)

### Default User Schema

```typescript
interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  roles?: string[];
  [key: string]: any; // Additional custom fields
}
```

## User Operations

### Creating Users

#### Server-Side User Creation

```typescript
'use server'

import { BetterAuth } from 'better-auth';
import { authConfig } from '@/lib/auth/config';

const auth = new BetterAuth(authConfig);

export async function createUser(data: {
  email: string;
  password: string;
  name?: string;
  roles?: string[];
}) {
  try {
    const user = await auth.user.create({
      email: data.email,
      password: data.password,
      name: data.name,
      roles: data.roles || ['user'],
    });
    
    return { success: true, user };
  } catch (error) {
    console.error('Failed to create user:', error);
    return { success: false, error: error.message };
  }
}
```

#### Client-Side Sign Up

```tsx
'use client'

import { signUp } from '@/lib/auth/client';
import { useState } from 'react';

export function SignUpForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await signUp({
        name,
        email,
        password,
      });
      
      // Success message or redirect
    } catch (err) {
      setError(err.message || 'Failed to create account');
    }
  };
  
  // Form JSX...
}
```

### Retrieving Users

#### Get Current User

```typescript
// Client-side
import { getSession } from '@/lib/auth/client';

async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

// Server-side
import { getServerSession } from 'better-auth/integrations/next';
import { authConfig } from '@/lib/auth/config';

export async function getUser() {
  const session = await getServerSession(authConfig);
  return session?.user;
}
```

#### Get User by ID

```typescript
'use server'

import { BetterAuth } from 'better-auth';
import { authConfig } from '@/lib/auth/config';

const auth = new BetterAuth(authConfig);

export async function getUserById(userId: string) {
  try {
    const user = await auth.user.getById(userId);
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### Updating Users

#### Update User Profile

```typescript
// Client-side
import { updateUser } from '@/lib/auth/client';

async function updateProfile(data: { name?: string; image?: string }) {
  try {
    const result = await updateUser(data);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Server-side
'use server'

import { BetterAuth } from 'better-auth';
import { authConfig } from '@/lib/auth/config';

const auth = new BetterAuth(authConfig);

export async function updateUserProfile(userId: string, data: {
  name?: string;
  image?: string;
  [key: string]: any;
}) {
  try {
    const user = await auth.user.update(userId, data);
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### Deleting Users

```typescript
// Client-side
import { deleteUser } from '@/lib/auth/client';

async function handleDeleteAccount() {
  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    try {
      await deleteUser();
      // Redirect to home page or sign-in page
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  }
}

// Server-side
'use server'

import { BetterAuth } from 'better-auth';
import { authConfig } from '@/lib/auth/config';

const auth = new BetterAuth(authConfig);

export async function deleteUserById(userId: string) {
  try {
    await auth.user.delete(userId);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

## Account Management

### Listing Linked Accounts

```typescript
// Client-side
import { listAccounts } from '@/lib/auth/client';
import { useState, useEffect } from 'react';

export function LinkedAccounts() {
  const [accounts, setAccounts] = useState([]);
  
  useEffect(() => {
    async function fetchAccounts() {
      try {
        const accountsList = await listAccounts();
        setAccounts(accountsList);
      } catch (error) {
        console.error('Failed to fetch accounts:', error);
      }
    }
    
    fetchAccounts();
  }, []);
  
  return (
    <div>
      <h2>Linked Accounts</h2>
      <ul>
        {accounts.map(account => (
          <li key={account.id}>
            {account.provider} - {account.providerAccountId}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Linking Social Accounts

```typescript
// Client-side
import { linkSocial } from '@/lib/auth/client';

export function LinkAccountButton({ provider }) {
  const handleLinkAccount = async () => {
    try {
      await linkSocial(provider);
      // The page will be redirected to the provider's authorization page
    } catch (error) {
      console.error(`Failed to link ${provider} account:`, error);
    }
  };
  
  return (
    <button onClick={handleLinkAccount}>
      Link {provider} Account
    </button>
  );
}
```

### Unlinking Social Accounts

```typescript
// Client-side
import { unlinkSocial } from '@/lib/auth/client';

export function UnlinkAccountButton({ provider, onSuccess }) {
  const handleUnlinkAccount = async () => {
    try {
      await unlinkSocial(provider);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(`Failed to unlink ${provider} account:`, error);
    }
  };
  
  return (
    <button onClick={handleUnlinkAccount} className="text-red-500">
      Unlink {provider}
    </button>
  );
}
```

## Email and Password Management

### Changing Email

```typescript
// Client-side
import { changeEmail } from '@/lib/auth/client';
import { useState } from 'react';

export function ChangeEmailForm() {
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    try {
      await changeEmail({
        newEmail,
        password,
      });
      
      setMessage('Email change initiated. Please check your new email for verification.');
    } catch (error) {
      setMessage(`Failed to change email: ${error.message}`);
    }
  };
  
  // Form JSX...
}
```

### Changing Password

```typescript
// Client-side
import { changePassword } from '@/lib/auth/client';
import { useState } from 'react';

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
  
  // Form JSX...
}
```

### Password Reset Flow

```typescript
// Request password reset
import { forgetPassword } from '@/lib/auth/client';

async function requestPasswordReset(email: string) {
  try {
    await forgetPassword(email);
    return { success: true, message: 'Password reset email sent' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Reset password with token
import { resetPassword } from '@/lib/auth/client';

async function completePasswordReset(token: string, password: string) {
  try {
    await resetPassword({
      token,
      password,
    });
    return { success: true, message: 'Password reset successfully' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

## Email Verification

### Sending Verification Email

```typescript
// Client-side
import { sendVerificationEmail } from '@/lib/auth/client';

export function SendVerificationEmailButton() {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  
  const handleSendVerification = async () => {
    setSending(true);
    setMessage('');
    
    try {
      await sendVerificationEmail();
      setMessage('Verification email sent. Please check your inbox.');
    } catch (error) {
      setMessage(`Failed to send verification email: ${error.message}`);
    } finally {
      setSending(false);
    }
  };
  
  return (
    <div>
      <button 
        onClick={handleSendVerification}
        disabled={sending}
      >
        {sending ? 'Sending...' : 'Send Verification Email'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}
```

### Verifying Email

```typescript
// Client-side
import { verifyEmail } from '@/lib/auth/client';
import { useSearchParams } from 'next/navigation';

export function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState({ success: false, message: '' });
  
  const token = searchParams.get('token');
  
  useEffect(() => {
    if (token) {
      verifyEmailToken(token);
    } else {
      setResult({
        success: false,
        message: 'Invalid verification link. No token provided.',
      });
    }
  }, [token]);
  
  async function verifyEmailToken(token: string) {
    setVerifying(true);
    
    try {
      await verifyEmail(token);
      setResult({
        success: true,
        message: 'Email verified successfully!',
      });
    } catch (error) {
      setResult({
        success: false,
        message: `Verification failed: ${error.message}`,
      });
    } finally {
      setVerifying(false);
    }
  }
  
  // Render verification result...
}
```

## Role-Based Access Control

### Assigning Roles

```typescript
'use server'

import { BetterAuth } from 'better-auth';
import { authConfig } from '@/lib/auth/config';

const auth = new BetterAuth(authConfig);

export async function assignRoles(userId: string, roles: string[]) {
  try {
    const user = await auth.user.update(userId, {
      roles,
    });
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### Checking User Roles

```typescript
// Client-side
import { useSession } from '@/lib/auth/client';

export function useUserRoles() {
  const { data: session } = useSession();
  const roles = session?.user?.roles || [];
  
  return {
    roles,
    hasRole: (role: string) => roles.includes(role),
    isAdmin: () => roles.includes('admin'),
  };
}

// Server-side
import { getServerSession } from 'better-auth/integrations/next';
import { authConfig } from '@/lib/auth/config';

export async function hasRole(role: string) {
  const session = await getServerSession(authConfig);
  if (!session) return false;
  
  const roles = session.user.roles || [];
  return roles.includes(role);
}
```

## User Administration

### User Management Dashboard

```tsx
'use client'

import { useState, useEffect } from 'react';
import { getUsers, updateUserRoles, deleteUser } from './actions';

export function UserAdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchUsers() {
      try {
        const result = await getUsers();
        if (result.success) {
          setUsers(result.users);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUsers();
  }, []);
  
  // Handle role updates and user deletion
  
  // Render user table with actions
}

// Server Action
'use server'

import { BetterAuth } from 'better-auth';
import { authConfig } from '@/lib/auth/config';

const auth = new BetterAuth(authConfig);

export async function getUsers() {
  try {
    // Implement pagination for large user bases
    const users = await auth.user.findMany({
      take: 100,
      include: {
        accounts: true,
      },
    });
    
    return { success: true, users };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### Impersonation Feature

```typescript
'use server'

import { cookies } from 'next/headers';
import { BetterAuth } from 'better-auth';
import { authConfig } from '@/lib/auth/config';
import { getServerSession } from 'better-auth/integrations/next';

const auth = new BetterAuth(authConfig);

// Start impersonation
export async function startImpersonation(targetUserId: string) {
  const session = await getServerSession(authConfig);
  
  if (!session) {
    throw new Error('Not authenticated');
  }
  
  // Check if user is admin
  const userRoles = session.user.roles || [];
  if (!userRoles.includes('admin')) {
    throw new Error('Only administrators can impersonate users');
  }
  
  // Store original user ID in a secure cookie
  cookies().set('original-user-id', session.user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
  });
  
  // Get target user
  const targetUser = await auth.user.getById(targetUserId);
  
  // Create a new session for the target user
  const impersonationSession = await auth.session.create({
    userId: targetUserId,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
  });
  
  // Set the impersonation flag
  await auth.session.update(impersonationSession.sessionToken, {
    isImpersonating: true,
    impersonatedBy: session.user.id,
  });
  
  // Set the session cookie
  cookies().set(
    auth.options.session.cookie.name,
    impersonationSession.sessionToken,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
    }
  );
  
  return { success: true, user: targetUser };
}

// End impersonation
export async function endImpersonation() {
  const session = await getServerSession(authConfig);
  
  if (!session) {
    throw new Error('Not authenticated');
  }
  
  // Check if this is an impersonation session
  if (!session.isImpersonating) {
    throw new Error('Not currently impersonating');
  }
  
  // Get the original user ID
  const originalUserIdCookie = cookies().get('original-user-id');
  if (!originalUserIdCookie) {
    throw new Error('Original user ID not found');
  }
  
  const originalUserId = originalUserIdCookie.value;
  
  // Create a new session for the original user
  const originalSession = await auth.session.create({
    userId: originalUserId,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
  });
  
  // Set the session cookie
  cookies().set(
    auth.options.session.cookie.name,
    originalSession.sessionToken,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
    }
  );
  
  // Clear the impersonation cookie
  cookies().delete('original-user-id');
  
  return { success: true };
}
```

## Users & Accounts Relationships

The BetterAuth schema defines relationships between users and their accounts:

- One user can have multiple accounts (OAuth providers)
- Each account is linked to exactly one user
- Accounts store provider-specific data (tokens, user IDs)

### User-Account Relationship

```typescript
// User with accounts
interface User {
  id: string;
  name?: string;
  email?: string;
  // Other user fields
  accounts: Account[];
}

// Account linked to a user
interface Account {
  id: string;
  userId: string;
  provider: string;
  providerAccountId: string;
  // OAuth tokens and data
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  // More fields
}
```

### Best Practices for User Management

1. **Email Verification**: Always require email verification for new accounts
2. **Password Policies**: Enforce strong password requirements
3. **Account Deduplication**: Handle merging of accounts when users sign in with multiple providers
4. **Data Privacy**: Implement proper user data deletion procedures
5. **Audit Logging**: Track important user operations (role changes, account deletion)
6. **Rate Limiting**: Prevent abuse of user management functions
7. **Input Validation**: Validate all user inputs to prevent security issues
8. **User Feedback**: Provide clear feedback for all user operations
9. **Session Management**: Implement proper session handling for authentication changes
10. **Role-Based Controls**: Restrict administrative functions to authorized roles
