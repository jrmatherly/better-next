'use client';

import {
  ChevronRight,
  Command,
  LifeBuoy,
  Settings2,
  SquareTerminal,
} from 'lucide-react';
import * as React from 'react';

import { NavUser } from '@/app/user/_components/sidebar/nav-user';
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { APP_NAME } from '@/lib/settings';
import type { BetterAuthSession } from '@/types/auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const data = {
  navMain: [
    {
      title: 'Profile',
      url: '/user/profile',
      icon: SquareTerminal,
    },
    {
      title: 'Settings',
      url: '#/',
      icon: Settings2,
      items: [
        {
          title: 'API Keys',
          url: '/user/settings/api-keys',
        },
      ],
    },
    /* {
      title: 'NEW LINK HERE',
      url: '/url-here',
      icon: SquareTerminal,
    }, */
    /* {
      title: 'NEW NESTED DROPDOWN HEERE',
      url: '#/',
      icon: Settings2,
      items: [
        {
          title: 'LINK1',
          url: '/url-here',
        },
        {
          title: 'LINK2',
          url: '/url-here',
        },
      ],
    }, */
  ],
  navSecondary: [
    {
      title: 'Support',
      url: '#',
      icon: LifeBuoy,
    },
  ],
};
interface UserSidebarProps extends React.ComponentProps<typeof Sidebar> {
  session: BetterAuthSession | null;
}
export function UserSidebar({ session, ...props }: UserSidebarProps) {
  const path = usePathname();
  if (!session) return <div>Loading...</div>;
  return (
    <Sidebar
      variant="sidebar"
      className="border-r border-border bg-sidebar"
      {...props}
    >
      <SidebarHeader className="border-b border-border pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-foreground">
                    {APP_NAME}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
            Platform
          </SidebarGroupLabel>
          <SidebarMenu>
            {data.navMain.map(item => {
              // Check if this is a dropdown parent (has items)
              const hasDropdown = Boolean(item.items && item.items.length > 0);

              return (
                <Collapsible
                  key={item.title}
                  defaultOpen={item.items?.some(
                    subItem => path === subItem.url
                  )}
                  className="w-full"
                >
                  <SidebarMenuItem className="w-full">
                    {hasDropdown ? (
                      <>
                        <CollapsibleTrigger asChild className="w-full">
                          <SidebarMenuButton
                            tooltip={item.title}
                            isActive={item.items?.some(
                              subItem => path === subItem.url
                            )}
                            className="text-foreground/80 hover:text-foreground w-full justify-between group"
                          >
                            <div className="flex items-center">
                              <item.icon className="opacity-80" />
                              <span>{item.title}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="w-full">
                          <SidebarMenuSub>
                            {item.items?.map(subItem => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={path === subItem.url}
                                  className="text-foreground/80 hover:text-foreground"
                                >
                                  <Link href={subItem.url}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        isActive={path === item.url}
                        className="text-foreground/80 hover:text-foreground"
                      >
                        <Link href={item.url}>
                          <item.icon className="opacity-80" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
            Support
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navSecondary.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    size="sm"
                    isActive={path === item.url}
                    className="text-foreground/80 hover:text-foreground"
                  >
                    <Link href={item.url}>
                      <item.icon className="opacity-80" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser session={session} />
      </SidebarFooter>
    </Sidebar>
  );
}
