'use client';

import { ChevronsUpDown, Key, LogOut, User } from 'lucide-react';
import Link from 'next/link';

import LogoutButton from '@/components/auth/logout-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import type { Session } from '@/types/auth';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import * as React from 'react';

interface NavUserProps {
  /** User session data */
  session: Session | null;
}

/**
 * User navigation component used in sidebar footer
 * Displays user profile and logout options
 */
export function NavUser({ session }: NavUserProps) {
  const { isMobile } = useSidebar();

  if (!session) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-accent border-t border-border py-3"
            >
              <Avatar className="h-8 w-8 rounded-lg border border-border/50 bg-muted">
                <AvatarImage
                  src={session.user.image || ''}
                  alt={session.user.name || 'User'}
                />
                <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                  {session.user.name
                    ? session.user.name.slice(0, 2).toUpperCase()
                    : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-foreground">
                  {session.user.name || 'User'}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg border-border bg-card/95 backdrop-blur-sm"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 p-3 text-left text-sm">
                <Avatar className="h-10 w-10 rounded-lg border border-border/50 bg-muted">
                  <AvatarImage
                    src={session.user.image || ''}
                    alt={session.user.name || 'User'}
                  />
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                    {session.user.name
                      ? session.user.name.slice(0, 2).toUpperCase()
                      : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight gap-0.5">
                  <span className="truncate font-semibold text-foreground">
                    {session.user.name || 'User'}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {session.user.email}
                  </span>
                  <span className="truncate text-xs bg-green-600 text-white px-2 py-0.5 rounded-full w-fit flex items-center gap-1 mt-0.5">
                    {session.user.role}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />

            {/* User Settings Menu Items */}
            <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              User Settings
            </DropdownMenuLabel>

            <Link href="/user/profile">
              <DropdownMenuItem className="text-foreground hover:text-foreground focus:text-foreground hover:bg-accent focus:bg-accent">
                <User className="mr-2 size-4 text-muted-foreground" />
                Profile
              </DropdownMenuItem>
            </Link>

            <Link href="/user/settings/api-keys">
              <DropdownMenuItem className="text-foreground hover:text-foreground focus:text-foreground hover:bg-accent focus:bg-accent">
                <Key className="mr-2 size-4 text-muted-foreground" />
                API Keys
              </DropdownMenuItem>
            </Link>

            <DropdownMenuSeparator className="bg-border/50" />
            <LogoutButton>
              <DropdownMenuItem className="text-foreground hover:text-foreground focus:text-foreground hover:bg-accent focus:bg-accent">
                <LogOut className="mr-2 size-4 text-muted-foreground" />
                <span>Logout</span>
              </DropdownMenuItem>
            </LogoutButton>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
