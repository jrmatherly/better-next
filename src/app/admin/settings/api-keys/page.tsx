import { ApiKeyManager } from '@/components/api-keys/api-key-manager';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Keys',
  description: 'Manage your API keys for programmatic access to the API',
};

export default function ApiKeysPage() {
  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
        <p className="text-muted-foreground">
          Create and manage API keys for secure programmatic access to the API.
        </p>
      </div>

      <ApiKeyManager />

      <div className="mt-8 text-sm text-muted-foreground">
        <h3 className="font-medium mb-2">Best Practices for API Key Usage:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Never share your API keys or store them in public repositories
          </li>
          <li>
            Use environment variables to store API keys in your applications
          </li>
          <li>Create different API keys for different applications</li>
          <li>Rotate your API keys periodically for enhanced security</li>
          <li>Delete unused API keys to minimize security risks</li>
        </ul>
      </div>
    </div>
  );
}
