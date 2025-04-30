import '../styles/globals.css';
import { ImpersonationBanner } from '@/components/auth/admin/impersonation-banner';
import { Toaster } from '@/components/ui/sonner';
import { getServerSession } from '@/lib/auth/guards';
import { createMetadata } from '@/lib/metadata';
import { APP_DESCRIPTION, APP_NAME } from '@/lib/settings';
import { Wrapper, WrapperWithQuery } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import Analytics from '@/script/analytics';
import type { BetterAuthSession } from '@/types/auth';
import React from 'react';

export const metadata = createMetadata({
  title: {
    template: `%s | ${APP_NAME || 'Better Next'}`,
    default: APP_NAME || 'Better Next',
  },
  description:
    APP_DESCRIPTION || 'The easiest way to get started with your next project',
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();
  const fullSession = session as unknown as BetterAuthSession;

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <Analytics />
      </head>
      <body className={'antialiased'}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Display impersonation banner when admin is impersonating a user */}
          {session?.user?.isImpersonating && (
            <ImpersonationBanner isImpersonating={true} />
          )}
          <Wrapper>
            <WrapperWithQuery>{children}</WrapperWithQuery>
          </Wrapper>
          <Toaster richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
