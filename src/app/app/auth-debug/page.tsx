'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/lib/auth/client';
import { useAuth } from '@/providers/auth-provider';
import { useEffect, useState } from 'react';

export default function AppDebugPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const session = useSession();
  const [mounted, setMounted] = useState(false);

  // This ensures the component only renders dynamic content on the client
  // preventing hydration mismatches between server and client
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Session Debugger (App Route)</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Authentication State</CardTitle>
        </CardHeader>
        <CardContent>
          {mounted ? (
            <pre className="bg-muted p-4 rounded-md overflow-auto">
              {JSON.stringify({
                isAuthenticated,
                isLoading,
                user
              }, null, 2)}
            </pre>
          ) : (
            <div className="bg-muted p-4 rounded-md h-24 animate-pulse" />
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Raw Session Data</CardTitle>
        </CardHeader>
        <CardContent>
          {mounted ? (
            <pre className="bg-muted p-4 rounded-md overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          ) : (
            <div className="bg-muted p-4 rounded-md h-24 animate-pulse" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
