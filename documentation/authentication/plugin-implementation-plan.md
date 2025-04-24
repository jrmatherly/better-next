# BetterAuth Plugins: Client-Side Implementation Plan

## Overview

This document outlines a comprehensive plan for implementing client-side integration of BetterAuth plugins in our application. We've already configured the server-side plugins (Admin, API Key, JWT, Organization, and OpenAPI) in our auth configuration. Now we need to properly integrate these plugins on the client-side to enable their features throughout our React components.

## Current State Assessment

### Existing Components

1. **Server-Side Configuration**
   - Configured in `src/lib/auth/config.ts`
   - All five plugins added (Admin, API Key, JWT, Organization, OpenAPI)

2. **Client-Side Auth Client**
   - Located at `src/lib/auth/client.ts`
   - Basic implementation using `createAuthClient` from 'better-auth/react'
   - Exports standard auth functions (signIn, signOut, useSession, etc.)
   - Currently doesn't include plugin-specific functionality

3. **App Layout**
   - Located at `src/app/layout.tsx`
   - Includes ThemeProvider but no AuthProvider

### Missing Components

1. **Plugin-Specific Client Configuration**
   - No plugin client integrations in auth client
   - Missing plugin-specific hooks and functions

2. **AuthProvider Component**
   - No central AuthProvider to provide auth context to app
   - No plugin provider integration

3. **Client-Side Plugin Features**
   - Missing hooks, functions and UI components for:
     - Admin dashboard management
     - API key generation and management
     - JWT token handling
     - Organization management
     - API documentation interaction

## Implementation Status

This document outlines the current implementation status of our plugin integration plan.

### Phase 1: Core Client-Side Infrastructure

- [x] Added plugin integrations in auth client
- [x] Created centralized type definitions in `/src/types/plugins.d.ts`, `/src/types/auth.d.ts`, and `/src/types/admin.d.ts`
- [x] Implemented AuthProvider with proper context

### Phase 2: Plugin-Specific Hooks and UI Components

- [x] Implemented Admin plugin hooks and components
- [x] Implemented API Key plugin hooks and components
- [x] Implemented JWT plugin hooks and components
- [x] Implemented Organization plugin hooks and components
- [x] Added proper type safety and error handling

### Phase 3: Plugin-Specific Pages and Route Protection

- [x] Created Admin dashboard page
- [x] Created API Keys management page
- [x] Created JWT tools page
- [x] Created Organizations management page
- [x] Updated middleware for role-based route protection

### Phase 4: Security Enhancements and Role-Based Guards

- [x] Created reusable RoleGuard component in `/src/components/auth/role-guard.tsx`
- [x] Implemented AccessDeniedAlert for permissions errors in `/src/components/auth/access-denied-alert.tsx`
- [x] Created ProtectedLayout for section-level access control in `/src/components/auth/protected-layout.tsx`
- [x] Added impersonation-aware role hooks that respect both real and impersonated roles
- [x] Centralized all interface definitions in `/src/types` directory
- [x] Created protected layout components for each plugin section
- [x] Improved error handling and loading states

## Role and Plugin Access Structure

The following roles now have access to these plugin features:

1. **Admin Plugin**
   - Access limited to: `admin` role
   - Features: User management, stats, search, and filtering

2. **API Keys Plugin**
   - Access limited to: `admin`, `security`, and `devops` roles
   - Features: Key creation, deletion, and management

3. **JWT Plugin**
   - Access limited to: `admin`, `security`, and `devops` roles
   - Features: Token inspection, validation, and debugging

4. **Organization Plugin**
   - Access allowed for: All authenticated users
   - Features: Organization viewing (all users) and management (admins only)

5. **OpenAPI Plugin**
   - Access limited to: `admin`, `security`, and `devops` roles
   - Features: API documentation access and exploration

## Component Architecture

Our auth component architecture now follows this pattern:

1. **Type Definitions**
   - `auth.d.ts` - Core auth types (User, Session, etc.)
   - `roles.ts` - Role constants and type
   - `plugins.d.ts` - Plugin-specific types
   - `admin.d.ts` - Admin-specific types

2. **Utils and Hooks**
   - `role-utils.ts` - Core role utilities
   - `use-impersonation-aware-role.ts` - Role hooks with impersonation support
   - `use-plugin-access.ts` - Plugin-specific access control

3. **Components**
   - `RoleGuard` - Component-level RBAC
   - `ProtectedLayout` - Section-level RBAC
   - `AccessDeniedAlert` - Standardized error display

4. **Layout Protection**
   - Plugin-specific layouts (e.g., `app/admin/layout.tsx`, etc.)
   - Each with appropriate role restrictions

This architecture provides complete type safety while ensuring only authorized users can access sensitive features. The implementation supports role impersonation for testing purposes without compromising security.

## Implementation Plan

### Phase 1: Core Client-Side Infrastructure Implementation

#### 1. Update Auth Client with Plugin Support

**File:** `src/lib/auth/client.ts`  
**Approach:** Enhance existing client with plugin support

```typescript
// src/lib/auth/client.ts
import { createAuthClient } from 'better-auth/react';
import { 
  adminClient, 
  apiKeyClient, 
  jwtClient, 
  organizationClient 
} from 'better-auth/react/plugins';
import { env } from '../../env';

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  plugins: [
    adminClient(),
    apiKeyClient(),
    jwtClient(),
    organizationClient(),
  ],
});

// Keep existing exports
export const {
  signIn,
  signOut,
  signUp,
  // ...other existing exports
} = authClient;

// Add plugin-specific exports
export const {
  // Admin plugin exports
  getUsers,
  getUser,
  updateUserAsAdmin,
  getUserStats,
} = authClient.admin || {};

// API Key plugin exports
export const {
  createApiKey,
  listApiKeys,
  deleteApiKey,
  validateApiKey,
} = authClient.apiKey || {};

// JWT plugin exports
export const {
  generateToken,
  verifyToken,
  refreshToken,
} = authClient.jwt || {};

// Organization plugin exports
export const {
  createOrganization,
  inviteUser,
  acceptInvitation,
  listOrganizations,
  switchOrganization,
} = authClient.organization || {};
```

#### 2. Create Auth Provider Component

**File:** `src/providers/auth-provider.tsx`  
**Approach:** Create new provider directory and component

```typescript
// src/providers/auth-provider.tsx
'use client';

import { AuthProvider } from 'better-auth/react';
import { authClient } from '@/lib/auth/client';
import { type ReactNode } from 'react';

export function BetterAuthProvider({ children }: { children: ReactNode }) {
  return <AuthProvider client={authClient}>{children}</AuthProvider>;
}
```

#### 3. Update App Layout

**File:** `src/app/layout.tsx`  
**Approach:** Integrate auth provider with existing layout

```typescript
import '../styles/globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { BetterAuthProvider } from '@/providers/auth-provider';
import { Toaster } from '@/components/ui/sonner';
import { createMetadata } from '@/lib/metadata';
import { APP_NAME } from '@/lib/settings';
import Analytics from '@/script/analytics';

export const metadata = createMetadata({
  title: {
    template: `%s | ${APP_NAME}`,
    default: APP_NAME,
  },
  description: 'The easiest way to get started with your next project',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <Analytics />
      </head>
      <body className={'antialiased'}>
        <BetterAuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </BetterAuthProvider>
      </body>
    </html>
  );
}
```

### Phase 2: Plugin-Specific Hooks and UI Components Implementation

#### 1. Create Custom Hooks for Each Plugin

**File:** `src/hooks/use-admin.ts`

```typescript
'use client';

import { useAdmin as useAdminBase } from 'better-auth/react/plugins';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export function useAdmin() {
  const admin = useAdminBase();
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = useCallback(async (options = {}) => {
    setIsLoading(true);
    try {
      const result = await admin.getUsers(options);
      return result;
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [admin]);

  return {
    ...admin,
    fetchUsers,
    isLoading,
  };
}
```

**File:** `src/hooks/use-api-keys.ts`

```typescript
'use client';

import { useApiKeys as useApiKeysBase } from 'better-auth/react/plugins';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export function useApiKeys() {
  const apiKeys = useApiKeysBase();
  const [isLoading, setIsLoading] = useState(false);

  const createKey = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const result = await apiKeys.createKey(data);
      toast.success('API key created successfully');
      return result;
    } catch (error) {
      toast.error('Failed to create API key');
      console.error(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [apiKeys]);

  return {
    ...apiKeys,
    createKey,
    isLoading,
  };
}
```

**File:** `src/hooks/use-jwt.ts`

```typescript
'use client';

import { useJwt as useJwtBase } from 'better-auth/react/plugins';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export function useJwt() {
  const jwt = useJwtBase();
  const [isLoading, setIsLoading] = useState(false);

  const generateToken = useCallback(async (payload) => {
    setIsLoading(true);
    try {
      const result = await jwt.generateToken(payload);
      return result;
    } catch (error) {
      toast.error('Failed to generate token');
      console.error(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [jwt]);

  return {
    ...jwt,
    generateToken,
    isLoading,
  };
}
```

**File:** `src/hooks/use-organizations.ts`

```typescript
'use client';

import { useOrganizations as useOrganizationsBase } from 'better-auth/react/plugins';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export function useOrganizations() {
  const organizations = useOrganizationsBase();
  const [isLoading, setIsLoading] = useState(false);

  const createOrganization = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const result = await organizations.createOrganization(data);
      toast.success('Organization created successfully');
      return result;
    } catch (error) {
      toast.error('Failed to create organization');
      console.error(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [organizations]);

  return {
    ...organizations,
    createOrganization,
    isLoading,
  };
}
```

#### 2. Create UI Components for Plugin Features

**File:** `src/components/admin/admin-panel.tsx`

```typescript
'use client';

import { useAdmin } from '@/hooks/use-admin';
import { useState, useEffect } from 'react';

export function AdminPanel() {
  const { getUsers, getUserStats, isLoading } = useAdmin();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadAdminData = async () => {
      const [usersData, statsData] = await Promise.all([
        getUsers(),
        getUserStats()
      ]);
      setUsers(usersData);
      setStats(statsData);
    };

    loadAdminData();
  }, [getUsers, getUserStats]);

  if (isLoading) {
    return <div>Loading admin panel...</div>;
  }

  return (
    <div>
      <h1>Admin Panel</h1>
      {/* Stats display */}
      {stats && (
        <div className="stats-panel">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p>{stats.totalUsers}</p>
          </div>
          {/* Other stats */}
        </div>
      )}
      
      {/* Users table */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Roles</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.roles?.join(', ')}</td>
              <td>{/* Actions */}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**File:** `src/components/api-keys/api-key-manager.tsx`

```typescript
'use client';

import { useApiKeys } from '@/hooks/use-api-keys';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export function ApiKeyManager() {
  const { getKeys, createKey, deleteKey, isLoading } = useApiKeys();
  const [keys, setKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKey, setNewKey] = useState(null);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    const keysData = await getKeys();
    setKeys(keysData || []);
  };

  const handleCreateKey = async (e) => {
    e.preventDefault();
    const key = await createKey({ name: newKeyName });
    if (key) {
      setNewKey(key);
      setNewKeyName('');
      await loadKeys();
    }
  };

  const handleDeleteKey = async (keyId) => {
    const confirmed = window.confirm('Are you sure you want to delete this API key?');
    if (confirmed) {
      await deleteKey(keyId);
      toast.success('API key deleted');
      await loadKeys();
    }
  };

  return (
    <div>
      <h1>API Key Management</h1>
      
      {/* Create key form */}
      <form onSubmit={handleCreateKey}>
        <div>
          <label htmlFor="keyName">API Key Name</label>
          <input
            id="keyName"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create API Key'}
        </button>
      </form>
      
      {/* New key display */}
      {newKey && (
        <div>
          <h3>Your new API key (copy this now, it won't be shown again):</h3>
          <code>{newKey.value}</code>
          <button onClick={() => setNewKey(null)}>Got it</button>
        </div>
      )}
      
      {/* Keys list */}
      <h2>Your API Keys</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Created</th>
            <th>Expires</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {keys.map(key => (
            <tr key={key.id}>
              <td>{key.name}</td>
              <td>{new Date(key.createdAt).toLocaleDateString()}</td>
              <td>{key.expiresAt ? new Date(key.expiresAt).toLocaleDateString() : 'Never'}</td>
              <td>
                <button onClick={() => handleDeleteKey(key.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**File:** `src/components/organizations/organization-manager.tsx`

```typescript
'use client';

import { useOrganizations } from '@/hooks/use-organizations';
import { useState, useEffect } from 'react';

export function OrganizationManager() {
  const { 
    getOrganizations, 
    createOrganization, 
    inviteUser,
    isLoading 
  } = useOrganizations();
  
  const [organizations, setOrganizations] = useState([]);
  const [newOrgName, setNewOrgName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedOrg, setSelectedOrg] = useState(null);

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    const orgsData = await getOrganizations();
    setOrganizations(orgsData || []);
  };

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    await createOrganization({ name: newOrgName });
    setNewOrgName('');
    await loadOrganizations();
  };

  const handleInviteUser = async (e) => {
    e.preventDefault();
    if (!selectedOrg) return;
    
    await inviteUser({
      organizationId: selectedOrg.id,
      email: inviteEmail,
      role: 'member'
    });
    
    setInviteEmail('');
  };

  return (
    <div>
      <h1>Organizations</h1>
      
      {/* Create organization form */}
      <form onSubmit={handleCreateOrg}>
        <div>
          <label htmlFor="orgName">Organization Name</label>
          <input
            id="orgName"
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Organization'}
        </button>
      </form>
      
      {/* Organizations list */}
      <h2>Your Organizations</h2>
      <div className="org-list">
        {organizations.map(org => (
          <div 
            key={org.id} 
            className={`org-card ${selectedOrg?.id === org.id ? 'selected' : ''}`}
            onClick={() => setSelectedOrg(org)}
          >
            <h3>{org.name}</h3>
            <p>Role: {org.role}</p>
            <p>Members: {org.memberCount}</p>
          </div>
        ))}
      </div>
      
      {/* Invite user form (only shown when an org is selected) */}
      {selectedOrg && (
        <div>
          <h3>Invite User to {selectedOrg.name}</h3>
          <form onSubmit={handleInviteUser}>
            <div>
              <label htmlFor="inviteEmail">Email</label>
              <input
                id="inviteEmail"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Invitation'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
```

### Phase 3: Integration into App Pages

#### 1. Create Administrative Dashboard Page

**File:** `src/app/admin/dashboard/page.tsx`

```typescript
import { AdminPanel } from '@/components/admin/admin-panel';

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <AdminPanel />
    </div>
  );
}
```

#### 2. Create API Keys Management Page

**File:** `src/app/api-keys/page.tsx`

```typescript
import { ApiKeyManager } from '@/components/api-keys/api-key-manager';

export default function ApiKeysPage() {
  return (
    <div className="container mx-auto py-8">
      <ApiKeyManager />
    </div>
  );
}
```

#### 3. Create Organizations Management Page

**File:** `src/app/organizations/page.tsx`

```typescript
import { OrganizationManager } from '@/components/organizations/organization-manager';

export default function OrganizationsPage() {
  return (
    <div className="container mx-auto py-8">
      <OrganizationManager />
    </div>
  );
}
```

#### 4. Update Navigation to Include Plugin Pages

**File:** `src/components/layout/navbar.tsx` (assuming this exists)

```typescript
// Add links to plugin pages
<Link href="/admin/dashboard">Admin Dashboard</Link>
<Link href="/api-keys">API Keys</Link>
<Link href="/organizations">Organizations</Link>
```

### Phase 4: Security and Access Control

#### 1. Create Route Protection Middleware

**File:** `src/middleware.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/server';

export async function middleware(request: NextRequest) {
  // Plugin-specific route protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const session = await auth.getSession();
    if (!session?.user?.roles?.includes('admin')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // API Key routes require authentication
  if (request.nextUrl.pathname.startsWith('/api-keys')) {
    const session = await auth.getSession();
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Organization routes require authentication
  if (request.nextUrl.pathname.startsWith('/organizations')) {
    const session = await auth.getSession();
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api-keys/:path*', '/organizations/:path*'],
};
```

#### 2. Create Role-Based Component Guards

**File:** `src/components/auth/role-guard.tsx`

```typescript
'use client';

import { useSession } from '@/lib/auth/client';
import { useRole } from '@/hooks/use-role';
import { type ReactNode } from 'react';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode;
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallback = <div>You don't have permission to view this content</div> 
}: RoleGuardProps) {
  const { status } = useSession();
  const { hasAnyRole } = useRole();
  
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  
  if (status !== 'authenticated') {
    return <div>Please sign in to access this content</div>;
  }
  
  if (!hasAnyRole(allowedRoles)) {
    return fallback;
  }
  
  return <>{children}</>;
}
```

## Implementation Timeline

1. **Week 1: Core Infrastructure (Phase 1)**
   - Update auth client with plugin support
   - Create auth provider
   - Integrate with app layout

2. **Week 2: Plugin-Specific Hooks (Phase 2, part 1)**
   - Create custom hooks for each plugin
   - Add error handling and loading states

3. **Week 3: UI Components (Phase 2, part 2)**
   - Create UI components for plugin features
   - Add functionality for CRUD operations

4. **Week 4: Page Integration and Security (Phases 3 & 4)**
   - Create plugin-specific pages
   - Implement security measures and access control
   - Final testing and adjustments

## Testing Considerations

1. **Unit Tests**
   - Test custom hooks in isolation
   - Test UI components with mock data

2. **Integration Tests**
   - Test interaction between hooks and components
   - Test navigation and routing

3. **E2E Tests**
   - Test complete workflows (e.g., creating an API key, inviting a user to an organization)
   - Test access control and permissions

## Conclusion

This implementation plan provides a structured approach to integrating BetterAuth plugins on the client side of our application. By following these steps, we'll enhance our authentication system with powerful features such as admin tools, API key management, JWT authentication, and organization management, while maintaining a clean, maintainable codebase.

After implementation, users will be able to manage their organizations, generate and manage API keys, and administrators will have access to user management tools, all within a cohesive and secure user interface.
