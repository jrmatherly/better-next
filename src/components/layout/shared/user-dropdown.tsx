'use client';

import LogoutButton from '@/components/auth/logout-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { BetterAuthSession } from '@/types/auth';
import { LayoutDashboard, LogOut, UserIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface UserDropdownProps {
  /** User session data */
  session: BetterAuthSession;
}

/**
 * Client component for the user dropdown menu
 * Conditionally renders dashboard link based on current path
 */
export default function UserDropdown({ session }: UserDropdownProps) {
  const pathname = usePathname();

  // Only show dashboard link when on the root path
  const isOnHomePage = pathname === '/';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-10 w-10 cursor-pointer rounded-full">
          <AvatarImage
            src={session.user.image || ''}
            alt={session.user.name || 'User'}
          />
          <AvatarFallback className="rounded-full">
            {session.user.name
              ? session.user.name.slice(0, 2).toUpperCase()
              : 'U'}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage
                src={session.user.image || ''}
                alt={session.user.name || 'User'}
              />
              <AvatarFallback className="rounded-lg">
                {session.user.name
                  ? session.user.name.slice(0, 2).toUpperCase()
                  : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {session.user.name || 'User'}
              </span>
              <span className="truncate text-xs">
                {session.user.email || ''}
              </span>
              <span className="truncate text-xs bg-green-600 text-white px-2 py-0.5 rounded-full w-fit flex items-center gap-1 mt-0.5">
                {session.user.role || ''}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {/* Only show dashboard link when not already on dashboard pages */}
          {isOnHomePage && (
            <Link href="/dashboard">
              <DropdownMenuItem>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </DropdownMenuItem>
            </Link>
          )}
          <Link href="/user/profile">
            <DropdownMenuItem>
              <UserIcon className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <LogoutButton>
          <DropdownMenuItem>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </LogoutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
