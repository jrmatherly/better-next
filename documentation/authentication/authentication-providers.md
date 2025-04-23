# Authentication Providers

This document covers the different authentication providers available in BetterAuth, with a special focus on Microsoft authentication for enterprise environments.

## Available Authentication Providers

BetterAuth supports multiple authentication providers:

- Email and Password
- Microsoft (Azure AD)
- Google
- GitHub
- Twitter
- Facebook
- Apple
- Discord
- Twitch
- Spotify
- And more...

## Microsoft Authentication (Azure AD)

### Enterprise Microsoft Integration

For enterprise environments, Microsoft authentication with tenant ID is recommended. This approach allows for more precise control over who can sign in to your application.

### Configuration

Add Microsoft authentication to your BetterAuth configuration:

```typescript
// In your src/lib/auth/config.ts
import { PrismaClient } from '@prisma/client';
import type { BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

const prisma = new PrismaClient();

export const authConfig = {
  // Other configurations...
  
  microsoft: {
    enabled: true,
    clientId: process.env.MICROSOFT_CLIENT_ID!,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
    tenantId: process.env.MICROSOFT_TENANT_ID!, // Enterprise tenant ID
    authorization: {
      params: {
        // Customize permission scopes as needed
        scope: 'openid profile email User.Read',
      },
    },
    // Optional: Override profile mapping
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
      };
    },
  },
} satisfies BetterAuthOptions;
```

### Environment Variables

Add these environment variables to your `.env` file:

```text
MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_CLIENT_SECRET=your-client-secret
MICROSOFT_TENANT_ID=your-tenant-id
```

### Creating an Azure AD Application

1. Log in to the [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" > "App registrations" > "New registration"
3. Enter a name for your application
4. Select "Accounts in this organizational directory only" for a single-tenant app
5. Set the Redirect URI to `https://your-domain.com/api/auth/callback/microsoft`
6. Register the application
7. Go to "Certificates & secrets" and create a new client secret
8. Note the Application (client) ID, Directory (tenant) ID, and client secret value

### Client-Side Implementation

#### Sign-In Button

```tsx
import { signIn } from '@/lib/auth/client';

export function MicrosoftSignInButton() {
  const handleSignIn = async () => {
    try {
      await signIn('microsoft');
      // Redirect happens automatically
    } catch (error) {
      console.error('Microsoft sign-in failed:', error);
    }
  };

  return (
    <button 
      onClick={handleSignIn}
      className="flex items-center justify-center gap-2 w-full p-2 border rounded-md"
    >
      <MicrosoftIcon />
      Sign in with Microsoft
    </button>
  );
}
```

### Server-Side Verification

To verify user authentication on the server side:

```typescript
import { getServerSession } from 'better-auth/integrations/next';
import { authConfig } from '@/lib/auth/config';

export async function getAuthenticatedUser(req, res) {
  const session = await getServerSession(req, res, authConfig);
  
  if (!session) {
    throw new Error('Not authenticated');
  }
  
  return session.user;
}
```

### Access Token Usage

If you need to use the Microsoft access token to call Microsoft Graph or other Microsoft APIs:

```typescript
// In your auth config
microsoft: {
  // Other config...
  
  // Store access token in session
  authorization: {
    params: {
      scope: 'openid profile email User.Read',
    },
    storeTokens: true, // Store access token in session
  },
}

// When using the token
import { getSession } from '@/lib/auth/client';

async function getMicrosoftData() {
  const session = await getSession();
  const accessToken = session?.user?.accounts?.microsoft?.access_token;
  
  if (!accessToken) {
    throw new Error('No Microsoft access token available');
  }
  
  const response = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  
  return response.json();
}
```

## Social Sign-Out

To sign out a user from both your app and the social provider:

### Client-Side Sign-Out

```tsx
import { signOut } from '@/lib/auth/client';

export function SignOutButton() {
  const handleSignOut = async () => {
    await signOut();
    // Optional: Redirect user after sign out
    window.location.href = '/';
  };

  return (
    <button 
      onClick={handleSignOut}
      className="p-2 text-red-500"
    >
      Sign out
    </button>
  );
}
```

### Advanced Sign-Out Options

You can customize the sign-out behavior with options:

```typescript
// Simple sign-out
await signOut();

// Sign-out with redirect
await signOut({ callbackUrl: '/login' });

// Sign-out from provider too (where supported)
await signOut({ signOutFromProvider: true });
```

## Multi-Provider Authentication

BetterAuth supports linking multiple authentication providers to a single account:

```tsx
import { linkSocial } from '@/lib/auth/client';

export function LinkMicrosoftAccountButton() {
  const handleLinkAccount = async () => {
    try {
      await linkSocial('microsoft');
      // Success notification
    } catch (error) {
      console.error('Failed to link Microsoft account:', error);
    }
  };

  return (
    <button onClick={handleLinkAccount}>
      Link Microsoft Account
    </button>
  );
}
```

## Account Management

List and manage connected social accounts:

```tsx
import { listAccounts } from '@/lib/auth/client';

export function ConnectedAccounts() {
  const [accounts, setAccounts] = useState([]);
  
  useEffect(() => {
    async function fetchAccounts() {
      const accountsList = await listAccounts();
      setAccounts(accountsList);
    }
    
    fetchAccounts();
  }, []);
  
  return (
    <div>
      <h2>Connected Accounts</h2>
      <ul>
        {accounts.map((account) => (
          <li key={account.id}>
            {account.provider} - {account.providerAccountId}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Error Handling for Social Authentication

Handle common authentication errors:

```tsx
import { signIn } from '@/lib/auth/client';

export function MicrosoftSignInWithErrorHandling() {
  const [error, setError] = useState(null);
  
  const handleSignIn = async () => {
    try {
      await signIn('microsoft');
    } catch (err) {
      // Handle specific error cases
      if (err.message.includes('access_denied')) {
        setError('You denied access to your Microsoft account');
      } else if (err.message.includes('invalid_tenant')) {
        setError('Your organization is not authorized to sign in');
      } else {
        setError('An error occurred during sign in. Please try again.');
        console.error(err);
      }
    }
  };
  
  return (
    <div>
      {error && <div className="text-red-500">{error}</div>}
      <button onClick={handleSignIn}>Sign in with Microsoft</button>
    </div>
  );
}
```
