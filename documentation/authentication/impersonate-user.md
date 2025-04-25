# Impersonate User

This feature allows an admin to create a session that mimics the specified user. The session will remain active until either the browser session ends or it reaches 1 hour. You can change this duration by setting the impersonationSessionDuration option.

```typescript
// src/lib/auth/admin.ts
const impersonatedSession = await authClient.admin.impersonateUser({
  userId: "user_id_here",
});
```

## Stop Impersonating User

To stop impersonating a user and continue with the admin account, you can use stopImpersonating

```typescript
// src/lib/auth/admin.ts
await authClient.admin.stopImpersonating();
```

## impersonationSessionDuration

The duration of the impersonation session in seconds. Defaults to 1 hour.

```typescript
// src/lib/auth/server.ts
admin({
  impersonationSessionDuration: 60 * 60 * 24, // 1 day
});
```
