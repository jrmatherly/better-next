'use client';

import { ProtectedLayout } from '@/components/auth/protected-layout';
import { ROLES } from '@/types/roles';
import type { ReactNode } from 'react';

/**
 * Layout wrapper for the admin section that ensures only users
 * with admin role can access these pages
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedLayout
      allowedRoles={[ROLES.ADMIN]}
      unauthorizedTitle="Admin Access Required"
      unauthorizedMessage="You need administrator privileges to access the admin dashboard."
    >
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">{children}</main>
      </div>
    </ProtectedLayout>
  );
}
