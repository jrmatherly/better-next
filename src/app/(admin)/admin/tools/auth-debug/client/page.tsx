'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { authClient } from '@/lib/auth/client';
import { useEffect, useState } from 'react';

// Function prototype properties to filter out
const COMMON_FUNCTION_PROPS = [
  'length',
  'name',
  'arguments',
  'caller',
  'apply',
  'bind',
  'call',
  'constructor',
  'toString',
  'prototype',
];

export default function AuthDebugPage() {
  const [clientStructure, setClientStructure] = useState({
    admin: [] as string[],
    apiKey: [] as string[],
    jwt: [] as string[],
    multiSession: [] as string[],
    base: [] as string[],
  });

  useEffect(() => {
    // Better function to extract methods from objects
    const extractMethods = (
      obj: Record<string, unknown> | null | undefined
    ): string[] => {
      if (!obj) return [];

      // Get all own properties
      const ownProps = Object.getOwnPropertyNames(obj);

      // Get all properties from prototype chain
      let proto = Object.getPrototypeOf(obj);
      let protoProps: string[] = [];
      while (proto && proto !== Object.prototype) {
        protoProps = [...protoProps, ...Object.getOwnPropertyNames(proto)];
        proto = Object.getPrototypeOf(proto);
      }

      // Combine and filter unique properties
      return [...new Set([...ownProps, ...protoProps])]
        .filter(
          prop =>
            // Filter out common function properties
            !COMMON_FUNCTION_PROPS.includes(prop) &&
            // Only include if it's a function or has a value
            (typeof (obj as Record<string, unknown>)[prop] === 'function' ||
              (obj as Record<string, unknown>)[prop] !== undefined)
        )
        .sort();
    };

    try {
      // Extract methods from all BetterAuth components
      const adminMethods = extractMethods(authClient.admin);
      const apiKeyMethods = extractMethods(authClient.apiKey);
      const jwtMethods = extractMethods(
        (authClient as Record<string, unknown>).jwt as Record<string, unknown>
      );
      const multiSessionMethods = extractMethods(authClient.multiSession);

      // Get base client methods, excluding plugins
      const baseMethods = Object.getOwnPropertyNames(authClient).filter(
        key =>
          !['admin', 'apiKey', 'jwt', 'multiSession', '$store'].includes(key) &&
          typeof authClient[key as keyof typeof authClient] === 'function'
      );

      setClientStructure({
        admin: adminMethods,
        apiKey: apiKeyMethods,
        jwt: jwtMethods,
        multiSession: multiSessionMethods,
        base: baseMethods,
      });
    } catch (error) {
      console.error('Error accessing BetterAuth client structure:', error);
    }
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Auth Client Structure Debug</h1>
      <p className="text-muted-foreground">
        This page reveals the actual structure of the BetterAuth client plugins
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PluginCard title="Admin Plugin" keys={clientStructure.admin} />
        <PluginCard title="API Key Plugin" keys={clientStructure.apiKey} />
        <PluginCard title="JWT Plugin" keys={clientStructure.jwt} />
        <PluginCard
          title="MultiSession Plugin"
          keys={clientStructure.multiSession}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>BetterAuth Base Methods</CardTitle>
          <CardDescription>Core client methods</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] rounded-md border p-4">
            {clientStructure.base.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1">
                {clientStructure.base.map(key => (
                  <li key={key} className="text-sm">
                    {key}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No methods available
              </p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Full Session Data</CardTitle>
          <CardDescription>Current user session</CardDescription>
        </CardHeader>
        <CardContent>
          <SessionDebugger />
        </CardContent>
      </Card>
    </div>
  );
}

function SessionDebugger() {
  const [sessionData, setSessionData] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { getSession } = await import('@/lib/auth/client');
        const session = await getSession();
        setSessionData(session as Record<string, unknown>);
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  if (loading) {
    return <p>Loading session data...</p>;
  }

  return (
    <ScrollArea className="h-[300px] rounded-md border p-4">
      <pre className="text-xs">{JSON.stringify(sessionData, null, 2)}</pre>
    </ScrollArea>
  );
}

function PluginCard({ title, keys }: { title: string; keys: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Available methods and properties</CardDescription>
      </CardHeader>
      <CardContent>
        {keys && keys.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1">
            {keys.map(key => (
              <li key={key} className="text-sm">
                {key}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No methods available
          </p>
        )}
      </CardContent>
    </Card>
  );
}
