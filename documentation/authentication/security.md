# Security Best Practices

This document outlines security best practices for using BetterAuth in your Next.js application.

## Core Security Features

BetterAuth implements several security measures by default:

- **HTTP-Only Cookies**: Session tokens are stored in HTTP-only cookies to prevent JavaScript access
- **CSRF Protection**: Cross-Site Request Forgery protection for all authentication endpoints
- **Rate Limiting**: Prevents brute force attacks on authentication endpoints
- **Secure Password Handling**: Passwords are hashed using bcrypt with proper salt rounds
- **XSS Protection**: Content Security Policy headers and careful escaping of user input
- **Session Management**: Secure session handling with rotation and expiration

## Environment Configuration

### Secure Environment Variables

Store sensitive authentication information in environment variables:

```env
# Auth configuration
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="https://your-domain.com"

# Provider secrets
MICROSOFT_CLIENT_ID="your-microsoft-client-id"
MICROSOFT_CLIENT_SECRET="your-microsoft-client-secret"
MICROSOFT_TENANT_ID="your-microsoft-tenant-id"

# Database connection
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
```

### Production vs Development Environments

```typescript
// src/lib/auth/config.ts
import { PrismaClient } from '@prisma/client';
import type { BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

const prisma = new PrismaClient();

export const authConfig = {
  appName: process.env.NEXT_PUBLIC_APP_NAME,
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  
  // Use different secret key per environment
  secret: process.env.NEXTAUTH_SECRET,
  
  // Production-specific settings
  production: {
    // Force HTTPS in production
    forceHttps: true,
    
    // Disable debug logging in production
    debug: false,
    
    // Set strict CORS policy
    cors: {
      origin: [process.env.NEXT_PUBLIC_APP_URL],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  },
  
  // More secure cookie settings in production
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
  
  // Ensure stronger password hashing in production
  hashing: {
    algorithm: 'bcrypt',
    saltRounds: process.env.NODE_ENV === 'production' ? 12 : 8,
  },
} satisfies BetterAuthOptions;
```

## Password Security

### Password Requirements

Configure strong password requirements:

```typescript
// src/lib/auth/config.ts
export const authConfig = {
  // Other config...
  
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    
    // Password validation
    password: {
      minLength: 10,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: true,
      
      // Prevent common passwords
      disallowCommon: true,
      
      // Prevent passwords containing user information
      disallowUserInfo: true,
    },
  },
};
```

### Password Validation with Zod

```typescript
import { z } from 'zod';

// Password validation schema
export const passwordSchema = z
  .string()
  .min(10, 'Password must be at least 10 characters')
  .regex(
    /[A-Z]/,
    'Password must contain at least one uppercase letter'
  )
  .regex(
    /[a-z]/,
    'Password must contain at least one lowercase letter'
  )
  .regex(
    /[0-9]/,
    'Password must contain at least one number'
  )
  .regex(
    /[^A-Za-z0-9]/,
    'Password must contain at least one special character'
  );

// Used in forms
const formSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
```

### Password Reset Flow Security

Implement a secure password reset flow:

1. User requests password reset
2. System generates a secure, one-time token with expiration
3. Email sent to user's verified email address
4. User clicks link with token
5. System verifies token is valid and not expired
6. User sets new password
7. All existing sessions are invalidated

## HTTPS and TLS

### Enforcing HTTPS

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  
  // Redirect HTTP to HTTPS in production
  if (
    process.env.NODE_ENV === 'production' &&
    req.headers.get('x-forwarded-proto') !== 'https'
  ) {
    url.protocol = 'https:';
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}
```

### HTTP Security Headers

```typescript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};
```

## Session Security

### Secure Session Configuration

```typescript
// src/lib/auth/config.ts
export const authConfig = {
  // Other config...
  
  session: {
    // JWT expiration time (in seconds)
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    
    // Session update frequency (in seconds)
    updateAge: 60 * 60 * 24, // 1 day
    
    // Session idle timeout (in seconds)
    idleTimeout: 60 * 60 * 2, // 2 hours
    
    // Cookie settings
    cookie: {
      name: 'better-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days (in seconds)
      },
    },
  },
};
```

### Managing Active Sessions

Allow users to view and manage their active sessions:

```tsx
'use client'

import { listSessions, revokeSessions } from '@/lib/auth/client';
import { useState, useEffect } from 'react';

export function SessionManager() {
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
  
  const handleRevokeSession = async (sessionId) => {
    try {
      await revokeSessions([sessionId]);
      // Update sessions list
      setSessions(sessions.filter(session => session.id !== sessionId));
    } catch (error) {
      console.error('Failed to revoke session:', error);
    }
  };
  
  const handleRevokeAllOtherSessions = async () => {
    try {
      // Find current session ID
      const currentSessionId = sessions.find(s => s.isCurrent)?.id;
      
      if (!currentSessionId) return;
      
      // Revoke all except current
      const otherSessionIds = sessions
        .filter(s => !s.isCurrent)
        .map(s => s.id);
      
      await revokeSessions(otherSessionIds);
      
      // Update sessions list
      setSessions(sessions.filter(s => s.isCurrent));
    } catch (error) {
      console.error('Failed to revoke other sessions:', error);
    }
  };
  
  // Render sessions list with revoke buttons
}
```

## Protection Against Common Attacks

### CSRF Protection

BetterAuth implements built-in CSRF protection using the double submit cookie pattern. For custom forms, you can implement additional CSRF protection:

```tsx
'use client'

import { useEffect, useState } from 'react';

function CSRFProtectedForm() {
  const [csrfToken, setCsrfToken] = useState('');
  
  useEffect(() => {
    // Fetch CSRF token on component mount
    async function fetchCSRFToken() {
      const response = await fetch('/api/auth/csrf');
      const data = await response.json();
      setCsrfToken(data.csrfToken);
    }
    
    fetchCSRFToken();
  }, []);
  
  return (
    <form method="POST" action="/api/custom-action">
      <input type="hidden" name="csrfToken" value={csrfToken} />
      {/* Form fields */}
      <button type="submit">Submit</button>
    </form>
  );
}
```

### XSS Protection

**Content Security Policy**:

```typescript
// next.config.js
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  block-all-mixed-content;
  upgrade-insecure-requests;
`;

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
  },
  // Other headers...
];
```

**Sanitize User Input**:

```typescript
// Use a library like DOMPurify to sanitize user input
import DOMPurify from 'dompurify';

function sanitizeUserInput(input: string): string {
  return DOMPurify.sanitize(input);
}

// Example usage
const userBio = sanitizeUserInput(req.body.bio);
```

### Rate Limiting

Configure rate limiting to prevent brute force attacks:

```typescript
// src/lib/auth/config.ts
export const authConfig = {
  // Other config...
  
  rateLimit: {
    // Enable rate limiting
    enabled: true,
    
    // Rate limit by IP address
    ipRateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
    },
    
    // Stricter limits for authentication endpoints
    signIn: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // 10 attempts per hour
    },
    
    signUp: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 5, // 5 attempts per hour
    },
    
    forgotPassword: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3, // 3 attempts per hour
    },
  },
};
```

## Role-Based Security

### Authorization Checks

Implement consistent role checks:

```typescript
// Server-side role check
import { getServerSession } from 'better-auth/integrations/next';
import { authConfig } from '@/lib/auth/config';

export async function requireAdmin(redirectUrl = '/unauthorized') {
  const session = await getServerSession(authConfig);
  
  if (!session || !session.user.roles?.includes('admin')) {
    redirect(redirectUrl);
  }
  
  return session;
}

// Client-side role check
'use client'

import { useSession } from '@/lib/auth/client';

export function useRequireAdmin(redirectUrl = '/unauthorized') {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === 'authenticated') {
      const isAdmin = session.user.roles?.includes('admin') ?? false;
      
      if (!isAdmin) {
        router.push(redirectUrl);
      }
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, router, redirectUrl]);
  
  return status;
}
```

### Secure Role Assignment

Only allow role changes by authorized users:

```typescript
'use server'

import { BetterAuth } from 'better-auth';
import { authConfig } from '@/lib/auth/config';
import { getServerSession } from 'better-auth/integrations/next';

const auth = new BetterAuth(authConfig);

export async function updateUserRoles(userId: string, roles: string[]) {
  // Get current user's session
  const session = await getServerSession(authConfig);
  
  // Check if user is admin
  if (!session || !session.user.roles?.includes('admin')) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  // Prevent privilege escalation (cannot add admin role if you're not admin)
  if (roles.includes('admin') && !session.user.roles.includes('admin')) {
    throw new Error('Unauthorized: Cannot assign admin role');
  }
  
  // Update user roles
  await auth.user.update(userId, { roles });
  
  return { success: true };
}
```

## OAuth Provider Security

### Secure Microsoft Authentication

For enterprise Microsoft authentication:

```typescript
// src/lib/auth/config.ts
export const authConfig = {
  // Other config...
  
  microsoft: {
    enabled: true,
    clientId: process.env.MICROSOFT_CLIENT_ID!,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
    tenantId: process.env.MICROSOFT_TENANT_ID!,
    
    // Restrict to specific tenant
    authorization: {
      params: {
        scope: 'openid profile email User.Read',
        prompt: 'select_account',
      },
    },
    
    // Validate emails from specific domains
    async validate({ profile }) {
      const email = profile.email;
      const allowedDomains = ['yourenterprise.com'];
      
      if (!email) {
        throw new Error('Email is required from Microsoft account');
      }
      
      const emailDomain = email.split('@')[1];
      
      if (!allowedDomains.includes(emailDomain)) {
        throw new Error('Only company email addresses are allowed');
      }
      
      return true;
    },
  },
};
```

### Restrict Callback URLs

```typescript
// src/lib/auth/config.ts
export const authConfig = {
  // Other config...
  
  // Validate callback URLs
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Only allow redirects to URLs on our domain
      if (url.startsWith(baseUrl)) {
        return url;
      }
      
      // Allow specific external domains if needed
      const allowedExternalDomains = [
        'trusted-partner.com',
      ];
      
      const hostname = new URL(url).hostname;
      
      if (allowedExternalDomains.includes(hostname)) {
        return url;
      }
      
      // Default fallback redirect
      return baseUrl;
    },
  },
};
```

## Database Security

### Prisma Security Best Practices

**Connection Pooling**:

```typescript
// prisma/client.ts
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['query', 'error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Connection pooling settings
    connection: {
      pool: {
        min: 2,
        max: 10,
      },
    },
  });
};

// Ensure only one instance in development
export const prisma = globalThis.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}
```

**Data Sanitization**:

```typescript
// Always validate and sanitize inputs before queries
import { z } from 'zod';

const userUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
});

async function updateUser(userId: string, data: unknown) {
  // Validate and sanitize input
  const validatedData = userUpdateSchema.parse(data);
  
  // Now safe to use in database query
  return prisma.user.update({
    where: { id: userId },
    data: validatedData,
  });
}
```

## Security Auditing

### Authentication Logging

```typescript
// src/lib/auth/config.ts
export const authConfig = {
  // Other config...
  
  // Enable security audit logging
  logging: {
    level: 'info', // 'debug', 'info', 'warn', 'error'
    events: {
      signIn: true,
      signOut: true,
      signUp: true,
      passwordChange: true,
      emailChange: true,
      sessionCreated: true,
      sessionRevoked: true,
      accountLinked: true,
      accountUnlinked: true,
    },
    // Custom logger
    logger: async (level, message, data) => {
      // Log to your preferred service
      console[level](message, data);
      
      // For important security events, store in database
      if (
        data.event === 'signIn' ||
        data.event === 'passwordChange' ||
        data.event === 'accountLinked'
      ) {
        await prisma.securityLog.create({
          data: {
            event: data.event,
            userId: data.userId,
            ip: data.ip,
            userAgent: data.userAgent,
            details: data,
            timestamp: new Date(),
          },
        });
      }
    },
  },
};
```

## Security Checklist

### Implementation Checklist

- [ ] Use HTTPS everywhere
- [ ] Set secure, HTTP-only cookies
- [ ] Implement proper CSRF protection
- [ ] Enable rate limiting
- [ ] Use strong password policies
- [ ] Implement proper session management
- [ ] Validate all user inputs
- [ ] Use parameterized queries for database access
- [ ] Implement proper access controls
- [ ] Keep dependencies updated
- [ ] Set secure HTTP headers
- [ ] Implement proper error handling
- [ ] Log security events
- [ ] Use secure credentials storage
- [ ] Implement two-factor authentication (when needed)
- [ ] Test for security vulnerabilities

### Regular Security Tasks

- [ ] **Regular dependency updates**: Keep BetterAuth and all dependencies updated
- [ ] **Security audits**: Regularly audit authentication logs for suspicious activity
- [ ] **Penetration testing**: Conduct periodic penetration testing
- [ ] **Code reviews**: Perform security-focused code reviews
- [ ] **Security training**: Keep developers updated on security best practices
