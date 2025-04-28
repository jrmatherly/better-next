import BreadcrumbDasboard from '@/app/user/_components/breadcrumb';
import { UserSidebar } from '@/app/user/_components/sidebar';
import { ModeToggle } from '@/components/theme-toggle';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { auth } from '@/lib/auth/server';
import type { BetterAuthSession } from '@/types/auth.d';
import { headers } from 'next/headers';
import React from 'react';

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return (
    <SidebarProvider>
      <UserSidebar session={session as BetterAuthSession} />
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
