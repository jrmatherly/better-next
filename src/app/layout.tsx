import '../styles/globals.css';
import { ImpersonationBanner } from '@/components/admin/impersonation-banner';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { getServerSession } from '@/lib/auth/guards';
import { createMetadata } from '@/lib/metadata';
import { APP_NAME } from '@/lib/settings';
import Analytics from '@/script/analytics';
import type { BetterAuthSession } from '@/types/auth';
import React from 'react';

export const metadata = createMetadata({
  title: {
    template: `%s | ${APP_NAME || 'Better Next'}`,
    default: APP_NAME || 'Better Next',
  },
  description: 'The easiest way to get started with your next project',
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
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
