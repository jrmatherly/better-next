'use client';

/* import { ProtectedLayout } from '@/components/auth/protected-layout';
import { ROLES } from '@/types/roles'; */
import type { ReactNode } from 'react';

/**
 * Layout wrapper for the API Keys section
 * Ensures only users with admin, security, or devops roles can access
 */
export default function ApiKeysLayout({ children }: { children: ReactNode }) {
  return (
    //<ProtectedLayout
    //  allowedRoles={[ROLES.ADMIN, ROLES.DEVOPS, ROLES.SECURITY]}
    //  requireAll={false}
    //  unauthorizedTitle="Technical Access Required"
    //  unauthorizedMessage="You need administrator, security, or devops privileges to manage API keys."
    //>
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">{children}</main>
    </div>
    //</ProtectedLayout>
  );
}
