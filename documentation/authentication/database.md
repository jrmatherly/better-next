# Database Integration

This document covers how BetterAuth integrates with databases for storing user information, sessions, and other authentication-related data.

## Supported Database Adapters

BetterAuth supports multiple database adapters:

- **Prisma** - For SQL databases (PostgreSQL, MySQL, SQLite)
- **MongoDB** - For MongoDB databases
- **Custom Adapters** - For other database systems

## Prisma Adapter

The Prisma adapter is the most commonly used adapter for SQL databases.

### Prisma Configuration

```typescript
import { PrismaClient } from '@prisma/client';
import type { BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

const prisma = new PrismaClient();

export const authConfig = {
  // Other config...
  
  database: prismaAdapter(prisma, {
    provider: 'postgresql', // or 'mysql', 'sqlite'
  }),
} satisfies BetterAuthOptions;
```

### Required Schema

The Prisma adapter requires a specific schema structure. Here's a basic schema for BetterAuth:

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql" // or "mysql", "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  password      String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Custom fields
  roles         String[]  @default(["user"])
  
  // Relations
  accounts      Account[]
  sessions      Session[]
}

model Account {
  id                String   @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?  @db.Text
  access_token      String?  @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?  @db.Text
  session_state     String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  // Optional: additional session data
  ip           String?
  userAgent    String?
  lastActive   DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  createdAt  DateTime @default(now())

  @@unique([identifier, token])
}
```

### Generating the Schema

You can use the BetterAuth CLI to generate the schema:

```bash
npx @better-auth/cli generate --adapter prisma
```

## Extending the Core Schema

You can extend the default schema with custom fields:

### Custom User Fields

```prisma
// In your schema.prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  password      String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Custom fields
  roles         String[]  @default(["user"])
  phoneNumber   String?
  lastLogin     DateTime?
  isActive      Boolean   @default(true)
  companyId     String?
  preferences   Json?
  
  // Relations
  accounts      Account[]
  sessions      Session[]
}
```

### Accessing Custom Fields

```typescript
// Server-side
import { getServerSession } from 'better-auth/integrations/next';
import { authConfig } from '@/lib/auth/config';

export async function getUserWithCustomFields() {
  const session = await getServerSession(authConfig);
  if (!session) return null;
  
  // Access custom fields through session
  return {
    id: session.user.id,
    name: session.user.name,
    roles: session.user.roles,
    phoneNumber: session.user.phoneNumber,
    lastLogin: session.user.lastLogin,
    // Other custom fields
  };
}
```

## MapProfileToUser Hook

The `mapProfileToUser` hook allows you to customize how user profiles from OAuth providers are mapped to your user model:

```typescript
export const authConfig = {
  // Other config...
  
  callbacks: {
    async mapProfileToUser({ profile, provider, account }) {
      // Basic field mapping
      const user = {
        email: profile.email,
        name: profile.name,
        image: profile.picture || profile.avatar_url,
      };
      
      // Provider-specific mapping logic
      if (provider === 'microsoft') {
        // Extract additional information from Microsoft profile
        return {
          ...user,
          roles: ['user'],
          companyId: profile.organization?.id,
          department: profile.jobTitle,
        };
      }
      
      // Default mapping
      return {
        ...user,
        roles: ['user'],
      };
    },
  },
};
```

## Database Transactions

BetterAuth supports database transactions for operations that modify multiple records:

```typescript
// In your auth config
export const authConfig = {
  // Other config...
  
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
    
    // Enable transactions
    useTransactions: true,
    
    // Custom transaction function
    transaction: async (callback) => {
      return prisma.$transaction(async (tx) => {
        return callback(tx);
      });
    },
  }),
};
```

## Performance Optimization

### Indexing

Ensure your database has proper indexes for frequently queried fields:

```prisma
model User {
  id            String    @id @default(cuid())
  email         String?   @unique
  // Other fields
  
  @@index([email])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  
  @@index([userId])
  @@index([expires])
}
```

### Connection Pooling

For production environments, enable connection pooling:

```typescript
// In your Prisma client setup
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pooling configuration
  connection: {
    pool: {
      min: 2,
      max: 10,
      idle: 10000, // 10 seconds idle timeout
    },
  },
});
```

### Query Optimization

BetterAuth optimizes database queries by:

1. Selecting only needed fields
2. Using efficient query patterns
3. Leveraging database indexes
4. Implementing connection pooling
5. Using prepared statements

## Migration Strategies

When migrating from another authentication system to BetterAuth:

### 1. Schema Migration

Create a migration script to transform your existing schema to match BetterAuth's requirements:

```typescript
// Example migration script
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function migrateUsers() {
  // Get users from old schema
  const oldUsers = await prisma.$queryRaw`SELECT * FROM old_users`;
  
  // Migrate each user
  for (const oldUser of oldUsers) {
    await prisma.user.create({
      data: {
        id: oldUser.id || undefined,
        email: oldUser.email,
        name: oldUser.name,
        emailVerified: oldUser.email_verified ? new Date(oldUser.email_verified) : null,
        password: oldUser.password_hash ? await hash(oldUser.password_plaintext, 10) : null,
        roles: oldUser.roles || ['user'],
        createdAt: new Date(oldUser.created_at),
        updatedAt: new Date(),
      },
    });
  }
  
  console.log('Users migrated successfully');
}

migrateUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### 2. Password Migration

If you need to migrate passwords with different hashing algorithms:

```typescript
// In your auth config
export const authConfig = {
  // Other config...
  
  emailAndPassword: {
    enabled: true,
    // Custom password verification for legacy passwords
    async verify(credentials, storedPassword) {
      if (storedPassword.startsWith('legacy:')) {
        // Handle legacy password format
        const actualHash = storedPassword.replace('legacy:', '');
        const isValid = verifyLegacyPassword(credentials.password, actualHash);
        
        if (isValid) {
          // Migrate to new password format
          const newHash = await hash(credentials.password, 10);
          await prisma.user.update({
            where: { email: credentials.email },
            data: { password: newHash },
          });
        }
        
        return isValid;
      }
      
      // Default BetterAuth password verification
      return defaultVerify(credentials, storedPassword);
    },
  },
};
```

## Multi-Tenant Database Configuration

For applications supporting multiple tenants:

```typescript
import { PrismaClient } from '@prisma/client';
import { prismaAdapter } from 'better-auth/adapters/prisma';

// Create dynamic Prisma client factory
function createTenantPrismaClient(tenantId: string) {
  return new PrismaClient({
    datasources: {
      db: {
        url: `${process.env.DATABASE_URL_BASE}${tenantId}`,
      },
    },
  });
}

// Create auth config factory
export function createAuthConfig(tenantId: string) {
  const prisma = createTenantPrismaClient(tenantId);
  
  return {
    appName: `${process.env.APP_NAME} - ${tenantId}`,
    baseURL: `${process.env.BASE_URL}/${tenantId}`,
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),
    // Other config...
  };
}
```

## Database Monitoring and Maintenance

### Monitoring Queries

```typescript
const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
  ],
});

prisma.$on('query', (e) => {
  console.log('Query:', e.query);
  console.log('Duration:', e.duration, 'ms');
});
```

### Database Backup Strategy

```bash
# Example script for automated PostgreSQL backups
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d%H%M%S")
BACKUP_DIR="/path/to/backups"
DB_NAME="your_db_name"

# Create backup
pg_dump -Fc $DB_NAME > $BACKUP_DIR/$DB_NAME-$TIMESTAMP.dump

# Retain only the last 7 backups
ls -tp $BACKUP_DIR/$DB_NAME-*.dump | grep -v '/$' | tail -n +8 | xargs -I {} rm -- {}
```

## Troubleshooting Database Issues

### Common Issues and Solutions

1. **Connection Pool Exhaustion**
   - Symptoms: Timeout errors, slow responses
   - Solution: Increase pool size, optimize query patterns, add connection timeouts

2. **Slow Queries**
   - Symptoms: High latency, timeouts
   - Solution: Add indexes, optimize queries, use efficient query patterns

3. **Data Integrity Issues**
   - Symptoms: Inconsistent user data, authentication failures
   - Solution: Use transactions, implement data validation, run database validation scripts

### Diagnostic Queries

```sql
-- Check for long-running sessions
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE pg_stat_activity.query != '<IDLE>'
ORDER BY duration DESC;

-- Find missing indexes
SELECT relname, seq_scan, idx_scan
FROM pg_stat_user_tables
ORDER BY seq_scan DESC;
