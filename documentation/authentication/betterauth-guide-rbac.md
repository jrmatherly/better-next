# BetterAuth Implementation Guide for Next.js

## Server-Side Authentication Guide with Role-Based Access Control

## Table of Contents

- [BetterAuth Implementation Guide for Next.js](#betterauth-implementation-guide-for-nextjs)
  - [Server-Side Authentication Guide with Role-Based Access Control](#server-side-authentication-guide-with-role-based-access-control)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Installation](#installation)
  - [Initial Setup](#initial-setup)
    - [1. Create Auth Configuration](#1-create-auth-configuration)
    - [2. Set Up API Routes](#2-set-up-api-routes)
  - [Server-Side Authentication](#server-side-authentication)
    - [Using Authentication in Server Components](#using-authentication-in-server-components)
    - [Using Authentication in Server Actions](#using-authentication-in-server-actions)
    - [Route Protection with Middleware](#route-protection-with-middleware)
  - [Managing Sessions](#managing-sessions)
  - [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
    - [Setting Up RBAC with Social Providers](#setting-up-rbac-with-social-providers)
    - [Mapping Provider Claims to Application Roles](#mapping-provider-claims-to-application-roles)
    - [Implementing Role-Based Authorization](#implementing-role-based-authorization)
      - [In Server Components](#in-server-components)
      - [In Server Actions](#in-server-actions)
      - [In Middleware (for Route Protection)](#in-middleware-for-route-protection)
    - [RBAC with Organization Plugin](#rbac-with-organization-plugin)
  - [User Impersonation](#user-impersonation)
    - [Creating the Impersonation Plugin](#creating-the-impersonation-plugin)
    - [Implementing Impersonation UI](#implementing-impersonation-ui)
      - [Admin Component for Starting Impersonation](#admin-component-for-starting-impersonation)
      - [Impersonation Banner Component](#impersonation-banner-component)
    - [Security Considerations for Impersonation](#security-considerations-for-impersonation)
  - [Advanced Configuration](#advanced-configuration)
    - [Custom Field Mapping](#custom-field-mapping)
    - [Using Plugins](#using-plugins)
  - [Security Best Practices](#security-best-practices)
  - [Migration from Other Auth Solutions](#migration-from-other-auth-solutions)
  - [Using RBAC in Real-World Scenarios](#using-rbac-in-real-world-scenarios)
    - [Admin Dashboard Access](#admin-dashboard-access)
    - [Conditional UI Elements Based on Role](#conditional-ui-elements-based-on-role)
  - [Troubleshooting](#troubleshooting)

## Introduction

BetterAuth is a modern authentication library for Next.js applications that provides a robust, type-safe way to implement authentication and authorization. This guide focuses specifically on server-side implementation and usage of BetterAuth in a Next.js project, with special emphasis on Role-Based Access Control (RBAC).

Key features of BetterAuth include:

- Type-safe API with full TypeScript support
- Server-side authentication for Next.js App Router
- Multiple authentication strategies (email/password, social providers, passkeys)
- Role-Based Access Control (RBAC) for authorizing user actions
- Session management
- Middleware support for route protection
- Plugin system for extended functionality including organization management

## Installation

First, install BetterAuth in your Next.js project:

```bash
npm install better-auth
# For Next.js integration plugin
npm install better-auth/next-js
```

## Initial Setup

### 1. Create Auth Configuration

Create a file at `src/lib/auth/server.ts` to set up your BetterAuth instance:

```typescript
// src/lib/auth/server.ts
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
  adapter: PrismaAdapter(prisma),
  // Configure your authentication providers here
  providers: [
    // Email and password provider
    {
      type: "credentials",
      // Configuration for credentials provider
    },
    // Add social providers as needed
  ],
  session: {
    strategy: "database", // or "jwt" if preferred
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // BetterAuth specific Next.js integration
  plugins: [nextCookies()]
});
```

### 2. Set Up API Routes

Create an API route handler to handle authentication requests:

```typescript
// src/app/api/auth/[...all]/route.ts
import { auth } from '@/lib/auth/server';
import { toNextJsHandler } from 'better-auth/next-js';

export const { POST, GET } = toNextJsHandler(auth);
```

## Server-Side Authentication

### Using Authentication in Server Components

In Next.js App Router, you can directly use BetterAuth in Server Components to access the authenticated user's session:

```typescript
// src/app/dashboard/page.tsx
import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';

export default async function DashboardPage() {
  // Get session from server component
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <div>Please sign in to access your dashboard</div>;
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
      {/* Dashboard content */}
    </div>
  );
}
```

### Using Authentication in Server Actions

For Server Actions, you can authenticate requests as follows:

```typescript
// app/actions/user-actions.ts
"use server";

import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";

export async function updateUserProfile(formData: FormData) {
  // Authenticate the request
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session) {
    throw new Error("Unauthorized");
  }
  
  // Perform authenticated action with user data
  const userId = session.user.id;
  
  // Update user profile logic here
  // ...
  
  return { success: true };
}
```

### Route Protection with Middleware

You can protect routes using Next.js middleware with BetterAuth:

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  // Redirect to login if no session
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  // Continue to protected route
  return NextResponse.next();
}

// Specify which routes should be protected
export const config = {
  // Enable Node.js runtime for middleware (required for Next.js 15.2.0+)
  runtime: "nodejs",
  matcher: [
    "/dashboard/:path*",
    "/account/:path*",
    "/api/protected/:path*"
  ]
};
```

## Managing Sessions

BetterAuth provides a comprehensive API for session management:

```typescript
// Example of session operations
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";

// Get current session
const session = await auth.api.getSession({
  headers: await headers()
});

// Sign out/end the session
await auth.api.signOut({
  headers: await headers()
});

// Create a session (after authentication)
await auth.api.createSession({
  user: { id: "user_id" },
  headers: await headers()
});
```

## Role-Based Access Control (RBAC)

Role-Based Access Control (RBAC) is a method of restricting system access to authorized users based on their roles within an organization. In a Next.js application using BetterAuth, you can implement RBAC to control what resources and actions users can access.

### Setting Up RBAC with Social Providers

When implementing RBAC with social providers, you need to map the claims/attributes from the provider to roles in your application. Here's how to set up RBAC when a social provider returns an `appRoles` claim:

```typescript
// src/lib/auth/server.ts
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  adapter: /* your adapter */,
  providers: [
    {
      id: "your-provider",
      type: "oauth",
      // Other provider configuration
      profile(profile, tokens) {
        // Extract the appRoles claim from the profile or tokens
        const appRoles = profile.appRoles || "user"; // Default to "user" if no role specified
        
        // Return normalized user profile with role
        return {
          id: profile.sub || profile.id,
          email: profile.email,
          name: profile.name,
          // Map provider's appRoles to your application's role
          role: mapProviderRoleToappRoles(appRoles),
          // Other user properties
        };
      },
    },
  ],
  callbacks: {
    // Ensure role is included in the session
    session({ session, user }) {
      if (user && user.role) {
        session.user.role = user.role;
      }
      return session;
    }
  },
  plugins: [nextCookies()]
});

// Helper function to map provider roles to application roles
function mapProviderRoleToappRoles(providerRole) {
  // Custom mapping logic
  const roleMap = {
    "admin_role": "admin",
    "manager_role": "manager",
    // Add more mappings as needed
  };
  
  return roleMap[providerRole] || "user"; // Default to "user" if no matching role
}
```

### Mapping Provider Claims to Application Roles

The key to effective RBAC is properly mapping external provider claims to your application's role system. Below is a more detailed implementation:

```typescript
// Extended role mapping function
function mapProviderRoleToappRoles(providerRole) {
  // Define your role hierarchy and mapping
  const roleMap = {
    // External provider roles (from claim) -> Application roles
    "app_administrator": "admin",
    "app_manager": "manager",
    "app_editor": "editor",
    "app_viewer": "user",
    // Add any additional mappings
  };
  
  // You can also implement more complex logic
  // For example, if provider returns an array of roles
  if (Array.isArray(providerRole)) {
    // Find the highest privilege role
    const priorityOrder = ["admin", "manager", "editor", "user"];
    
    const mappedRoles = providerRole
      .map(role => roleMap[role] || null)
      .filter(role => role !== null);
    
    // Return the highest priority role the user has
    for (const priority of priorityOrder) {
      if (mappedRoles.includes(priority)) {
        return priority;
      }
    }
    
    return "user"; // Default role
  }
  
  // For single role value
  return roleMap[providerRole] || "user";
}
```

### Implementing Role-Based Authorization

Once you have the roles mapped and stored in the user session, you can implement authorization checks in your application:

#### In Server Components

```typescript
// src/app/admin/page.tsx
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  // Check if user is authenticated and has admin role
  if (!session || session.user.role !== "admin") {
    // Redirect unauthorized users
    redirect("/unauthorized");
  }
  
  // Render admin dashboard for authorized users
  return (
    <div>
      <h1>Admin Dashboard</h1>
      {/* Admin-only content */}
    </div>
  );
}
```

#### In Server Actions

```typescript
// src/app/actions/admin-actions.ts
"use server";

import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";

export async function performAdminAction(data) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  // Check if user has admin role
  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized: Admin privileges required");
  }
  
  // Proceed with admin action
  // ...implementation
  
  return { success: true };
}
```

#### In Middleware (for Route Protection)

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  // Get session
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  // Check authentication
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  // Role-based authorization
  const path = request.nextUrl.pathname;
  
  // Protect admin routes
  if (path.startsWith("/admin") && session.user.role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }
  
  // Protect manager routes
  if (path.startsWith("/manager") && 
     !["admin", "manager"].includes(session.user.role)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }
  
  // Allow access for authorized users
  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/admin/:path*",
    "/manager/:path*",
    "/protected/:path*"
  ]
};
```

### RBAC with Organization Plugin

For more advanced RBAC needs, especially in multi-tenant applications, you can use BetterAuth's organization plugin:

```typescript
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";

// Define access control roles and permissions
const admin = {
  name: "admin",
  permissions: ["users:read", "users:write", "settings:read", "settings:write"]
};

const manager = {
  name: "manager",
  permissions: ["users:read", "settings:read"]
};

const user = {
  name: "user",
  permissions: ["settings:read"]
};

// Create access controller
const ac = {
  getRolePermissions: (role) => {
    if (role === "admin") return admin.permissions;
    if (role === "manager") return manager.permissions;
    if (role === "user") return user.permissions;
    return [];
  }
};

// Configure auth with organization plugin
export const auth = betterAuth({
  // Basic auth configuration
  
  plugins: [
    nextCookies(),
    organization({
      ac,
      roles: { admin, manager, user },
      
      // Map social provider roles to organization roles
      async assignRoleOnSignUp(user, profile) {
        // Extract appRoles from social provider
        const providerRole = profile.appRoles;
        
        // Map to organization role
        if (providerRole === "app_administrator") {
          return "admin";
        } else if (providerRole === "app_manager") {
          return "manager";
        } else {
          return "user"; // Default role
        }
      }
    })
  ]
});
```

With the organization plugin, you can check permissions in server-side code:

```typescript
// Check if user has permission in a server component
const hasPermission = await auth.api.hasPermission({
  headers: await headers(),
  permission: "settings:write",
  organizationId: "org_123" // Optional: check in specific organization
});

if (hasPermission) {
  // User has permission to write settings
}
```

## User Impersonation

User impersonation is an important feature for administrative users who need to troubleshoot or assist users by experiencing the application from their perspective. This section covers how to implement secure user impersonation with BetterAuth.

### Creating the Impersonation Plugin

First, create a custom plugin to handle the impersonation functionality:

```typescript
// src/lib/auth/impersonation-plugin.ts
import { createPlugin } from "better-auth";
import { PrismaClient } from "@prisma/client";
import crypto from "node:crypto";

const prisma = new PrismaClient();

// Define a schema for impersonation records in your Prisma schema:
/*
model Impersonation {
  id            String    @id @default(cuid())
  adminUserId   String
  targetUserId  String
  token         String    @unique
  expiresAt     DateTime
  createdAt     DateTime  @default(now())
  usedAt        DateTime?
  adminUser     User      @relation("adminUser", fields: [adminUserId], references: [id])
  targetUser    User      @relation("targetUser", fields: [targetUserId], references: [id])
}
*/

export const impersonationPlugin = createPlugin({
  name: "impersonation",
  
  // Add endpoints to your API
  endpoints: {
    // Endpoint to start impersonation
    startImpersonation: {
      handler: async ({ req, res, auth }) => {
        const session = await auth.getSession({ req });
        
        // Verify admin permissions
        if (!session || session.user.role !== "admin") {
          return res.status(403).json({ error: "Unauthorized" });
        }
        
        const { targetUserId } = req.body;
        
        if (!targetUserId) {
          return res.status(400).json({ error: "Target user ID is required" });
        }
        
        // Create impersonation token
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 1000 * 60 * 20); // 20 minutes
        
        await prisma.impersonation.create({
          data: {
            adminUserId: session.user.id,
            targetUserId,
            token,
            expiresAt
          }
        });
        
        return res.json({ 
          token,
          redirectUrl: `/api/auth/impersonate?token=${token}`
        });
      }
    },
    
    // Endpoint to use impersonation token
    impersonate: {
      handler: async ({ req, res, auth }) => {
        const { token } = req.query;
        
        if (!token) {
          return res.status(400).json({ error: "Token is required" });
        }
        
        // Find and validate token
        const impersonation = await prisma.impersonation.findUnique({
          where: { token: String(token) },
          include: {
            targetUser: true,
            adminUser: true
          }
        });
        
        if (!impersonation || impersonation.expiresAt < new Date() || impersonation.usedAt) {
          return res.status(403).json({ error: "Invalid or expired token" });
        }
        
        // Mark token as used
        await prisma.impersonation.update({
          where: { id: impersonation.id },
          data: { usedAt: new Date() }
        });
        
        // Create a special session for impersonation
        const user = impersonation.targetUser;
        
        // Add original admin info to the session for restoration later
        const session = await auth.createSession({
          user: {
            ...user,
            // Add metadata for restoring admin session
            originalAdminId: impersonation.adminUserId,
            impersonationId: impersonation.id,
            isImpersonating: true
          }
        });
        
        return res.json({
          success: true,
          redirectTo: "/"
        });
      }
    },
    
    // Endpoint to end impersonation
    endImpersonation: {
      handler: async ({ req, res, auth }) => {
        const session = await auth.getSession({ req });
        
        if (!session || !session.user.isImpersonating) {
          return res.status(400).json({ error: "Not in an impersonation session" });
        }
        
        // Retrieve original admin
        const adminUser = await prisma.user.findUnique({
          where: { id: session.user.originalAdminId }
        });
        
        if (!adminUser) {
          return res.status(500).json({ error: "Admin user not found" });
        }
        
        // End current session
        await auth.invalidateSession(session.sessionToken);
        
        // Start a new session as the admin
        await auth.createSession({ user: adminUser });
        
        return res.json({
          success: true,
          redirectTo: "/admin"
        });
      }
    }
  }
});
```

Add the impersonation plugin to your BetterAuth configuration:

```typescript
// src/lib/server.ts
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { impersonationPlugin } from "./impersonation-plugin";

export const auth = betterAuth({
  // Basic auth configuration
  
  plugins: [
    impersonationPlugin,
    nextCookies(),
    // Other plugins
  ]
});
```

### Implementing Impersonation UI

Create UI components to start and end impersonation sessions:

#### Admin Component for Starting Impersonation

```typescript
// src/components/admin/impersonate-button.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ImpersonateButton({ userId }: { userId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const handleImpersonate = async () => {
    if (!confirm("Are you sure you want to impersonate this user?")) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/auth/startImpersonation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUserId: userId }),
      });
      
      const data = await response.json();
      
      if (data.redirectUrl) {
        // Open in new tab to preserve admin session
        window.open(data.redirectUrl, "_blank");
      }
    } catch (error) {
      console.error("Failed to start impersonation:", error);
      alert("Failed to start impersonation");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <button
      onClick={handleImpersonate}
      disabled={isLoading}
      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
    >
      {isLoading ? "Starting..." : "Impersonate User"}
    </button>
  );
}
```

#### Impersonation Banner Component

Create a clearly visible banner that shows when a user is being impersonated:

```typescript
// src/components/impersonation-banner.tsx
"use client";

import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export default function ImpersonationBanner() {
  const { data: session } = useSession();
  const router = useRouter();
  
  // If not in an impersonation session, don't render anything
  if (!session?.user?.isImpersonating) {
    return null;
  }
  
  const handleEndImpersonation = async () => {
    try {
      const response = await fetch("/api/auth/endImpersonation", {
        method: "POST",
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Redirect to admin dashboard or specified URL
        window.location.href = data.redirectTo;
      }
    } catch (error) {
      console.error("Failed to end impersonation:", error);
      alert("Failed to end impersonation");
    }
  };
  
  return (
    <div className="bg-yellow-500 text-white p-2 text-center">
      <p className="font-bold">
        You are currently impersonating another user.
        <button 
          onClick={handleEndImpersonation}
          className="ml-4 bg-white text-yellow-500 px-3 py-1 rounded text-sm font-bold"
        >
          End Impersonation
        </button>
      </p>
    </div>
  );
}
```

Add the impersonation banner to your layout:

```typescript
// src/app/layout.tsx
import ImpersonationBanner from "@/components/admin/impersonation-banner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ImpersonationBanner />
        <main>{children}</main>
      </body>
    </html>
  );
}
```

### Security Considerations for Impersonation

When implementing user impersonation, consider these security best practices:

1. **Limited Duration**: Impersonation sessions should expire after a short time (e.g., 20 minutes).

2. **Audit Logging**: Record all impersonation activities, including who started the impersonation, which user was impersonated, when it started, and when it ended.

3. **Single-Use Tokens**: Ensure impersonation tokens can only be used once.

4. **Clear Visual Indication**: Always show a prominent banner to indicate that the current session is an impersonation.

5. **Permission Restrictions**: Consider limiting what actions can be performed during impersonation (e.g., prevent password changes).

6. **Explicit Consent**: Require admins to confirm their intent to impersonate a user.

7. **Separate Tab/Window**: Open impersonation sessions in a new tab to preserve the admin's original session.

## Advanced Configuration

### Custom Field Mapping

If you're migrating from another authentication solution or have an existing database schema, you can map your database fields to match BetterAuth's expected structure:

```typescript
export const auth = betterAuth({
  // Other configs
  session: {
    fields: {
      expiresAt: "expires", // Map your field 'expires' to BetterAuth's 'expiresAt'
      token: "sessionToken" // Map your field 'sessionToken' to BetterAuth's 'token'
    }
  },
  account: {
    fields: {
      accountId: "providerAccountId",
      refreshToken: "refresh_token",
      accessToken: "access_token",
      accessTokenExpiresAt: "access_token_expires",
      idToken: "id_token"
    }
  }
});
```

### Using Plugins

BetterAuth's plugin system allows you to extend its functionality:

```typescript
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { twoFactorAuth } from "better-auth/two-factor";

export const auth = betterAuth({
  // Basic configuration
  
  // Add plugins for extended functionality
  plugins: [
    nextCookies(),
    twoFactorAuth({
      // Two-factor authentication configuration
    }),
    // Other plugins as needed
  ]
});
```

## Security Best Practices

When implementing BetterAuth with RBAC, follow these security best practices:

1. **Use HTTPS**: Always ensure your application is served over HTTPS.

2. **Secure Cookie Settings**: Configure secure cookies, especially in production:

   ```typescript
   cookies: {
     secure: process.env.NODE_ENV === "production",
     sameSite: "lax"
   }
   ```

3. **Password Security**: When using credential-based authentication, implement strong password policies.

4. **Session Expiry**: Set appropriate session timeouts based on your security requirements.

5. **CSRF Protection**: BetterAuth includes CSRF protection, make sure it's properly configured.

6. **Principle of Least Privilege**: Only request necessary permissions from OAuth providers.

7. **Role Validation**: Always validate roles on the server side and never trust client-side role information.

8. **Defense in Depth**: Implement authorization checks at multiple levels (middleware, server components, server actions).

9. **Audit Logging**: Log role-based access and changes to roles for security auditing.

10. **Separation of Duties**: Implement critical operations that require multiple roles or users for approval.

11. **Default to Deny**: Use a "deny by default" approach where access is explicitly granted rather than assuming access.

## Migration from Other Auth Solutions

If you're migrating from another authentication solution like NextAuth.js, you can follow these steps:

1. Install BetterAuth while keeping your existing solution in place.

2. Use field mapping to match your existing database schema.

3. Update authentication logic in your application incrementally.

4. Test thoroughly before removing the old authentication solution.

5. For RBAC migration specifically:
   - Map existing role fields to BetterAuth's role structure
   - Update role-checking logic in your application
   - Migrate custom role assignments and permissions

For specific migration guides, refer to the official BetterAuth documentation.

## Using RBAC in Real-World Scenarios

### Admin Dashboard Access

Implement role-based access to admin dashboards:

```typescript
// app/dashboard/layout.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  // Only allow users with admin role to access the dashboard
  if (!session || session.user.role !== "admin") {
    redirect("/login?returnTo=/dashboard");
  }
  
  return (
    <div className="dashboard-layout">
      <nav>
        <h1>Admin Dashboard</h1>
        {/* Admin navigation */}
      </nav>
      <main>{children}</main>
    </div>
  );
}
```

### Conditional UI Elements Based on Role

Show or hide UI elements based on the user's role:

```typescript
// app/components/UserTable.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function UserTable() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  const users = await fetchUsers();
  
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          {/* Only show actions column for admins */}
          {session?.user.role === "admin" && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            {/* Only render action buttons for admins */}
            {session?.user.role === "admin"
```

## Troubleshooting

Common issues and solutions:

**Session Not Persisting**: Ensure the `nextCookies` plugin is correctly configured.

**Middleware Authentication Issues**: Verify you're using the Node.js runtime in the middleware configuration.

**Type Errors**: Check that you're properly using the type inference capabilities of BetterAuth:

   ```typescript
   // Get proper type inference
   type Session = typeof auth.$Infer.Session;
   ```

**Database Connection Issues**: Verify your database adapter configuration.

**Role Not Being Saved**: Make sure you're correctly extracting the role from the social provider profile and returning it in the profile callback.

**Role Not in Session**: Ensure you've implemented the session callback to include the user role in the session.

**Social Provider Role Claim Missing**: Verify that the social provider is configured to include the `appRoles` claim in the user profile.

**Role Mapping Not Working**: Debug the mapping function to ensure it correctly transforms provider roles to application roles.

**Permission Checks Failing**: When using the organization plugin, check that permissions are correctly defined and associated with roles.

**Impersonation Not Working**: Ensure the impersonation plugin is properly registered and that your database schema includes the necessary tables for tracking impersonation sessions.
