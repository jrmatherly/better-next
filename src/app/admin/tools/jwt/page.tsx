import { JwtDebugger } from '@/components/auth/jwt/jwt-debugger';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JWT Tools',
  description: 'Tools for working with JWT tokens',
};

export default function JwtToolsPage() {
  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">JWT Tools</h1>
        <p className="text-muted-foreground">
          Debug, verify, and generate JWT tokens for authentication.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <JwtDebugger />

        <Card>
          <CardHeader>
            <CardTitle>What is JWT?</CardTitle>
            <CardDescription>Understanding JSON Web Tokens</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              JSON Web Tokens (JWT) are an open standard (RFC 7519) that defines
              a compact and self-contained way for securely transmitting
              information between parties as a JSON object.
            </p>

            <div className="space-y-2">
              <h3 className="font-medium">Structure of a JWT</h3>
              <p className="text-sm">
                JWTs consist of three parts separated by dots:
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>
                  <strong>Header</strong> - contains the type of token and
                  signing algorithm
                </li>
                <li>
                  <strong>Payload</strong> - contains the claims (statements
                  about an entity)
                </li>
                <li>
                  <strong>Signature</strong> - used to verify the sender and
                  ensure the message wasn't changed
                </li>
              </ul>
            </div>

            <div className="text-sm mt-4">
              <p className="text-muted-foreground">
                This application uses JWTs for authentication and authorization,
                allowing for secure, stateless transmission of user information.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
