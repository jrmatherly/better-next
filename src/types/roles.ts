/**
 * Application roles based on Azure AD app roles
 */
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

/**
 * Role type derived from the ROLES constant
 */
export type Role = (typeof ROLES)[keyof typeof ROLES];
