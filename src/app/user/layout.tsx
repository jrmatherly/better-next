import BreadcrumbDasboard from '@/app/user/_components/breadcrumb';
import { UserSidebar } from '@/app/user/_components/sidebar';
import { ModeToggle } from '@/components/theme-toggle';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { withAuthProtection } from '@/lib/auth/protect-server';
import { getServerSession } from '@/lib/auth/guards';
import type { BetterAuthSession } from '@/types/auth.d';
import React from 'react';

/**
 * Layout wrapper for the user section that ensures only authenticated users can access these pages
 */
function UserLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider>
      <UserSidebarWrapper />
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
async function UserSidebarWrapper() {
  // Get the user's session
  const session = await getServerSession();
  return <UserSidebar session={session as BetterAuthSession} />;
}

// Apply authentication protection to the layout
export default withAuthProtection(UserLayout, {
  redirectTo: '/unauthorized',
  fallbackMessage: "You need to be logged in to access the user dashboard."
});