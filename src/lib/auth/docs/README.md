# BetterAuth Implementation

## Overview

This documentation describes the implementation of BetterAuth in our Next.js application, focusing on authentication, role-based access control (RBAC), and user session management. The system integrates with Microsoft Azure AD as the primary identity provider while maintaining a flexible, role-based security model.

## Architecture

### Key Components

- **Auth Configuration** (`/lib/auth/config.ts`) - Core BetterAuth configuration and provider setup
- **Server Auth** (`/lib/auth/server.ts`) - Server-side authentication logic and session management
- **Client Auth** (`/lib/auth/client.ts`) - Client-side authentication hooks and utilities
- **Auth Guards** (`/lib/auth/guards.ts`) - Role-based authorization guards for server components
- **Role Utilities** (`/lib/auth/role-utils.ts`) - Role parsing, validation, and prioritization functions
- **Auth Types** (`/types/auth.d.ts`) - TypeScript definitions for auth-related data structures
- **Auth Provider** (`/providers/auth-provider.tsx`) - React context provider for auth state

## Authentication Flow

1. **User Sign-In**:
   - User authenticates via Microsoft Azure AD
   - BetterAuth processes the JWT token and extracts identity claims
   - Session is created with enhanced user data (including role information)

2. **Role Assignment**:
   - Roles from the identity provider are mapped to application roles
   - Role prioritization is applied via `getHighestRole()`
   - A single, highest-priority role is assigned to the user session

3. **Session Management**:
   - HTTP-only cookies store session data securely
   - Session data includes user profile, role, and impersonation state
   - Both client and server can access session data via appropriate APIs

## Role-Based Access Control

### Role Model

Our application follows a singular role model where each user has exactly one active role at any time. Roles are stored as string values in both session data and the database. Common roles include:

- `admin` - Full access to all features
- `security` - Access to security features and auditing
- `devops` - Access to deployment and configuration tools
- `dba` - Database administration capabilities
- `collab` - Collaboration tool access
- `tcc` - Control center access
- `fieldtech` - Field technician portal access
- `user` - Basic user access (default)

### Accessing Role Information

#### Server Components

```typescript
// Using server helpers
import { getServerSession, hasRequiredRoles } from '@/lib/auth/guards';

export async function AdminComponent() {
  const session = await getServerSession();
  
  if (!hasRequiredRoles(session, ['admin'])) {
    redirect('/unauthorized');
  }
  
  // Admin-only content
}
```

#### Client Components

```typescript
// Using the AuthProvider hooks
import { useAuth } from '@/providers/auth-provider';

export function RoleBasedUI() {
  const { isAuthenticated, userRole, hasRole } = useAuth();
  
  if (!isAuthenticated) {
    return <SignInPrompt />;
  }
  
  return (
    <div>
      <h1>Welcome, {userRole}!</h1>
      {hasRole('admin') && <AdminPanel />}
    </div>
  );
}
```

### Role-Based UI Components

#### Role Gate

Conditionally renders content based on user roles:

```typescript
<RoleGate allowedRoles={['admin', 'security']} fallback={<AccessDenied />}>
  <SecureContent />
</RoleGate>
```

#### Protected Layout

Wraps entire sections of the application with role-based protection:

```typescript
export default function AdminLayout({ children }) {
  return (
    <ProtectedLayout allowedRoles={['admin']}>
      <AdminSidebar />
      {children}
    </ProtectedLayout>
  );
}
```

## User Impersonation

Administrators can temporarily assume the identity of other users for troubleshooting:

### Key Features

- Original admin role is preserved during impersonation
- Clear visual indicators when impersonation is active
- Time-limited impersonation sessions (20 minutes)
- Audit logging of all impersonation events

### Impersonation Usage

```typescript
// Start impersonation
const { startImpersonation } = useImpersonation();
await startImpersonation(targetUserId);

// End impersonation
const { stopImpersonation } = useImpersonation();
await stopImpersonation();
```

## Session Best Practices

### Server-Side Session Access

Always use `getServerSession()` from `guards.ts` when accessing session data:

```typescript
import { getServerSession } from '@/lib/auth/guards';

export async function ServerComponent() {
  const session = await getServerSession();
  // Use session data
}
```

### Client-Side Session Access

Use `getSession()` for optimal performance in providers and other critical components:

```typescript
import { getSession } from '@/lib/auth/client';

useEffect(() => {
  const fetchSessionData = async () => {
    const session = await getSession();
    // Process session data
  };
  
  fetchSessionData();
}, []);
```

For standard components, use `useAuth()` hook:

```typescript
import { useAuth } from '@/providers/auth-provider';

function ProfileWidget() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <SignInPrompt />;
  
  return <UserProfile user={user} />;
}
```

## Extended User Profiles

User profiles extend the basic session data with additional fields:

```typescript
// From BetterAuth session to Profile model
export function mapSessionToProfile(session, existingProfile) {
  // Maps basic user fields
  // Handles extended fields
  // Processes preferences and social links
  // Includes role information
}
```

## Error Handling

### Authentication Errors

- Unauthenticated users are redirected to the login page
- Unauthorized access attempts are tracked and logged
- Friendly, user-appropriate error messages are displayed

### Session Errors

Robust error handling for session operations:

```typescript
try {
  const session = await getSession();
  // Use session data
} catch (error) {
  console.error('Session error:', error);
  // Fallback behavior
}
```

## Debugging Tools

The auth debug page provides insights into the BetterAuth implementation:

- View plugin structures and available methods
- Inspect current session data
- Troubleshoot authentication issues

Access at `/admin/tools/auth-debug/client`

## Security Considerations

- **CSRF Protection**: All forms include CSRF tokens
- **HTTP-Only Cookies**: Session data is stored in secure HTTP-only cookies
- **JWT Validation**: All tokens are properly validated
- **Role Checking**: Every protected operation verifies user roles
- **Input Validation**: All user input is validated with Zod schemas
- **Audit Logging**: Authentication events are logged for security analysis

## Migration Guide

When converting legacy authentication code:

1. Replace direct `useSession()` calls with `useAuth()` hook
2. Update direct role checks with `hasRole()`, `hasAnyRole()`, or `hasAllRoles()`
3. In server components, use `getServerSession()` and `hasRequiredRoles()`
4. For providers and layouts, prefer `getSession()` over `useSession()`
5. Ensure proper error handling for all authentication operations

## Examples

### Protected API Route

```typescript
import { NextResponse } from 'next/server';
import { getServerSession, hasRequiredRoles } from '@/lib/auth/guards';

export async function GET() {
  const session = await getServerSession();
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  if (!hasRequiredRoles(session, ['admin'])) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Proceed with admin-only API logic
}
```

### Role-Aware Component

```typescript
'use client';

import { useAuth } from '@/providers/auth-provider';

export function DashboardFeatures() {
  const { hasRole, hasAnyRole } = useAuth();
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* All authenticated users see this */}
      <BasicFeatureCard />
      
      {/* Only admin and security roles see this */}
      {hasAnyRole(['admin', 'security']) && <SecurityFeatureCard />}
      
      {/* Only admin sees this */}
      {hasRole('admin') && <AdminFeatureCard />}
    </div>
  );
}
```

## Provider Hierarchy

The correct provider nesting is essential for auth to work correctly:

```tsx
<Wrapper>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ProfileProvider>
        {children}
      </ProfileProvider>
    </AuthProvider>
  </QueryClientProvider>
</Wrapper>
```

## Troubleshooting

- **Missing session data**: Ensure the AuthProvider is included in the provider chain
- **Role not recognized**: Check role mapping in server.ts and validate identity provider claims
- **Component re-rendering issues**: Use getSession() instead of useSession() in providers
- **Type errors**: Ensure you're using the correct session type definitions from auth.d.ts
- **Server/client mismatch**: Make sure server and client role checking logic is consistent
