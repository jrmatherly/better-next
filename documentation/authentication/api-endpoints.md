# API Endpoints

This document details the API endpoints provided by BetterAuth, including their request/response formats, authentication requirements, and usage examples.

## API Structure

BetterAuth provides a comprehensive set of RESTful API endpoints for authentication and user management. These endpoints are automatically created when you set up the BetterAuth route handler in your Next.js application.

## Setting Up API Routes

### Next.js App Router

Create a route handler file at `/app/api/auth/[...better-auth]/route.ts`:

```typescript
import { createNextAppRouter } from 'better-auth/integrations/next';
import { authConfig } from '@/lib/auth/config';

export const { GET, POST, PUT, DELETE, PATCH } = createNextAppRouter(authConfig);
```

This single route handler will handle all BetterAuth API endpoints under the `/api/auth/*` path.

## API Endpoint Reference

### Authentication Endpoints

#### Sign In

- **URL**: `/login`
- **Method**: `POST`
- **Request Body**:

  ```typescript
  {
    provider: string;    // e.g., 'email-password', 'microsoft', 'google'
    credentials?: {
      email: string;
      password: string;
    };
    redirectUrl?: string;
  }
  ```

- **Response**:

  ```typescript
  {
    user: {
      id: string;
      name?: string;
      email?: string;
      image?: string;
      roles?: string[];
      [key: string]: any;
    };
    session: {
      sessionToken: string;
      userId: string;
      expires: string;
    };
  }
  ```

- **Status Codes**:
  - `200 OK`: Successful sign in
  - `400 Bad Request`: Invalid request body
  - `401 Unauthorized`: Invalid credentials
  - `404 Not Found`: Provider not found

#### Sign Up

- **URL**: `/sign-up`
- **Method**: `POST`
- **Request Body**:

  ```typescript
  {
    name?: string;
    email: string;
    password: string;
    [key: string]: any; // Additional fields
  }
  ```

- **Response**:

  ```typescript
  {
    user: {
      id: string;
      name?: string;
      email: string;
      emailVerified?: Date;
      image?: string;
      [key: string]: any;
    };
  }
  ```

- **Status Codes**:
  - `201 Created`: User created successfully
  - `400 Bad Request`: Invalid request body
  - `409 Conflict`: Email already exists

#### Sign Out

- **URL**: `/api/auth/signout`
- **Method**: `POST`
- **Request Body**:

  ```typescript
  {
    redirectUrl?: string;
    signOutFromProvider?: boolean;
  }
  ```

- **Response**:

  ```typescript
  {
    success: true;
  }
  ```

- **Status Codes**:
  - `200 OK`: Signed out successfully
  - `401 Unauthorized`: Not signed in

#### OAuth Callback

- **URL**: `/api/auth/callback/:provider`
- **Method**: `GET`
- **Query Parameters**:
  - `code`: OAuth authorization code
  - `state`: State parameter for CSRF protection
  - `error`: Error message if OAuth flow failed
- **Response**: Redirects to the specified redirect URL or default URL
- **Status Codes**:
  - `302 Found`: Redirect to authorized application
  - `400 Bad Request`: Invalid callback parameters
  - `500 Internal Server Error`: Failed to complete OAuth flow

### User Management Endpoints

#### Get Current User

- **URL**: `/api/auth/user`
- **Method**: `GET`
- **Authentication**: Required
- **Response**:

  ```typescript
  {
    user: {
      id: string;
      name?: string;
      email?: string;
      image?: string;
      roles?: string[];
      [key: string]: any;
    };
  }
  ```

- **Status Codes**:
  - `200 OK`: User details retrieved successfully
  - `401 Unauthorized`: Not authenticated

#### Update User

- **URL**: `/api/auth/user`
- **Method**: `PATCH`
- **Authentication**: Required
- **Request Body**:

  ```typescript
  {
    name?: string;
    image?: string;
    [key: string]: any; // Additional user fields
  }
  ```

- **Response**:

  ```typescript
  {
    user: {
      id: string;
      name?: string;
      email?: string;
      image?: string;
      [key: string]: any;
    };
  }
  ```

- **Status Codes**:
  - `200 OK`: User updated successfully
  - `400 Bad Request`: Invalid request body
  - `401 Unauthorized`: Not authenticated

#### Delete User

- **URL**: `/api/auth/user`
- **Method**: `DELETE`
- **Authentication**: Required
- **Response**:

  ```typescript
  {
    success: true;
  }
  ```

- **Status Codes**:
  - `200 OK`: User deleted successfully
  - `401 Unauthorized`: Not authenticated

### Password Management Endpoints

#### Change Password

- **URL**: `/api/auth/password`
- **Method**: `PUT`
- **Authentication**: Required
- **Request Body**:

  ```typescript
  {
    currentPassword: string;
    newPassword: string;
  }
  ```

- **Response**:

  ```typescript
  {
    success: true;
  }
  ```

- **Status Codes**:
  - `200 OK`: Password changed successfully
  - `400 Bad Request`: Invalid request body
  - `401 Unauthorized`: Invalid current password

#### Forgot Password

- **URL**: `/api/auth/password/forgot`
- **Method**: `POST`
- **Request Body**:

  ```typescript
  {
    email: string;
  }
  ```

- **Response**:

  ```typescript
  {
    success: true;
  }
  ```

- **Status Codes**:
  - `200 OK`: Password reset email sent successfully
  - `400 Bad Request`: Invalid email
  - `404 Not Found`: User not found

#### Reset Password

- **URL**: `/api/auth/password/reset`
- **Method**: `POST`
- **Request Body**:

  ```typescript
  {
    token: string;
    password: string;
  }
  ```

- **Response**:

  ```typescript
  {
    success: true;
  }
  ```

- **Status Codes**:
  - `200 OK`: Password reset successfully
  - `400 Bad Request`: Invalid token or password
  - `404 Not Found`: Token not found or expired

### Email Verification Endpoints

#### Send Verification Email

- **URL**: `/api/auth/email/verify`
- **Method**: `POST`
- **Authentication**: Required
- **Response**:

  ```typescript
  {
    success: true;
  }
  ```

- **Status Codes**:
  - `200 OK`: Verification email sent successfully
  - `401 Unauthorized`: Not authenticated

#### Verify Email

- **URL**: `/api/auth/email/verify`
- **Method**: `GET`
- **Query Parameters**:
  - `token`: Email verification token
- **Response**: Redirects to the specified redirect URL or default URL
- **Status Codes**:
  - `302 Found`: Redirect after email verification
  - `400 Bad Request`: Invalid token
  - `404 Not Found`: Token not found or expired

### Session Management Endpoints

#### List Sessions

- **URL**: `/api/auth/sessions`
- **Method**: `GET`
- **Authentication**: Required
- **Response**:

  ```typescript
  {
    sessions: [{
      id: string;
      userId: string;
      expires: string;
      lastActive: string;
      ip?: string;
      userAgent?: string;
      device?: string;
    }];
  }
  ```

- **Status Codes**:
  - `200 OK`: Sessions retrieved successfully
  - `401 Unauthorized`: Not authenticated

#### Revoke Session

- **URL**: `/api/auth/sessions/:sessionId`
- **Method**: `DELETE`
- **Authentication**: Required
- **Response**:

  ```typescript
  {
    success: true;
  }
  ```

- **Status Codes**:
  - `200 OK`: Session revoked successfully
  - `401 Unauthorized`: Not authenticated
  - `403 Forbidden`: Cannot revoke another user's session
  - `404 Not Found`: Session not found

#### Revoke All Sessions

- **URL**: `/api/auth/sessions`
- **Method**: `DELETE`
- **Authentication**: Required
- **Request Body**:

  ```typescript
  {
    exceptCurrent?: boolean; // If true, keeps the current session active
  }
  ```

- **Response**:

  ```typescript
  {
    success: true;
  }
  ```

- **Status Codes**:
  - `200 OK`: Sessions revoked successfully
  - `401 Unauthorized`: Not authenticated

### Account Management Endpoints

#### List Linked Accounts

- **URL**: `/api/auth/accounts`
- **Method**: `GET`
- **Authentication**: Required
- **Response**:

  ```typescript
  {
    accounts: [{
      id: string;
      provider: string;
      providerAccountId: string;
      userId: string;
      createdAt: string;
      updatedAt: string;
    }];
  }
  ```

- **Status Codes**:
  - `200 OK`: Accounts retrieved successfully
  - `401 Unauthorized`: Not authenticated

#### Link Account

- **URL**: `/api/auth/accounts/:provider`
- **Method**: `GET`
- **Authentication**: Required
- **Response**: Redirects to OAuth provider authorization page
- **Status Codes**:
  - `302 Found`: Redirect to provider
  - `400 Bad Request`: Invalid provider
  - `401 Unauthorized`: Not authenticated

#### Unlink Account

- **URL**: `/api/auth/accounts/:provider`
- **Method**: `DELETE`
- **Authentication**: Required
- **Response**:

  ```typescript
  {
    success: true;
  }
  ```

- **Status Codes**:
  - `200 OK`: Account unlinked successfully
  - `400 Bad Request`: Cannot unlink last account
  - `401 Unauthorized`: Not authenticated
  - `404 Not Found`: Account not found

## Request and Response Objects

### Body Structure

All API endpoints accept and return JSON data. Request bodies should be properly formatted with the required fields for each endpoint.

```typescript
// Example request body for sign in
const requestBody = {
  provider: 'email-password',
  credentials: {
    email: 'user@example.com',
    password: 'password123',
  },
};

// Send the request
const response = await fetch('/api/auth/signin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(requestBody),
});

const data = await response.json();
```

### Headers

BetterAuth uses and respects the following HTTP headers:

- `Content-Type`: Should be set to `application/json` for request bodies
- `Authorization`: Bearer token authentication (if applicable)
- `X-CSRF-Token`: CSRF protection token (if applicable)
- `X-Requested-With`: Used for detecting AJAX requests

### Query Parameters

Some endpoints accept query parameters for filtering or pagination:

```typescript
// Example: List sessions with pagination
const response = await fetch('/api/auth/sessions?limit=10&offset=0', {
  credentials: 'include',
});

const data = await response.json();
```

### Response Structure

All API responses follow a consistent structure:

```typescript
// Success response
{
  // Data specific to the endpoint
  user?: { /* user data */ },
  session?: { /* session data */ },
  accounts?: [ /* accounts data */ ],
  
  // Generic success flag
  success?: boolean
}

// Error response
{
  error: {
    code: string;      // Error code, e.g., 'invalid_credentials'
    message: string;   // Human-readable error message
    status: number;    // HTTP status code
  }
}
```

## Error Handling

BetterAuth returns standardized error responses for all API endpoints:

```typescript
// Example error response
{
  error: {
    code: 'invalid_credentials',
    message: 'The email or password provided is incorrect',
    status: 401
  }
}
```

Common error codes:

- `invalid_request`: The request body is invalid or missing required fields
- `invalid_credentials`: The provided credentials are incorrect
- `user_not_found`: The specified user does not exist
- `email_not_verified`: The user's email address has not been verified
- `unauthorized`: The user is not authenticated
- `forbidden`: The user is authenticated but not authorized
- `not_found`: The requested resource does not exist
- `conflict`: The request conflicts with the current state (e.g., email already exists)
- `rate_limited`: The client has sent too many requests
- `internal_error`: An unexpected server error occurred

## Custom API Endpoints

You can create custom API endpoints that use BetterAuth's session validation:

```typescript
// In app/api/custom-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'better-auth/integrations/next';
import { authConfig } from '@/lib/auth/config';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authConfig);
  
  if (!session) {
    return NextResponse.json(
      {
        error: {
          code: 'unauthorized',
          message: 'You must be signed in to access this endpoint',
          status: 401
        }
      },
      { status: 401 }
    );
  }
  
  // Access user information
  const { user } = session;
  
  // Process the request
  return NextResponse.json({
    message: 'Custom endpoint accessed successfully',
    user: {
      id: user.id,
      email: user.email,
    },
  });
}
```

## Testing API Endpoints

You can test BetterAuth API endpoints using tools like Postman or simple fetch requests:

```typescript
// Example function to test the sign in endpoint
async function testSignIn() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'email-password',
        credentials: {
          email: 'test@example.com',
          password: 'password123',
        },
      }),
      credentials: 'include',
    });
    
    const data = await response.json();
    console.log('Sign in result:', data);
    return data;
  } catch (error) {
    console.error('Sign in failed:', error);
    throw error;
  }
}
```

## BetterAuth API Client

For frontend code, it's recommended to use the BetterAuth client methods instead of direct API calls:

```typescript
import { signIn, signOut, getSession } from '@/lib/auth/client';

// Use client methods
const result = await signIn('email-password', {
  email: 'user@example.com',
  password: 'password123',
});

// Instead of direct API calls
const response = await fetch('/api/auth/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'email-password',
    credentials: { email: 'user@example.com', password: 'password123' },
  }),
  credentials: 'include',
});
```

## Advanced API Configuration

You can customize the API endpoints behavior in your auth configuration:

```typescript
export const authConfig = {
  // Other config...
  
  api: {
    // Base path for auth API endpoints
    basePath: '/api/auth',
    
    // Custom bodyParser options
    bodyParser: {
      sizeLimit: '1mb',
    },
    
    // CORS configuration
    cors: {
      origin: ['https://trusted-site.com'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    },
    
    // Rate limiting
    rateLimit: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
    },
  },
};
```
