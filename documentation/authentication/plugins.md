# BetterAuth Plugins

This document covers the plugin system in BetterAuth, including available official plugins, how to configure and use them, and how to create custom plugins.

## Plugin System Overview

BetterAuth uses a plugin architecture to extend its functionality without bloating the core package. Plugins can add new features, integrate with other services, or modify the behavior of existing features.

## Configuring Plugins

Plugins are configured in our main auth configuration file:

```typescript
// src/lib/auth/config.ts
import { PrismaClient } from '@prisma/client';
import type { BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { 
  admin, 
  apiKey, 
  jwt, 
  openAPI, 
  organization 
} from 'better-auth/plugins';

const prisma = new PrismaClient();

export const authConfig = {
  // Core configuration...
  
  // Configure plugins
  plugins: [
    admin(),     // Admin plugin for user and session management
    apiKey(),    // API Key plugin for secure API access
    jwt(),       // JWT plugin for token-based authentication
    organization(), // Organization plugin for multi-tenant support
    openAPI(),   // OpenAPI plugin for API documentation
  ],
} satisfies BetterAuthOptions;
```

## Enabled Plugins

Our application currently uses the following plugins:

### Admin Plugin

The Admin plugin provides an administrative interface and API endpoints for managing users, roles, and other authentication-related data.

#### Admin Features

- Admin dashboard for user management at `/admin`
- API endpoints for managing users, accounts, and sessions
- Role-based access control for admin features (admin role required)

#### Admin Programmatic Access

```typescript
// Server-side
import { auth } from '@/lib/auth/server';

// Access admin functionality
const adminApi = auth.admin;

// List users
const users = await adminApi.listUsers();

// Get user stats
const stats = await adminApi.getUserStats();
```

### API Key Plugin

The API Key plugin enables API key generation, validation, and management for our application's API.

#### API Key Features

- API key generation and validation
- API key management UI at `/api-keys`
- Role-based permissions for key generation
- Automatic key expiration handling

#### API Key Usage Example

```typescript
// Generate an API key
import { auth } from '@/lib/auth/server';

// Create a new API key for a user
const newKey = await auth.apiKey.createKey({
  userId: 'user-id',
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  description: 'Development API key',
});

// Validate an API key
const validated = await auth.apiKey.validateKey('api-key-value');
if (validated) {
  // Key is valid, proceed with API operation
}
```

### JWT Plugin

The JWT plugin provides JWT token generation and validation for authenticated API access.

#### JWT Features

- JWT token generation for authenticated users
- Token verification and validation
- Automatic token refresh
- Audience and issuer validation

#### JWT Usage Example

```typescript
// Generate a JWT token
import { auth } from '@/lib/auth/server';

const token = await auth.jwt.sign({ 
  userId: 'user-id',
  roles: ['admin'],
});

// Verify a token
const payload = await auth.jwt.verify(token);
if (payload) {
  // Token is valid
}
```

### Organization Plugin

The Organization plugin adds support for multi-tenant organizations, allowing users to be members of different organizations with specific roles.

#### Organization Features

- Organization creation and management
- Member invitations and management
- Organization-specific roles
- Organization-scoped data access

#### Organization Usage Example

```typescript
// Create a new organization
import { auth } from '@/lib/auth/server';

const org = await auth.organization.create({
  name: 'My Organization',
  ownerId: 'user-id',
});

// Invite a member
const invitation = await auth.organization.inviteUser({
  organizationId: org.id,
  email: 'user@example.com',
  role: 'member',
});
```

### OpenAPI Plugin

The OpenAPI plugin generates API documentation for all authentication endpoints.

#### OpenAPI Features

- Interactive API documentation
- Documentation available at `/api-docs`
- Automatic endpoint and schema discovery
- Authentication support in documentation

## Environment Variables

The following environment variables are used by our plugin configuration:

```bash
# JWT Plugin
JWT_SECRET=your-secret-key-for-jwt-tokens

# General Auth Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Better Next
```

Make sure these are properly configured in your `.env` file before using the plugins.

## Client-Side Integration

To use the plugins on the client side, we need to create an auth client with the corresponding client plugins:

```typescript
// src/lib/auth/client.ts
import { createAuthClient } from 'better-auth/client';
import { 
  adminClient, 
  apiKeyClient,
  jwtClient,
  organizationClient
} from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  plugins: [
    adminClient(),
    apiKeyClient(),
    jwtClient(),
    organizationClient(),
  ],
});
```

Then use it in your components:

```tsx
// Example component using the auth client
import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth/client';

export function OrganizationsList() {
  const [orgs, setOrgs] = useState([]);
  
  useEffect(() => {
    async function fetchOrgs() {
      const userOrgs = await authClient.organization.getUserOrganizations();
      setOrgs(userOrgs);
    }
    
    fetchOrgs();
  }, []);
  
  return (
    <div>
      <h2>Your Organizations</h2>
      <ul>
        {orgs.map(org => (
          <li key={org.id}>{org.name}</li>
        ))}
      </ul>
    </div>
  );
}
