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

  useEffect(() => {
    const fetchKeys = async () => {
      const fetchedKeys = await getKeys();
      setKeys(fetchedKeys);
    };

    fetchKeys();
  }, [getKeys]);

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

    if (newKey?.value) {
      setNewKeyValue(newKey.value);
      setKeys([...keys, newKey]);
      setNewKeyName('');
    }

    setIsCreating(false);
  };

  const handleDeleteKey = async (keyId: string) => {
    setIsDeleting(keyId);
    const success = await deleteKey(keyId);
    if (success) {
      setKeys(keys.filter(key => key.id !== keyId));
    }
    setIsDeleting(null);
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
              {keys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No API keys found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                keys.map(key => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
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
