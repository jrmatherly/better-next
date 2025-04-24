import '../styles/globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { Toaster } from '@/components/ui/sonner';
import { createMetadata } from '@/lib/metadata';
import { APP_NAME } from '@/lib/settings';
import Analytics from '@/script/analytics';

export const metadata = createMetadata({
  title: {
    template: `%s | ${APP_NAME || 'Better Next'}`,
    default: APP_NAME || 'Better Next',
  },
  description: 'The easiest way to get started with your next project',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <Analytics />
      </head>
      <body className={'antialiased'}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
