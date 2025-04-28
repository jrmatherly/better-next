"use client";

import { authClient } from "@/lib/auth/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AuthDebugPage() {
  // Get the structure of each plugin
  const adminStructure = Object.keys(authClient.admin || {});
  const apiKeyStructure = Object.keys(authClient.apiKey || {});
  const jwtStructure = Object.keys((authClient as Record<string, unknown>).jwt || {});
  const multiSessionStructure = Object.keys(authClient.multiSession || {});

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Auth Client Structure Debug</h1>
      <p className="text-muted-foreground">
        This page reveals the actual structure of the BetterAuth client plugins
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PluginCard title="Admin Plugin" keys={adminStructure} />
        <PluginCard title="API Key Plugin" keys={apiKeyStructure} />
        <PluginCard title="JWT Plugin" keys={jwtStructure} />
        <PluginCard title="MultiSession Plugin" keys={multiSessionStructure} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Full Client Structure</CardTitle>
          <CardDescription>All available client keys</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] rounded-md border p-4">
            <pre className="text-xs">
              {JSON.stringify(
                Object.keys(authClient).filter(k => k !== "$store"),
                null,
                2
              )}
            </pre>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
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
        {keys.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1">
            {keys.map((key) => (
              <li key={key} className="text-sm">
                {key}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground italic">No methods available</p>
        )}
      </CardContent>
    </Card>
  );
}
