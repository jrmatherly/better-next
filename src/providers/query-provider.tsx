'use client';

/* import Logo from '@/components/logo';
import { ModeToggle } from '@/components/theme-toggle';
import { APP_NAME } from '@/lib/settings'; */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
/* import Link from 'next/link'; */

export function Wrapper(props: { children: React.ReactNode }) {
  return (
    //<div className="min-h-screen w-full dark:bg-black bg-white  dark:bg-grid-small-white/[0.2] bg-grid-small-black/[0.2] relative flex justify-center">
    //  <div className="lg:w-7/12 w-full">{props.children}</div>
    <div className="min-h-screen w-full dark:bg-black bg-white dark:bg-grid-small-white/[0.2] bg-grid-small-black/[0.2] relative">
      {props.children}
    </div>
  );
}

const queryClient = new QueryClient();

export function WrapperWithQuery(props: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
    </QueryClientProvider>
  );
}
