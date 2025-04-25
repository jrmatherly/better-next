import { withAdminProtection } from '@/lib/auth/protect-server';
import type { ReactNode } from 'react';

/**
 * Layout wrapper for the admin section that ensures only users
 * with admin role can access these pages
 */
function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">{children}</main>
    </div>
  );
}

// Apply admin-only protection to the layout
export default withAdminProtection(AdminLayout, {
  redirectTo: '/unauthorized',
  fallbackMessage: "You need administrator privileges to access the admin dashboard."
});
