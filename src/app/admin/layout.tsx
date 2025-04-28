import BreadcrumbDasboard from '@/app/admin/_components/breadcrumb';
import { AdminSidebar } from '@/app/admin/_components/sidebar';
import { ModeToggle } from '@/components/theme-toggle';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { getServerSession } from '@/lib/auth/guards';
import type { BetterAuthSession } from '@/types/auth.d';

import { withAdminProtection } from '@/lib/auth/protect-server';
import type { ReactNode } from 'react';

/**
 * Layout wrapper for the admin section that ensures only users
 * with admin role can access these pages
 */
function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebarWrapper />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 w-full shrink-0 items-center justify-between gap-2 border-b border-border bg-background/80 backdrop-blur-sm px-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-5 bg-border/50" />
            <BreadcrumbDasboard />
          </div>
          <div className="flex items-center gap-3">
            <ModeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

/**
 * Wrapper component to fetch session and pass it to UserSidebar
 * This allows us to handle async operations separately from the main layout
 */
async function AdminSidebarWrapper() {
  // Get the user's session
  const session = await getServerSession();
  return <AdminSidebar session={session as BetterAuthSession} />;
}

// Apply admin-only protection to the layout
export default withAdminProtection(AdminLayout, {
  redirectTo: '/unauthorized',
  fallbackMessage:
    'You need administrator privileges to access the admin dashboard.',
});
