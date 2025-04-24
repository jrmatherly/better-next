'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Code } from '@/components/ui/code';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useJwt } from '@/hooks/use-jwt';
import type { JwtPayload } from '@/types/plugins';
import { Loader2 } from 'lucide-react';
import { type FC, useState } from 'react';

/**
 * JWT Debugger component
 * Allows users to decode and verify JWT tokens
 */
export const JwtDebugger: FC = () => {
  const { verifyToken, isLoading } = useJwt();
  const [token, setToken] = useState<string>('');
  const [payload, setPayload] = useState<JwtPayload | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleVerifyToken = async () => {
    if (!token.trim()) {
      setErrorMessage('Please enter a JWT token');
      return;
    }

    setErrorMessage(null);
    setPayload(null);

    const result = await verifyToken(token.trim());

    if (result) {
      setPayload(result);
    } else {
      setErrorMessage('Invalid JWT token or verification failed');
    }
  };

  const formatJson = (data: unknown): string => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return 'Error formatting JSON';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>JWT Debugger</CardTitle>
        <CardDescription>
          Verify and decode JWT tokens to inspect their contents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="jwt-token"
              className="block text-sm font-medium mb-2"
            >
              JWT Token
            </label>
            <Textarea
              id="jwt-token"
              placeholder="Paste your JWT token here..."
              value={token}
              onChange={e => setToken(e.target.value)}
              className="font-mono text-xs h-24"
            />
          </div>

          {errorMessage && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
              {errorMessage}
            </div>
          )}

          {payload && (
            <Tabs defaultValue="payload">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="payload">Payload</TabsTrigger>
                <TabsTrigger value="header">Header</TabsTrigger>
                <TabsTrigger value="signature">Signature</TabsTrigger>
              </TabsList>

              <TabsContent value="payload" className="py-2">
                <ScrollArea className="h-60">
                  <Code>{formatJson(payload)}</Code>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="header" className="py-2">
                <ScrollArea className="h-60">
                  <Code>
                    {formatJson({
                      alg: 'HS256',
                      typ: 'JWT',
                    })}
                  </Code>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="signature" className="py-2">
                <div className="p-4 text-muted-foreground text-sm">
                  The signature is used to verify that the sender of the JWT is
                  who it says it is and to ensure that the message wasn't
                  changed along the way.
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleVerifyToken}
          disabled={isLoading || !token.trim()}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Verifying...' : 'Verify Token'}
        </Button>
      </CardFooter>
    </Card>
  );
};
