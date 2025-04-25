# User Impersonation Implementation Plan

## Overview

This document outlines the implementation of user impersonation functionality in our application using BetterAuth's built-in admin plugin features.

User impersonation allows administrators to temporarily view and interact with the application as if they were another user, which is valuable for troubleshooting, user support, and testing role-based functionality.

## Implementation Components

### 1. Admin Plugin Configuration

Updated the admin plugin configuration in `src/lib/auth/config.ts` to enable and configure impersonation features:

```typescript
admin({
  adminRoles: ['admin'],
  impersonationSessionDuration: 60 * 60, // 1 hour
  impersonationPermission: (user) => ['admin', 'security'].includes(user.role),
})
```

### 2. Client-Side Hooks

#### Impersonation Hook

Created a custom hook for managing impersonation state and actions:

- **File**: `src/hooks/use-impersonation.ts`
- **Functionality**:
  - `impersonateUser(userId)`: Start impersonating a specific user
  - `stopImpersonating()`: End impersonation and return to admin account
  - Loading state management
  - Error handling with toast notifications
  - Page navigation after actions
  - Session refresh to update UI components

#### Auth Session Hook

Enhanced the authentication session hook for client-side components:

- **File**: `src/hooks/use-auth-session.ts`
- **Functionality**:
  - Type-safe session access
  - Session refresh capability
  - Loading state management
  - Error handling

### 3. UI Components

#### Impersonate Button

- **File**: `src/components/admin/impersonate-button.tsx`
- **Usage**: Placed on user management pages where admins can select users to impersonate
- **Props**:
  - `userId`: The ID of the user to impersonate
  - Standard Button props for styling customization
- **Features**:
  - Loading state handling during impersonation
  - Appropriate button text states
  - Clean integration with ShadCN UI components

#### Impersonation Banner

- **File**: `src/components/admin/impersonation-banner.tsx`
- **Features**:
  - Clear visual indication when impersonation is active
  - Button to end impersonation
  - Color-coded warning styling
  - Conditional rendering based on impersonation state
  - Type-safe props with `isImpersonating` boolean

### 4. Admin Interface

Created a dedicated admin page for user impersonation:

- **File**: `src/app/admin/impersonation/page.tsx`
- **Features**:
  - Role-based access control (admin and security roles only)
  - List of users available for impersonation
  - Card-based user selection interface
  - Security notices and instructions
  - Proper type safety for role checking

### 5. Layout Integration

Integrated the impersonation banner into the main application layout:

```typescript
// src/app/layout.tsx
{session?.user?.isImpersonating && (
  <ImpersonationBanner isImpersonating={true} />
)}
```

## Security Implementation

1. **Role-Based Access Control**:
   - Only users with `admin` or `security` roles can initiate impersonation
   - Proper type-safe role checking using `hasAnyRole` utility
   - Redirect unauthorized users to appropriate pages

2. **Visual Indicators**:
   - Prominent amber-colored banner when impersonation is active
   - Clear labeling of impersonation state
   - One-click return to admin account

3. **Session Management**:
   - Time-limited impersonation sessions (1 hour)
   - Proper session refresh after state changes
   - Original admin roles preserved during impersonation

4. **Type Safety**:
   - Proper TypeScript typing throughout the implementation
   - Safe type assertions where needed
   - Consistent interface patterns

## Testing

The implementation can be tested by:

1. Logging in as an admin user
2. Navigating to `/admin/impersonation`
3. Selecting a user to impersonate
4. Verifying the impersonation banner appears
5. Testing that role-based restrictions match the impersonated user
6. Clicking "Return to Admin Account" to end impersonation
7. Verifying a return to admin permissions

## References

- [BetterAuth Admin Plugin Documentation](https://www.better-auth.com/docs/plugins/admin)
- [Impersonation Best Practices](https://www.better-auth.com/docs/plugins/admin#user-impersonation)
