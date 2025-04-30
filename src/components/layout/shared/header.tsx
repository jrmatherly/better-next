import MobileNav from '@/components/layout/shared/mobile-nav';
import UserDropdown from '@/components/layout/shared/user-dropdown';
import Logo from '@/components/logo';
import { ModeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { auth } from '@/lib/auth/server';
import type { BetterAuthSession } from '@/types/auth';
import { headers } from 'next/headers';
import Link from 'next/link';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import * as React from 'react';

/**
 * Server component for the site header
 * Includes mobile navigation and user dropdown menu
 */
export default async function Header() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const menus = [
    {
      name: 'Home',
      href: '#hero',
    },
    {
      name: 'About',
      href: '#about',
    },
    {
      name: 'Features',
      href: '#features',
    },
    // currenly disabled for faster development
    // {
    //   name: "Analytics",
    //   href: "https://stats.dun.gg/share/wBd7o6ts7CUEVyVu/betternext.dun.gg",
    // },
  ];
  return (
    <header className="relative mx-auto w-full max-w-6xl p-2 md:p-5">
      <Card className="flex justify-between gap-3 px-2 py-2">
        <MobileNav menus={menus} />
        <div className="flex items-center md:w-32">
          <Logo />
        </div>
        <nav className="hidden items-center gap-6 md:flex">
          {menus.map(item => (
            <a key={item.name} href={item.href}>
              {item.name}
            </a>
          ))}
        </nav>
        <ul className="flex items-center justify-end gap-3 md:w-32">
          <li>
            <ModeToggle />
          </li>
          <li className="hidden md:flex">
            {!session ? (
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
            ) : (
              <UserDropdown session={session as BetterAuthSession} />
            )}
          </li>
        </ul>
      </Card>
    </header>
  );
}
