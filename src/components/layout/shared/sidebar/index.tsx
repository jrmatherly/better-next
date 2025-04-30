'use client';

import { ChevronRight, Command } from 'lucide-react';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { useNavigation } from '@/components/layout/shared/nav-data';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { APP_NAME } from '@/lib/settings';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import type { BetterAuthSession } from '@/types/auth';
import type { NavItemType } from '@/types/navigation';
import Link from 'next/link';
import { NavUser } from './nav-user';

interface SharedSidebarProps extends React.ComponentProps<typeof Sidebar> {
  /** User session data */
  session: BetterAuthSession | null;
}

/**
 * Shared sidebar component used by both admin and user sections
 * Displays navigation based on user role permissions
 */
export function SharedSidebar({ session, ...props }: SharedSidebarProps) {
  const path = usePathname();
  const { navMain, navSecondary } = useNavigation();
  const [navigationType, setNavigationType] = React.useState<
    'server' | 'client'
  >('server');
  const auth = useAuth();

  // Prioritize server-provided session data on initial render
  React.useEffect(() => {
    // Immediately after hydration, switch to client-side state
    const timer = setTimeout(() => {
      setNavigationType('client');
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Loading states with better fallback
  const fallbackItems: NavItemType[] = React.useMemo(
    () =>
      session?.user?.role === 'admin'
        ? [
            {
              title: 'Dashboard',
              url: '/dashboard',
              icon: Command,
            },
          ]
        : [],
    [session?.user?.role]
  );

  const mainItems = navMain.length > 0 ? navMain : fallbackItems;

  // Show immediate navigation feedback
  if (
    (!session && auth.isLoading) ||
    (mainItems.length === 0 && auth.isAuthenticated)
  ) {
    return (
      <Sidebar
        variant="sidebar"
        className="border-r border-border bg-sidebar"
        {...props}
      >
        <SidebarHeader className="border-b border-border pb-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="text-sm text-muted-foreground">
                    {APP_NAME}
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/dashboard" prefetch={false}>
                  <SidebarMenuButton
                    className={cn(
                      '/dashboard' === path &&
                        'text-primary-foreground bg-primary'
                    )}
                  >
                    <div className="flex items-center">
                      <Command className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser
            session={
              session ||
              (auth.user ? ({ user: auth.user } as BetterAuthSession) : null)
            }
          />
        </SidebarFooter>
      </Sidebar>
    );
  }

  // If we have no session data from either source, show loading
  if (!session && !auth.user) return <div>Loading...</div>;

  return (
    <Sidebar
      variant="sidebar"
      className="border-r border-border bg-sidebar"
      {...props}
    >
      <SidebarHeader className="border-b border-border pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <Command className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="text-sm text-muted-foreground">
                  {APP_NAME}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          {mainItems.map((item: NavItemType) => (
            <SidebarMenu key={item.title}>
              {/* Root menu item (or collapsible trigger for dropdown menus) */}
              {item.items && item.items.length > 0 ? (
                <Collapsible className="group">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="w-full justify-between">
                        <div className="flex items-center">
                          <item.icon className="mr-2 h-4 w-4" />
                          <span>{item.title}</span>
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    {/* Dropdown menu items */}
                    {item.items.map(
                      (subItem: Omit<NavItemType, 'icon' | 'items'>) => (
                        <SidebarMenuItem key={subItem.title}>
                          <Link href={subItem.url} prefetch={false}>
                            <SidebarMenuButton
                              className={cn(
                                'pl-10',
                                subItem.url === path &&
                                  'text-primary-foreground bg-primary'
                              )}
                            >
                              {subItem.title}
                            </SidebarMenuButton>
                          </Link>
                        </SidebarMenuItem>
                      )
                    )}
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                // Single menu item with direct link
                <SidebarMenuItem>
                  <Link href={item.url} prefetch={false}>
                    <SidebarMenuButton
                      className={cn(
                        item.url === path &&
                          'text-primary-foreground bg-primary'
                      )}
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.title}</span>
                      </div>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          ))}
        </SidebarGroup>

        {/* Secondary navigation (support links, etc.) */}
        {navSecondary.length > 0 && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupLabel>Support</SidebarGroupLabel>
            <SidebarGroupContent>
              {navSecondary.map((item: NavItemType) => (
                <SidebarMenu key={item.title}>
                  <SidebarMenuItem>
                    <Link href={item.url} prefetch={false}>
                      <SidebarMenuButton
                        className={cn(
                          item.url === path &&
                            'text-primary-foreground bg-primary'
                        )}
                      >
                        <div className="flex items-center">
                          <item.icon className="mr-2 h-4 w-4" />
                          <span>{item.title}</span>
                        </div>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                </SidebarMenu>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser session={session} />
      </SidebarFooter>
    </Sidebar>
  );
}
