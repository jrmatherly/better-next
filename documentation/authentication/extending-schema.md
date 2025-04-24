# Extending BetterAuth Schema

This document explains how to properly extend BetterAuth's database schema to include custom fields like roles, groups, and impersonation support.

## Overview

BetterAuth provides a built-in mechanism to extend its core schemas without manually modifying the Prisma schema files. This approach ensures:

1. Type safety through TypeScript
2. Consistency between your database and code
3. Proper migrations when your schema changes
4. Compatibility with BetterAuth's tooling and plugins

## Extending the User Schema

### The Proper Approach

To extend the User schema with additional fields like roles, you should use the `additionalFields` configuration in your BetterAuth setup:

```typescript
// src/lib/auth/config.ts
import { BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from '@better-auth/prisma-adapter';

export const authConfig: BetterAuthOptions = {
  // Other configuration...
  
  // Define additional fields for the User model
  user: {
    additionalFields: {
      // String array for roles
      roles: {
        type: "string[]",
        required: false,
        defaultValue: ["user"],
        input: false, // Admin-only field, not user settable
      },
      // For impersonation support
      originalRoles: {
        type: "string[]",
        required: false,
        input: false,
      },
      isImpersonating: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      // For Azure AD groups
      groups: {
        type: "string[]",
        required: false,
        input: false,
      }
    },
  },
  
  // Other configuration...
};
```

### Field Configuration Options

Each field in `additionalFields` can have the following options:

| Option | Description | Default |
|--------|-------------|---------|
| `type` | The data type of the field (see supported types below) | Required |
| `required` | Whether the field is required | `false` |
| `defaultValue` | Default value if not provided | `undefined` |
| `input` | Whether users can directly set this field during sign-up/update | `true` |
| `validator` | Custom validation function | `undefined` |

### Supported Data Types

BetterAuth supports the following data types for additional fields:

| Type | Description | Prisma Type |
|------|-------------|-------------|
| `"string"` | Simple text | `String` |
| `"string[]"` | Array of strings | `String[]` |
| `"number"` | Numeric value | `Int` |
| `"number[]"` | Array of numbers | `Int[]` |
| `"boolean"` | True/false value | `Boolean` |
| `"date"` | Date and time | `DateTime` |
| `"json"` | JSON object | `Json` |

## Generating the Schema

After configuring your additional fields, you need to generate the schema using BetterAuth's CLI:

```bash
npx @better-auth/cli generate --config src/lib/auth/server.ts
```

This command:

1. Looks at your BetterAuth configuration (including `additionalFields`)
2. Generates the appropriate Prisma schema with your extensions
3. Respects your existing database adapter (PostgreSQL, SQLite, etc.)

## Migrations

When you change your schema extensions, you will need to run a migration to update your database:

```bash
npx @better-auth/cli migrate
```

This ensures your database structure stays in sync with your application requirements.

## Type Safety

BetterAuth automatically generates TypeScript types for your extended schema, so you get full type safety when accessing these additional fields:

```typescript
// Your User type will include the additional fields
const user = await auth.api.getUser(userId);
const roles = user.roles; // TypeScript knows this is string[]
const isImpersonating = user.isImpersonating; // TypeScript knows this is boolean
```

## Centralizing Type Definitions

To maintain consistency between your schema extensions and your TypeScript types, we use dedicated files for constants and type declarations:

```typescript
// src/types/roles.ts - Contains the ROLES constant and Role type
export const ROLES = {
  ADMIN: 'admin',
  SECURITY: 'security',
  DEVOPS: 'devops',
  DBA: 'dba',
  COLLAB: 'collab',
  TCC: 'tcc',
  FIELDTECH: 'fieldtech', 
  USER: 'user',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
```

```typescript
// src/types/auth.d.ts - Contains type augmentations and declarations
import { auth } from "@/lib/auth/server";
import type { Role } from "@/types/roles";
import type { ReactNode } from "react";

// Re-export the Role type for convenience
export type { Role };

// Augment BetterAuth's User interface
declare module '@/lib/auth/server' {
  interface User {
    roles?: Role[];
    originalRoles?: Role[];
    isImpersonating?: boolean;
    groups?: string[];
  }
}
```

## Accessing Extended Fields

Once the schema is generated and applied to your database, you can access the additional fields in your code:

### Server-Side Access

```typescript
// In server components or API routes
import { getServerSession } from '@/lib/auth/session';
import { ROLES } from '@/types/roles';

export async function AdminComponent() {
  const session = await getServerSession();
  
  if (!session?.user?.roles?.includes(ROLES.ADMIN)) {
    return <div>Unauthorized</div>;
  }
  
  return <div>Admin content</div>;
}
```

### Client-Side Access

```typescript
// In client components
import { useSession } from '@/lib/auth/client';
import { ROLES, type Role } from '@/types/roles';

export function RoleBasedComponent() {
  const { data: session } = useSession();
  const roles = session?.user?.roles || [];
  
  const isAdmin = roles.includes(ROLES.ADMIN);
  
  return (
    <div>
      {isAdmin ? (
        <div>Admin content</div>
      ) : (
        <div>Regular user content</div>
      )}
    </div>
  );
}
```

## Common Pitfalls to Avoid

1. **Manually Editing Prisma Schema**: Never manually edit the generated Prisma schema files. These will be overwritten when you run the generate command.

2. **Mismatched Types**: Ensure your TypeScript definitions match your schema extensions. For example, if `roles` is defined as `string[]` in your schema, it should be the same in your TypeScript types.

3. **Not Running Generate After Changes**: Always run the generate command after changing your schema configuration.

4. **Not Running Migrations in Production**: Remember to run migrations in your production environment when deploying schema changes.

## Best Practices

1. **Start Simple**: Begin with the minimum fields you need and add more as required.

2. **Use Default Values**: Provide sensible defaults for new fields to handle existing users.

3. **Restrict Input**: Use `input: false` for sensitive fields that should only be modified by administrators.

4. **Validate Data**: Add validators for fields with specific requirements.

5. **Document Your Schema**: Keep documentation of your schema extensions updated.

## Conclusion

By following this approach to extend the BetterAuth schema, you ensure a maintainable, type-safe, and consistent experience across your application. The automatic generation of database schemas and TypeScript types saves development time and reduces the risk of errors.
