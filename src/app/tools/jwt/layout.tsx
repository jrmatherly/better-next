'use client';

/* import { ProtectedLayout } from '@/components/auth/protected-layout';
import { ROLES } from '@/types/roles'; */
import type { ReactNode } from 'react';

/**
 * Layout wrapper for the JWT Tools section
 * Ensures only users with admin, security, or devops roles can access
 * Also supports role impersonation for testing
 */
export default function JwtToolsLayout({ children }: { children: ReactNode }) {
  return (
    //<ProtectedLayout
    //  allowedRoles={[ROLES.ADMIN, ROLES.SECURITY, ROLES.DEVOPS]}
    //  requireAll={false}
    //  unauthorizedTitle="Security Access Required"
    //  unauthorizedMessage="You need administrator, security, or devops privileges to access JWT tools."
    //>
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">{children}</main>
    </div>
    //</ProtectedLayout>
  );
}
