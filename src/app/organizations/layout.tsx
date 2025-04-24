'use client';

import { ProtectedLayout } from '@/components/auth/protected-layout';
import type { ReactNode } from 'react';

/**
 * Layout wrapper for the Organizations section
 * All authenticated users can access organizations, but they will
 * have different capabilities based on their roles within each organization
 */
export default function OrganizationsLayout({
  children,
}: { children: ReactNode }) {
  return (
    <ProtectedLayout
      allowedRoles={[]} // Empty array means any authenticated user can access
      unauthorizedTitle="Authentication Required"
      unauthorizedMessage="You need to be logged in to access and manage organizations."
    >
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">{children}</main>
      </div>
    </ProtectedLayout>
  );
}
