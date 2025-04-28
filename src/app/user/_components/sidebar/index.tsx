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
  SidebarMenuAction,
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
      url: '#/user/settings',
      icon: Settings2,
      items: [
        {
          title: 'Personal details',
          url: '#/user/settings/personal-details',
        },
        {
          title: 'Password and security',
          url: '#/user/settings/password-and-security',
        },
      ],
    },
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
            {data.navMain.map(item => (
              <Collapsible
                asChild
                key={item.title}
                open={
                  path === item.url ||
                  item.items?.some(subItem => path === subItem.url)
                }
              >
                <SidebarMenuItem>
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
                  {item.items?.length ? (
                    <>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuAction className="data-[state=open]:rotate-90 text-muted-foreground">
                          <ChevronRight />
                          <span className="sr-only">Toggle</span>
                        </SidebarMenuAction>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
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
                  ) : null}
                </SidebarMenuItem>
              </Collapsible>
            ))}
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
