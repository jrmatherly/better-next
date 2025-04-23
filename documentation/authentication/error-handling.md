# Error Handling

This document covers error handling in BetterAuth, including common error types, best practices for handling errors, and implementing robust error management in your application.

## BetterAuth Error System

BetterAuth uses a structured error system that provides detailed information about what went wrong during authentication operations.

### BetterAuthError Class

BetterAuth exports a `BetterAuthError` class that extends the standard JavaScript `Error` class with additional properties:

```typescript
interface BetterAuthError extends Error {
  code: string;         // Error code identifier
  status: number;       // HTTP status code
  cause?: unknown;      // Original error that caused this error
  details?: unknown;    // Additional error details
}
```

### Common Error Codes

BetterAuth defines several common error codes:

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `invalid_request` | 400 | The request is malformed or missing required parameters |
| `invalid_credentials` | 401 | The provided credentials are invalid |
| `user_not_found` | 404 | The requested user does not exist |
| `email_not_verified` | 403 | The user's email has not been verified |
| `unauthorized` | 401 | The user is not authenticated |
| `forbidden` | 403 | The user is authenticated but not authorized for the operation |
| `not_found` | 404 | The requested resource does not exist |
| `conflict` | 409 | The request conflicts with the current state (e.g., email already exists) |
| `rate_limited` | 429 | The client has sent too many requests |
| `internal_error` | 500 | An unexpected server error occurred |

## Client-Side Error Handling

### Handling Authentication Errors

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
      await signIn('email-password', {
        email,
        password,
      });
      
      // Success - will automatically redirect
    } catch (error) {
      // Handle specific error types
      if (error.code === 'invalid_credentials') {
        setError('Invalid email or password');
      } else if (error.code === 'email_not_verified') {
        setError('Please verify your email before signing in');
      } else if (error.code === 'rate_limited') {
        setError('Too many sign-in attempts. Please try again later.');
      } else {
        // Generic error handling
        setError(`Sign-in failed: ${error.message}`);
      }
      
      console.error('Sign-in error:', error);
    }
  };
  
  // Form JSX...
}
```

### Structured Error Component

Create a reusable error component for authentication errors:

```tsx
'use client'

interface AuthErrorProps {
  error: { code?: string; message: string } | string | null;
}

export function AuthError({ error }: AuthErrorProps) {
  if (!error) return null;
  
  // Convert string errors to object format
  const errorObj = typeof error === 'string' 
    ? { code: undefined, message: error } 
    : error;
  
  // Map error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    invalid_credentials: 'The email or password you provided is incorrect.',
    user_not_found: 'We couldn\'t find an account with that email.',
    email_not_verified: 'Please verify your email address before signing in.',
    rate_limited: 'Too many attempts. Please try again later.',
    unauthorized: 'You must be signed in to access this resource.',
    forbidden: 'You don\'t have permission to access this resource.',
  };
  
  // Get the appropriate message
  const message = errorObj.code 
    ? (errorMessages[errorObj.code] || errorObj.message)
    : errorObj.message;
  
  return (
    <div 
      className="p-3 mb-4 text-sm border rounded-md bg-red-50 text-red-600 border-red-200"
      role="alert"
    >
      {message}
    </div>
  );
}

// Usage
<AuthError error={error} />
```

### Error Boundary for Authentication

Implement a React Error Boundary for authentication components:

```tsx
'use client'

import { Component, ErrorInfo, ReactNode } from 'react';

interface AuthErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode | ((error: Error) => ReactNode);
}

interface AuthErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class AuthErrorBoundary extends Component<
  AuthErrorBoundaryProps,
  AuthErrorBoundaryState
> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    console.error('Authentication error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render the fallback UI
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error!);
      }
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Usage
<AuthErrorBoundary
  fallback={(error) => (
    <div className="text-red-500">
      <h2>Authentication Error</h2>
      <p>{error.message}</p>
      <button onClick={() => window.location.href = '/login'}>
        Try Again
      </button>
    </div>
  )}
>
  <SignInForm />
</AuthErrorBoundary>
```

## Server-Side Error Handling

### Handling Errors in Server Components

```tsx
// In a server component
import { getServerSession } from 'better-auth/integrations/next';
import { authConfig } from '@/lib/auth/config';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session) {
      redirect('/login');
    }
    
    // Additional authorization check
    if (!session.user.roles?.includes('admin')) {
      throw new Error('Access denied. Admin role required.');
    }
    
    // Render protected content
    return <div>Protected admin content</div>;
  } catch (error) {
    // Log server-side error
    console.error('Server authentication error:', error);
    
    // Return error UI
    return (
      <div className="p-4 border border-red-300 bg-red-50 text-red-700 rounded-md">
        <h2 className="text-lg font-bold">Access Error</h2>
        <p>{error.message || 'An error occurred while accessing this page'}</p>
        <a href="/login" className="text-blue-500 underline">
          Sign in with appropriate permissions
        </a>
      </div>
    );
  }
}
```

### Error Handling in API Routes

```typescript
// In app/api/protected-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'better-auth/integrations/next';
import { authConfig } from '@/lib/auth/config';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session) {
      return NextResponse.json(
        {
          error: {
            code: 'unauthorized',
            message: 'You must be signed in to access this endpoint',
          }
        },
        { status: 401 }
      );
    }
    
    // Check permissions
    if (!session.user.roles?.includes('admin')) {
      return NextResponse.json(
        {
          error: {
            code: 'forbidden',
            message: 'You do not have permission to access this resource',
          }
        },
        { status: 403 }
      );
    }
    
    // Process request for authorized users
    return NextResponse.json({
      data: 'Protected data',
    });
  } catch (error) {
    console.error('API error:', error);
    
    // Return structured error response
    return NextResponse.json(
      {
        error: {
          code: 'internal_error',
          message: 'An unexpected error occurred',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        }
      },
      { status: 500 }
    );
  }
}
```

### Custom Error Handler Middleware

```typescript
// In middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createNextMiddleware } from 'better-auth/integrations/next';
import { authConfig } from './lib/auth/config';

const betterAuthMiddleware = createNextMiddleware(authConfig);

export default async function middleware(req: NextRequest) {
  try {
    // Apply BetterAuth middleware
    const res = await betterAuthMiddleware(req);
    if (res) return res;
    
    // Your custom middleware logic
    
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    
    // Handle different types of errors
    if (error.code === 'invalid_session') {
      // Redirect to login for invalid session
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    if (error.code === 'rate_limited') {
      // Return rate limit response
      return NextResponse.json(
        { error: 'Too many requests, please try again later' },
        { status: 429 }
      );
    }
    
    // Default error handling
    return NextResponse.json(
      { error: 'Authentication error' },
      { status: 500 }
    );
  }
}
```

## Error Logging and Monitoring

### Implementing Error Logging

```typescript
// src/lib/auth/error-logger.ts
interface ErrorLogData {
  code: string;
  message: string;
  stack?: string;
  userId?: string;
  path?: string;
  timestamp: Date;
}

export async function logAuthError(
  error: any,
  context: { userId?: string; path?: string } = {}
) {
  const errorData: ErrorLogData = {
    code: error.code || 'unknown_error',
    message: error.message || 'Unknown error',
    stack: error.stack,
    userId: context.userId,
    path: context.path,
    timestamp: new Date(),
  };
  
  // Log to console
  console.error('Auth error:', errorData);
  
  // Log to server (example with fetch)
  try {
    await fetch('/api/logs/auth-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorData),
    });
  } catch (logError) {
    // Silent fail for logging errors
    console.error('Failed to log auth error:', logError);
  }
  
  // Optional: Send to error monitoring service like Sentry
  if (typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.captureException(error, {
      tags: {
        auth_error_code: errorData.code,
      },
      user: {
        id: context.userId,
      },
    });
  }
}
```

### Integrating with External Error Monitoring

```typescript
// In _app.tsx or layout.tsx
import * as Sentry from '@sentry/nextjs';

// Initialize Sentry
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

// Create error handler for auth errors
export function captureAuthError(error: any, context: any = {}) {
  Sentry.captureException(error, {
    tags: {
      error_type: 'authentication',
      error_code: error.code,
    },
    extra: context,
  });
}
```

## Graceful Error Recovery

### Implementing Retry Logic

```typescript
'use client'

import { signIn } from '@/lib/auth/client';

async function signInWithRetry(
  provider: string,
  credentials: any,
  maxRetries = 3
) {
  let retries = 0;
  let lastError;
  
  while (retries < maxRetries) {
    try {
      return await signIn(provider, credentials);
    } catch (error) {
      // Don't retry for certain error types
      if (
        error.code === 'invalid_credentials' ||
        error.code === 'user_not_found' ||
        error.code === 'email_not_verified'
      ) {
        throw error;
      }
      
      // For network errors, try again
      if (
        error.code === 'network_error' ||
        error.code === 'timeout' ||
        error.code === 'server_error'
      ) {
        retries++;
        lastError = error;
        
        // Exponential backoff
        const delay = Math.pow(2, retries) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // For other errors, don't retry
      throw error;
    }
  }
  
  // If we got here, all retries failed
  throw lastError;
}
```

### Session Recovery

```typescript
'use client'

import { useSession, getSession } from '@/lib/auth/client';
import { useEffect, useState } from 'react';

export function useRecoverableSession() {
  const { data: session, status, update } = useSession();
  const [error, setError] = useState(null);
  const [isRecovering, setIsRecovering] = useState(false);
  
  useEffect(() => {
    const checkSession = async () => {
      if (status === 'unauthenticated' && localStorage.getItem('hadPreviousSession')) {
        setIsRecovering(true);
        
        try {
          // Try to recover the session
          const freshSession = await getSession();
          
          if (freshSession) {
            await update();
            setError(null);
          }
        } catch (e) {
          setError(e);
        } finally {
          setIsRecovering(false);
        }
      }
    };
    
    checkSession();
  }, [status, update]);
  
  useEffect(() => {
    // Track when a session exists
    if (status === 'authenticated') {
      localStorage.setItem('hadPreviousSession', 'true');
    }
  }, [status]);
  
  return {
    session,
    status: isRecovering ? 'recovering' : status,
    error,
    update,
  };
}
```

## Error Handling Best Practices

### 1. Use Structured Error Responses

Always return structured error responses that include:

- Error code (machine-readable)
- Error message (human-readable)
- HTTP status code (for API requests)
- Additional details (where helpful)

```typescript
// Example structured error response
const errorResponse = {
  error: {
    code: 'invalid_credentials',
    message: 'The email or password provided is incorrect',
    status: 401,
    details: {
      field: 'password',
      reason: 'incorrect_password',
    },
  },
};
```

### 2. Implement Progressive Error Handling

Handle errors at multiple levels:

1. **Component Level**: Handle errors related to UI components
2. **Page Level**: Use Error Boundaries to catch unhandled component errors
3. **Global Level**: Implement global error handling for unhandled errors

```typescript
// Global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    // Log error to monitoring service
    captureAuthError(event.error, {
      source: 'window.onerror',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    // Log unhandled promise rejection
    captureAuthError(event.reason, {
      source: 'unhandledrejection',
    });
  });
}
```

### 3. Handle Rate Limiting Gracefully

```typescript
'use client'

import { signIn } from '@/lib/auth/client';
import { useState } from 'react';

export function SignInForm() {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRateLimited) {
      setError(`Too many attempts. Please try again in ${retryAfter} seconds.`);
      return;
    }
    
    try {
      // Attempt sign-in
      await signIn('email-password', {
        email,
        password,
      });
    } catch (error) {
      if (error.code === 'rate_limited') {
        setIsRateLimited(true);
        
        // Get retry-after header or default to 60 seconds
        const retrySeconds = parseInt(error.details?.retryAfter || '60', 10);
        setRetryAfter(retrySeconds);
        
        // Start countdown timer
        const timer = setInterval(() => {
          setRetryAfter(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              setIsRateLimited(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        setError(`Too many attempts. Please try again in ${retrySeconds} seconds.`);
      } else {
        setError(error.message);
      }
    }
  };
  
  // Form JSX...
}
```

### 4. Provide User-Friendly Error Messages

Map technical error codes to user-friendly messages:

```typescript
// src/lib/auth/error-messages.ts
export const authErrorMessages: Record<string, string> = {
  // Sign-in errors
  invalid_credentials: 'The email or password you entered is incorrect.',
  user_not_found: 'We couldn\'t find an account with that email address.',
  email_not_verified: 'Please verify your email address before signing in.',
  
  // Registration errors
  email_exists: 'An account with this email address already exists.',
  password_too_weak: 'Your password is too weak. Please choose a stronger password.',
  invalid_invitation: 'The invitation link you used is invalid or has expired.',
  
  // Session errors
  session_expired: 'Your session has expired. Please sign in again.',
  invalid_session: 'Your session is invalid. Please sign in again.',
  
  // Permission errors
  unauthorized: 'You need to sign in to access this resource.',
  forbidden: 'You don\'t have permission to access this resource.',
  insufficient_permissions: 'You don\'t have sufficient permissions for this action.',
  
  // Rate limiting
  rate_limited: 'Too many attempts. Please try again later.',
  
  // Generic errors
  network_error: 'Network error. Please check your internet connection.',
  server_error: 'A server error occurred. Please try again later.',
  unknown_error: 'An unknown error occurred. Please try again.',
};

export function getAuthErrorMessage(error: any): string {
  if (!error) return '';
  
  const errorCode = error.code || 'unknown_error';
  return authErrorMessages[errorCode] || error.message || 'An error occurred.';
}
```

### 5. Implement Fallback UI

Always provide fallback UI for authentication components:

```tsx
'use client'

import { useSession } from '@/lib/auth/client';
import { Suspense } from 'react';

function ProfileData() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') {
    return <LoadingSpinner />;
  }
  
  if (status === 'unauthenticated') {
    return <SignInPrompt />;
  }
  
  return <UserProfile user={session.user} />;
}

// Wrap with suspense and error boundary
export function ProfileSection() {
  return (
    <ErrorBoundary fallback={<ProfileError />}>
      <Suspense fallback={<LoadingSpinner />}>
        <ProfileData />
      </Suspense>
    </ErrorBoundary>
  );
}
```

## Common Authentication Error Scenarios

### 1. Invalid Credentials

```typescript
try {
  await signIn('email-password', {
    email,
    password,
  });
} catch (error) {
  if (error.code === 'invalid_credentials') {
    // Track failed attempts
    const attempts = incrementFailedAttempts();
    
    if (attempts >= 3) {
      // Show account recovery options
      setShowAccountRecovery(true);
    }
    
    setError('The email or password you entered is incorrect.');
  }
}
```

### 2. Email Not Verified

```typescript
try {
  await signIn('email-password', {
    email,
    password,
  });
} catch (error) {
  if (error.code === 'email_not_verified') {
    // Store email in state
    setUnverifiedEmail(email);
    
    // Show email verification UI
    setShowVerificationPrompt(true);
  }
}

// Email verification prompt component
function EmailVerificationPrompt({ email, onResend }) {
  return (
    <div className="p-4 border rounded-md">
      <h3>Verify Your Email</h3>
      <p>
        Please verify your email address ({email}) before signing in.
        Check your inbox for a verification link.
      </p>
      <button onClick={onResend}>
        Resend Verification Email
      </button>
    </div>
  );
}
```

### 3. Session Expiration

```typescript
'use client'

import { useSession } from '@/lib/auth/client';
import { useEffect, useState } from 'react';

export function SessionExpirationHandler() {
  const { data: session, status } = useSession();
  const [showExpirationWarning, setShowExpirationWarning] = useState(false);
  
  useEffect(() => {
    if (!session) return;
    
    // Parse session expiration time
    const expiresAt = new Date(session.expires).getTime();
    const now = Date.now();
    
    // Calculate time until expiration (in ms)
    const timeUntilExpiration = expiresAt - now;
    
    // If session expires in less than 5 minutes, show warning
    if (timeUntilExpiration > 0 && timeUntilExpiration < 5 * 60 * 1000) {
      setShowExpirationWarning(true);
      
      // Set timer to refresh session automatically
      const timer = setTimeout(() => {
        // Attempt to refresh session
        update();
        setShowExpirationWarning(false);
      }, timeUntilExpiration / 2);
      
      return () => clearTimeout(timer);
    }
  }, [session, update]);
  
  if (!showExpirationWarning) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md shadow-md">
      <p className="text-yellow-700">Your session will expire soon.</p>
      <button
        onClick={() => update()}
        className="text-blue-500 underline"
      >
        Extend Session
      </button>
    </div>
  );
}
```

### 4. Rate Limiting

```typescript
export async function signInWithRateLimitHandling(credentials) {
  try {
    return await signIn('email-password', credentials);
  } catch (error) {
    if (error.code === 'rate_limited') {
      // Extract retry-after duration from error
      const retryAfter = error.details?.retryAfter || 60; // Default to 60 seconds
      
      // Calculate when user can retry
      const retryTime = new Date(Date.now() + retryAfter * 1000);
      
      // Save retry time to localStorage
      localStorage.setItem('auth_retry_after', retryTime.toISOString());
      
      // Throw with enhanced message
      throw new Error(
        `Too many sign-in attempts. Please try again after ${formatTime(retryTime)}.`
      );
    }
    
    throw error;
  }
}

// Helper to format time
function formatTime(date) {
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);
}
```
