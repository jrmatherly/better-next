# BetterAuth Plugins

This document covers the plugin system in BetterAuth, including available official plugins, how to configure and use them, and how to create custom plugins.

## Plugin System Overview

BetterAuth uses a plugin architecture to extend its functionality without bloating the core package. Plugins can add new features, integrate with other services, or modify the behavior of existing features.

## Available Official Plugins

BetterAuth offers several official plugins:

- **Admin** - Administrative interface and management APIs
- **API Key** - API key generation and validation
- **JWT** - JSON Web Token authentication
- **Organization** - Multi-tenant organization support
- **OpenAPI** - API documentation generation

## Configuring Plugins

Plugins are configured in your main auth configuration file:

```typescript
// src/lib/auth/config.ts
import { PrismaClient } from '@prisma/client';
import type { BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { 
  adminPlugin, 
  apiKeyPlugin, 
  jwtPlugin, 
  openAPIPlugin, 
  organizationPlugin 
} from 'better-auth/plugins';

const prisma = new PrismaClient();

export const authConfig = {
  // Core configuration...
  appName: 'Your App Name',
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  
  // Configure database adapter
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  
  // Configure plugins
  plugins: [
    adminPlugin({
      // Admin plugin options
    }),
    apiKeyPlugin({
      // API key plugin options
    }),
    jwtPlugin({
      // JWT plugin options
    }),
    openAPIPlugin({
      // OpenAPI plugin options
    }),
    organizationPlugin({
      // Organization plugin options
    }),
  ],
} satisfies BetterAuthOptions;
```

## Admin Plugin

The Admin plugin provides an administrative interface and API endpoints for managing users, roles, and other authentication-related data.

### Configuration

```typescript
import { adminPlugin } from 'better-auth/plugins';

// In your auth config
plugins: [
  adminPlugin({
    // Path prefix for admin API endpoints
    path: '/admin',
    
    // Secret key for accessing admin API (highly recommended)
    secret: process.env.ADMIN_API_SECRET,
    
    // Roles that can access admin functionality
    roles: ['admin'],
    
    // Custom admin authentication function (optional)
    authenticate: async (req) => {
      // Custom authentication logic
      return true; // Return true to allow access, false to deny
    },
    
    // Dashboard UI settings (if using built-in dashboard)
    dashboard: {
      enabled: true,
      title: 'Auth Admin',
      logoUrl: '/admin-logo.png',
      theme: 'light', // 'light', 'dark', or 'system'
    },
  }),
],
```

### Usage

#### Admin API Endpoints

The Admin plugin adds several API endpoints:

- `GET /admin/users` - List users with pagination and filtering
- `GET /admin/users/:id` - Get a specific user by ID
- `PUT /admin/users/:id` - Update a specific user
- `DELETE /admin/users/:id` - Delete a specific user
- `GET /admin/accounts` - List accounts with pagination and filtering
- `GET /admin/sessions` - List sessions with pagination and filtering
- `DELETE /admin/sessions/:id` - Revoke a specific session

#### Admin Dashboard

If enabled, the admin dashboard is available at `/admin` (or your configured path).

#### Programmatic Access

```typescript
// Server-side
import { BetterAuth } from 'better-auth';
import { authConfig } from '@/lib/auth/config';

const auth = new BetterAuth(authConfig);

// Access admin functionality
const adminApi = auth.admin;

// List users
const users = await adminApi.listUsers({
  limit: 10,
  offset: 0,
  filter: {
    email: { contains: '@example.com' },
  },
  sort: { createdAt: 'desc' },
});

// Get user stats
const stats = await adminApi.getUserStats();
```

## API Key Plugin

The API Key plugin enables API key generation, validation, and management for your application's API.

### API Key Plugin Configuration

```typescript
import { apiKeyPlugin } from 'better-auth/plugins';

// In your auth config
plugins: [
  apiKeyPlugin({
    // Enable API key functionality
    enabled: true,
    
    // Path prefix for API key endpoints
    path: '/api-keys',
    
    // API key settings
    keys: {
      // Maximum length of generated keys
      length: 32,
      
      // Key prefix to identify your app's keys
      prefix: 'myapp_',
      
      // Default expiration time (in seconds)
      expiresIn: 60 * 60 * 24 * 30, // 30 days
      
      // Maximum number of keys per user
      maxKeys: 5,
      
      // Roles allowed to create API keys
      allowedRoles: ['admin', 'developer'],
    },
    
    // Rate limiting for API key requests
    rateLimit: {
      enabled: true,
      windowMs: 60 * 1000, // 1 minute
      max: 100, // Max requests per windowMs
    },
  }),
],
```

### API Key Plugin Usage

#### Generate API Key

```typescript
// Server-side
import { BetterAuth } from 'better-auth';
import { authConfig } from '@/lib/auth/config';

const auth = new BetterAuth(authConfig);

// Generate API key for a user
const apiKey = await auth.apiKey.generate({
  userId: 'user-id',
  name: 'Development API Key',
  scopes: ['read:users', 'write:posts'],
  expiresIn: 60 * 60 * 24 * 7, // 7 days (optional)
});

// Client-side API key generation form
'use client'

import { useState } from 'react';

export function ApiKeyForm() {
  const [keyName, setKeyName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleGenerateKey = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: keyName }),
      });
      
      const data = await response.json();
      setApiKey(data.key);
    } catch (error) {
      console.error('Failed to generate API key:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleGenerateKey}>
      <div>
        <label htmlFor="keyName">API Key Name</label>
        <input
          id="keyName"
          value={keyName}
          onChange={(e) => setKeyName(e.target.value)}
          required
        />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Generating...' : 'Generate API Key'}
      </button>
      
      {apiKey && (
        <div className="mt-4">
          <p>Your API key (copy this now, it won't be shown again):</p>
          <code className="block p-2 bg-gray-100">{apiKey}</code>
        </div>
      )}
    </form>
  );
}
```

#### Validate API Key

```typescript
// In middleware or API route
import { NextRequest, NextResponse } from 'next/server';
import { BetterAuth } from 'better-auth';
import { authConfig } from '@/lib/auth/config';

const auth = new BetterAuth(authConfig);

export async function middleware(req: NextRequest) {
  // Get API key from Authorization header
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing or invalid API key' },
      { status: 401 }
    );
  }
  
  const apiKey = authHeader.replace('Bearer ', '');
  
  // Validate API key
  try {
    const result = await auth.apiKey.validate(apiKey);
    
    // Add user to request for downstream middleware/handlers
    (req as any).user = result.user;
    
    return NextResponse.next();
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid or expired API key' },
      { status: 401 }
    );
  }
}
```

#### List API Keys

```typescript
// Server-side
import { BetterAuth } from 'better-auth';
import { authConfig } from '@/lib/auth/config';

const auth = new BetterAuth(authConfig);

export async function listUserApiKeys(userId: string) {
  try {
    const keys = await auth.apiKey.list(userId);
    return { success: true, keys };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

## JWT Plugin

The JWT plugin adds JSON Web Token support for authentication, especially useful for APIs and microservices.

### JWT Plugin Configuration

```typescript
import { jwtPlugin } from 'better-auth/plugins';

// In your auth config
plugins: [
  jwtPlugin({
    // Secret for signing JWTs (use a secure, long random string)
    secret: process.env.JWT_SECRET,
    
    // JWT options
    options: {
      // Expiration time (in seconds)
      expiresIn: 60 * 60, // 1 hour
      
      // JWT algorithm
      algorithm: 'HS256',
      
      // Issuer
      issuer: 'your-app',
      
      // Audience
      audience: 'your-api',
    },
    
    // Custom function to generate JWT payload
    createPayload: (user, session) => {
      return {
        sub: user.id,
        email: user.email,
        roles: user.roles,
        // Add custom claims
        tenantId: user.tenantId,
      };
    },
    
    // Custom JWT validation logic
    validateJwt: async (payload, token) => {
      // Custom validation (e.g., check if user is still active)
      return true;
    },
  }),
],
```

### JWT Plugin Usage

#### Generate JWT Token

```typescript
// Server-side
import { BetterAuth } from 'better-auth';
import { authConfig } from '@/lib/auth/config';

const auth = new BetterAuth(authConfig);

export async function generateJwtForUser(userId: string) {
  try {
    const user = await auth.user.getById(userId);
    const token = await auth.jwt.generate(user);
    
    return { success: true, token };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

#### Verify JWT Token

```typescript
// In middleware or API route
import { NextRequest, NextResponse } from 'next/server';
import { BetterAuth } from 'better-auth';
import { authConfig } from '@/lib/auth/config';

const auth = new BetterAuth(authConfig);

export async function middleware(req: NextRequest) {
  // Get JWT from Authorization header
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing JWT' },
      { status: 401 }
    );
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  // Verify JWT
  try {
    const payload = await auth.jwt.verify(token);
    
    // Add payload to request for downstream middleware/handlers
    (req as any).user = payload;
    
    return NextResponse.next();
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid or expired JWT' },
      { status: 401 }
    );
  }
}
```

#### Refresh JWT Token

```typescript
// Server-side refresh endpoint
import { NextRequest, NextResponse } from 'next/server';
import { BetterAuth } from 'better-auth';
import { authConfig } from '@/lib/auth/config';

const auth = new BetterAuth(authConfig);

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json();
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token required' },
        { status: 400 }
      );
    }
    
    // Verify refresh token and generate new access token
    const result = await auth.jwt.refresh(refreshToken);
    
    return NextResponse.json({
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid or expired refresh token' },
      { status: 401 }
    );
  }
}
```

## Organization Plugin

The Organization plugin adds multi-tenant organization support to your authentication system.

### Organization Plugin Configuration

```typescript
import { organizationPlugin } from 'better-auth/plugins';

// In your auth config
plugins: [
  organizationPlugin({
    // Organization setup
    organizations: {
      // Default role for new organization members
      defaultRole: 'member',
      
      // Available roles within organizations
      roles: ['owner', 'admin', 'member'],
      
      // Maximum number of organizations a user can create
      maxOrganizationsPerUser: 5,
      
      // Require invitation to join organizations
      requireInvitation: true,
    },
    
    // Organization invitations
    invitations: {
      // How long invitations are valid (in seconds)
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      
      // Maximum number of pending invitations
      maxPending: 100,
    },
  }),
],
```

### Organization Plugin Usage

#### Create Organization

```typescript
// Server-side
import { BetterAuth } from 'better-auth';
import { authConfig } from '@/lib/auth/config';

const auth = new BetterAuth(authConfig);

export async function createOrganization(
  userId: string,
  data: { name: string; slug?: string }
) {
  try {
    const organization = await auth.organization.create({
      name: data.name,
      slug: data.slug || generateSlug(data.name),
      creatorId: userId,
    });
    
    return { success: true, organization };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Client-side form
'use client'

import { useState } from 'react';
import { createOrg } from './actions';

export function CreateOrganizationForm() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await createOrg({ name, slug });
      // Handle successful creation
    } catch (error) {
      console.error('Failed to create organization:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Form JSX...
}
```

#### Invite User to Organization

```typescript
// Server-side
import { BetterAuth } from 'better-auth';
import { authConfig } from '@/lib/auth/config';

const auth = new BetterAuth(authConfig);

export async function inviteUserToOrganization(
  organizationId: string,
  email: string,
  role: string = 'member'
) {
  try {
    const invitation = await auth.organization.invite({
      organizationId,
      email,
      role,
    });
    
    return { success: true, invitation };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

#### Accept Organization Invitation

```typescript
// Client-side
import { acceptInvitation } from '@/lib/organization';

export async function acceptOrgInvitation(token: string) {
  try {
    const result = await acceptInvitation(token);
    return { success: true, organization: result.organization };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Server-side implementation
'use server'

import { BetterAuth } from 'better-auth';
import { authConfig } from '@/lib/auth/config';

const auth = new BetterAuth(authConfig);

export async function acceptInvitation(token: string) {
  try {
    const result = await auth.organization.acceptInvitation(token);
    return { success: true, organization: result.organization };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

## OpenAPI Plugin

The OpenAPI plugin generates OpenAPI documentation for your authentication API endpoints.

### OpenAPI Plugin Configuration

```typescript
import { openAPIPlugin } from 'better-auth/plugins';

// In your auth config
plugins: [
  openAPIPlugin({
    // Enable OpenAPI documentation
    enabled: true,
    
    // Path where the OpenAPI documentation will be available
    path: '/api/auth/docs',
    
    // OpenAPI info
    info: {
      title: 'Authentication API',
      version: '1.0.0',
      description: 'API documentation for authentication endpoints',
    },
    
    // Server information
    servers: [
      {
        url: process.env.NEXT_PUBLIC_APP_URL,
        description: 'Production server',
      },
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    
    // Security definitions
    security: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    
    // Exclude certain endpoints from documentation
    exclude: [
      '/api/auth/admin/*',
    ],
  }),
],
```

### OpenAPI Plugin Usage

The OpenAPI plugin automatically generates documentation for your BetterAuth endpoints. You can access the OpenAPI JSON at the configured path (e.g., `/api/auth/docs`).

To view the documentation in a user-friendly format, you can use Swagger UI or Redoc:

```tsx
// In app/api/docs/page.tsx
'use client'

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamically import Swagger UI to avoid SSR issues
const SwaggerUI = dynamic(
  () => import('swagger-ui-react').then((mod) => mod.default),
  { ssr: false }
);

// Import CSS for Swagger UI
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocsPage() {
  const [spec, setSpec] = useState(null);
  
  useEffect(() => {
    async function fetchSpec() {
      const response = await fetch('/api/auth/docs');
      const data = await response.json();
      setSpec(data);
    }
    
    fetchSpec();
  }, []);
  
  if (!spec) {
    return <div>Loading API documentation...</div>;
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">API Documentation</h1>
      <SwaggerUI spec={spec} />
    </div>
  );
}
```

## Creating Custom Plugins

You can create custom plugins to extend BetterAuth's functionality:

```typescript
// src/lib/auth/custom-plugin.ts
import type { BetterAuthPlugin } from 'better-auth';

interface CustomPluginOptions {
  enabled?: boolean;
  featureXConfig?: string;
  // Other options...
}

export function customPlugin(options: CustomPluginOptions = {}): BetterAuthPlugin {
  const { 
    enabled = true,
    featureXConfig = 'default',
  } = options;
  
  return {
    // Plugin name
    name: 'custom-plugin',
    
    // Setup function - called during BetterAuth initialization
    setup: ({ auth, config }) => {
      if (!enabled) return;
      
      // Extend auth object with custom functionality
      auth.custom = {
        featureX: async (param1: string) => {
          // Implementation
          return { result: `${featureXConfig}: ${param1}` };
        },
        
        featureY: async (param1: number) => {
          // Implementation
          return { result: param1 * 2 };
        },
      };
      
      // Register API routes
      config.api.router.get('/custom-endpoint', async (req, res) => {
        // Handle custom endpoint
        return { message: 'Custom endpoint response' };
      });
      
      // Register hooks
      auth.hooks.register('beforeSignIn', async (data) => {
        // Custom logic before sign in
        console.log('Before sign in:', data.credentials.email);
        return data;
      });
    },
  };
}
```

Then use your custom plugin:

```typescript
// src/lib/auth/config.ts
import { customPlugin } from './custom-plugin';

export const authConfig = {
  // Core configuration...
  
  plugins: [
    // Other plugins...
    customPlugin({
      enabled: true,
      featureXConfig: 'customized',
    }),
  ],
};
```

## Plugin Best Practices

1. **Namespace Your Functionality**: Keep your plugin's functions under a descriptive namespace to avoid conflicts.

2. **Respect BetterAuth's Core**: Enhance, don't override core functionality unless absolutely necessary.

3. **Error Handling**: Implement proper error handling in your plugin functions.

4. **Configuration Validation**: Validate plugin options early to prevent runtime errors.

5. **Documentation**: Document your plugin's API and configuration options.

6. **Testing**: Create tests for your plugin to ensure it works correctly.

7. **Security**: Follow security best practices in your plugin implementation.

8. **TypeScript**: Use TypeScript for type safety in your plugin.

9. **Performance**: Be mindful of performance impact, especially for hooks that run frequently.

10. **Compatibility**: Clearly specify which versions of BetterAuth your plugin supports.
