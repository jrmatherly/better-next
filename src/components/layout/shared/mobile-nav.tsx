'use client';

import LogoutButton from '@/components/auth/logout-button';
import Logo from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuth } from '@/providers/auth-provider';
import { Key, LayoutDashboard, LogOut, MenuIcon, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

function MobileNav({ menus }: { menus: { name: string; href: string }[] }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { isAuthenticated, user } = useAuth();
  const pathname = usePathname();

  // Only show dashboard link when on the root path
  const isOnHomePage = pathname === '/';

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetTitle>
            <div className="flex items-center">
              <Logo />
            </div>
          </SheetTitle>

          {/* User Profile Section (only shown when authenticated) */}
          {isAuthenticated && user && (
            <div className="my-4">
              <div className="flex items-center gap-3 p-3 text-left text-sm">
                <Avatar className="h-10 w-10 rounded-lg border border-border/50 bg-muted">
                  <AvatarImage
                    src={user.image || ''}
                    alt={user.name || 'User'}
                  />
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                    {user.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight gap-0.5">
                  <span className="truncate font-semibold text-foreground">
                    {user.name || 'User'}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                  <span className="truncate text-xs bg-green-600 text-white px-2 py-0.5 rounded-full w-fit flex items-center gap-1 mt-0.5">
                    {user.role}
                  </span>
                </div>
              </div>
              <Separator className="my-2" />
            </div>
          )}

          <nav className="mt-4 flex flex-col gap-4">
            {/* Standard navigation links */}
            {menus.map(item => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center text-foreground hover:text-primary"
              >
                {item.name}
              </Link>
            ))}

            {/* User Settings Links (only shown when authenticated) */}
            {isAuthenticated && user && (
              <>
                <h3 className="text-xs font-medium text-muted-foreground pt-2">
                  User Settings
                </h3>

                {/* Only show dashboard link when on the home page */}
                {isOnHomePage && (
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center text-foreground hover:text-primary"
                  >
                    <LayoutDashboard className="mr-2 size-4" />
                    Dashboard
                  </Link>
                )}

                <Link
                  href="/user/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center text-foreground hover:text-primary"
                >
                  <User className="mr-2 size-4" />
                  Profile
                </Link>
                <Link
                  href="/user/settings/api-keys"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center text-foreground hover:text-primary"
                >
                  <Key className="mr-2 size-4" />
                  API Keys
                </Link>
                <Separator className="my-2" />
                <LogoutButton>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="mr-2 size-4" />
                    Logout
                  </Button>
                </LogoutButton>
              </>
            )}

            {/* Login Button (only shown when not authenticated) */}
            {!isAuthenticated && (
              <Button asChild onClick={() => setIsOpen(false)}>
                <Link href="/login">Login</Link>
              </Button>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default MobileNav;
