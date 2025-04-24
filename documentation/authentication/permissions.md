# Permissions

By default, there are two resources with up to six permissions.

user: create list set-role ban impersonate delete set-password

session: list revoke delete

Users with the admin role have full control over all the resources and actions. Users with the user role have no control over any of those actions.

Custom Permissions
The plugin provides an easy way to define your own set of permissions for each role.

Create Access Control
You first need to create an access controller by calling the createAccessControl function and passing the statement object. The statement object should have the resource name as the key and the array of actions as the value.

permissions.ts

import { createAccessControl } from "better-auth/plugins/access";

/**

* make sure to use `as const` so typescript can infer the type correctly
 */
const statement = {
    project: ["create", "share", "update", "delete"],
} as const;

const ac = createAccessControl(statement);
Create Roles
Once you have created the access controller you can create roles with the permissions you have defined.

permissions.ts

import { createAccessControl } from "better-auth/plugins/access";

const statement = {
    project: ["create", "share", "update", "delete"],
} as const;

const ac = createAccessControl(statement);

const user = ac.newRole({
    project: ["create"],
});

const admin = ac.newRole({
    project: ["create", "update"],
});

const myCustomRole = ac.newRole({
    project: ["create", "update", "delete"],
    user: ["ban"],
});
When you create custom roles for existing roles, the predefined permissions for those roles will be overridden. To add the existing permissions to the custom role, you need to import defaultStatements and merge it with your new statement, plus merge the roles' permissions set with the default roles.

permissions.ts

import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

const statement = {
    ...defaultStatements,
    project: ["create", "share", "update", "delete"],
} as const;

const ac = createAccessControl(statement);

const admin = ac.newRole({
    project: ["create", "update"],
    ...adminAc.statements,
});
Pass Roles to the Plugin
Once you have created the roles you can pass them to the organization plugin both on the client and the server.

auth.ts

import { betterAuth } from "better-auth"
import { admin as adminPlugin } from "better-auth/plugins"
import { ac, admin, user } from "@/auth/permissions"

export const auth = betterAuth({
    plugins: [
        adminPlugin({
            ac,
            roles: {
                admin,
                user,
                myCustomRole
            }
        }),
    ],
});
You also need to pass the access controller and the roles to the client plugin.

auth-client.ts

import { createAuthClient } from "better-auth/client"
import { adminClient } from "better-auth/client/plugins"
import { ac, admin, user, myCustomRole } from "@/auth/permissions"

export const client = createAuthClient({
    plugins: [
        adminClient({
            ac,
            roles: {
                admin,
                user,
                myCustomRole
            }
        })
    ]
})
Access Control Usage
Has Permission:

To check a user's permissions, you can use the hasPermission function provided by the client.

auth-client.ts

const canCreateProject = await authClient.admin.hasPermission({
  permissions: {
    project: ["create"],
  },
});

// You can also check multiple resource permissions at the same time
const canCreateProjectAndCreateSale = await authClient.admin.hasPermission({
  permissions: {
    project: ["create"],
    sale: ["create"]
  },
});
If you want to check a user's permissions server-side, you can use the userHasPermission action provided by the api to check the user's permissions.

api.ts

import { auth } from "@/auth";
auth.api.userHasPermission({
  body: {
    userId: 'id', //the user id
    permissions: {
      project: ["create"], // This must match the structure in your access control
    },
  },
});

// You can also just pass the role directly
auth.api.userHasPermission({
  body: {
   role: "admin",
    permissions: {
      project: ["create"], // This must match the structure in your access control
    },
  },
});

// You can also check multiple resource permissions at the same time
auth.api.userHasPermission({
  body: {
   role: "admin",
    permissions: {
      project: ["create"], // This must match the structure in your access control
      sale: ["create"]
    },
  },
});
Check Role Permission:

Once you have defined the roles and permissions to avoid checking the permission from the server you can use the checkRolePermission function provided by the client.

auth-client.ts

const canCreateProject = client.admin.checkRolePermission({
  permissions: {
    user: ["delete"],
  },
  role: "admin",
});

// You can also check multiple resource permissions at the same time
const canCreateProjectAndRevokeSession = client.admin.checkRolePermission({
  permissions: {
    user: ["delete"],
    session: ["revoke"]
  },
  role: "admin",
});
Schema
This plugin adds the following fields to the user table:

Field Name Type Key Description
role string ? The user's role. Defaults to `user`. Admins will have the `admin` role.
banned boolean ? Indicates whether the user is banned.
banReason string ? The reason for the user's ban.
banExpires number ? The Unix timestamp when the user's ban will expire.
And adds one field in the session table:

Field Name Type Key Description
impersonatedBy string ? The ID of the admin that is impersonating this session.
Options
Default Role
The default role for a user. Defaults to user.

auth.ts

admin({
  defaultRole: "regular",
});
Admin Roles
The roles that are considered admin roles. Defaults to ["admin"].

auth.ts

admin({
  adminRoles: ["admin", "superadmin"],
});
Any role that isn't in the adminRoles list, even if they have the permission, will not be considered an admin.

Admin userIds
You can pass an array of userIds that should be considered as admin. Default to []

auth.ts

admin({
    adminUserIds: ["user_id_1", "user_id_2"]
})
If a user is in the adminUserIds list, they will be able to perform any admin operation.

impersonationSessionDuration
The duration of the impersonation session in seconds. Defaults to 1 hour.

auth.ts

admin({
  impersonationSessionDuration: 60 *60* 24, // 1 day
});
Default Ban Reason
The default ban reason for a user created by the admin. Defaults to No reason.

auth.ts

admin({
  defaultBanReason: "Spamming",
});
Default Ban Expires In
The default ban expires in for a user created by the admin in seconds. Defaults to undefined (meaning the ban never expires).

auth.ts

admin({
  defaultBanExpiresIn: 60 *60* 24, // 1 day
});
bannedUserMessage
The message to show when a banned user tries to sign in. Defaults to "You have been banned from this application. Please contact support if you believe this is an error."

auth.ts

admin({
  bannedUserMessage: "Custom banned user message",
});
