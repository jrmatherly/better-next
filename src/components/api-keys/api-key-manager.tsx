'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useApiKeys } from '@/hooks/use-api-keys';
import { apiLogger } from '@/lib/logger';
import type { ApiKey, ApiKeyCreateParams } from '@/types/plugins';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Copy } from 'lucide-react';
import { type FC, useEffect, useState } from 'react';
import { toast } from 'sonner';

/**
 * API Key Manager component
 * Allows users to create, view, and manage their API keys
 */
export const ApiKeyManager: FC = () => {
  const { getKeys, createKey, deleteKey, isLoading } = useApiKeys();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  /**
   * Fetch API keys when the component mounts and refresh when triggered
   *
   * Note: We're splitting this into two separate effects:
   * 1. Initial fetch on mount with getKeys dependency
   * 2. Refreshes based on the refreshTrigger state
   *
   * This avoids the lint warning about unnecessary dependencies.
   */
  useEffect(() => {
    const fetchKeys = async () => {
      const fetchedKeys = await getKeys();
      setKeys(fetchedKeys);
    };

    fetchKeys();
  }, [getKeys]); // This effect depends only on getKeys

  // Separate effect to handle manual refreshes
  useEffect(() => {
    // Skip the initial render (when refreshTrigger is 0)
    if (refreshTrigger === 0) return;

    const fetchKeys = async () => {
      const fetchedKeys = await getKeys();
      setKeys(fetchedKeys);
    };

    fetchKeys();
  }, [refreshTrigger, getKeys]); // This effect triggers on refreshTrigger changes

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for your API key');
      return;
    }

    setIsCreating(true);

    const params: ApiKeyCreateParams = {
      name: newKeyName.trim(),
      // Optional: Add expiration date
    };

    const newKey = await createKey(params);

    // Log the result to help with debugging
    apiLogger.info('New key created:', newKey);

    if (newKey?.value) {
      // Set the key value to display in the dialog
      setNewKeyValue(newKey.value);
      // Don't close the dialog - we want to show the key
      setRefreshTrigger(prev => prev + 1);
      setNewKeyName('');
    } else {
      // If no key value, something went wrong with the key creation
      toast.error(
        'Created API key but no key value was returned. Please try again.'
      );
    }

    setIsCreating(false);
  };

  const handleDeleteKey = async (keyId: string) => {
    setIsDeleting(keyId);
    try {
      apiLogger.debug(`Attempting to delete API key with ID: ${keyId}`);
      const success = await deleteKey(keyId);
      if (success) {
        setKeys(prevKeys => prevKeys.filter(key => key.id !== keyId));
        apiLogger.debug(`API key deleted successfully: ${keyId}`);
        // Don't need toast here since it's handled in the hook
        setTimeout(() => {
          setRefreshTrigger(prev => prev + 1);
        }, 500);
      } else {
        apiLogger.warn(`API key deletion returned false for ID: ${keyId}`);
        // Don't need toast here since it's handled in the hook
      }
    } catch (error) {
      apiLogger.error(`Error when deleting API key ${keyId}:`, error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleCopyKey = (keyValue: string) => {
    navigator.clipboard.writeText(keyValue);
    toast.success('API key copied to clipboard');
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setNewKeyValue(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Keys</CardTitle>
        <CardDescription>
          Create and manage API keys for programmatic access to the API
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <Table>
            <TableCaption>Your personal API keys</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!Array.isArray(keys) ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    Error loading API keys. Please try again.
                  </TableCell>
                </TableRow>
              ) : keys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No API keys found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                keys.map(key => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">
                      {key.name}
                      {(key.prefix || key.start) && (
                        <span className="ml-2 text-xs text-muted-foreground font-mono">
                          {key.prefix || key.start}...
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(key.createdAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>
                      {key.lastUsed
                        ? formatDistanceToNow(new Date(key.lastUsed), {
                            addSuffix: true,
                          })
                        : 'Never used'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isDeleting === key.id}
                        onClick={() => handleDeleteKey(key.id)}
                        aria-label={`Delete API key ${key.name}`}
                      >
                        {isDeleting === key.id ? 'Deleting...' : 'Revoke'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Give your API key a descriptive name for easy identification.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newKeyName}
                  onChange={e => setNewKeyName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Development, Testing, Production"
                />
              </div>
            </div>

            {newKeyValue && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="mt-2">
                  <div className="mb-2 text-amber-500 font-medium">
                    This is the only time you'll see this API key.
                  </div>
                  <div className="relative">
                    <Input
                      value={newKeyValue}
                      readOnly
                      className="pr-10 font-mono text-xs"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => handleCopyKey(newKeyValue)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              {newKeyValue ? (
                <Button onClick={closeDialog}>Done</Button>
              ) : (
                <Button
                  onClick={handleCreateKey}
                  disabled={isCreating || !newKeyName.trim()}
                >
                  {isCreating ? 'Creating...' : 'Create API Key'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
      <CardFooter>
        <Button onClick={() => setDialogOpen(true)}>Create New API Key</Button>
      </CardFooter>
    </Card>
  );
};
