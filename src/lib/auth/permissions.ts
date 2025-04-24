import { createAccessControl } from 'better-auth/plugins/access';
import {
  adminAc,
  defaultStatements,
  userAc,
} from 'better-auth/plugins/admin/access';

// Combine the default statements with any custom resources/actions
const statement = {
  ...defaultStatements,
  // Add any custom resources and actions here
  // For example:
  project: ['create', 'share', 'update', 'delete'],
} as const;

// Create access controller
export const ac = createAccessControl(statement);

// Define role permissions
export const admin = ac.newRole({
  /* project: ['create', 'update', 'delete'],
  user: ['ban', 'delete', 'list', 'impersonate', 'set-password', 'set-role'], */
  ...adminAc.statements, // Include all default admin permissions
});

export const user = ac.newRole({
  ...userAc.statements,
  // Regular users have no admin permissions by default
});

// You can define additional custom roles if needed
// export const manager = ac.newRole({
//   user: ['list'], // Can list users
//   project: ['create', 'view', 'update'], // Can manage projects
// });
