import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getServerSession } from '@/lib/auth/guards';
import { getRoleBadgeStyles } from '@/lib/role-styles';
import { cn } from '@/lib/utils';
import type { BetterAuthSession } from '@/types/auth';

export default async function AuthDebugServerPage() {
  const session = await getServerSession();

  if (!session?.user) {
    // Handle unauthenticated state
    return (
      <div className="container py-8 space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Session Debugger</h1>
        <p>Please sign in to debug your session</p>
      </div>
    );
  }

  // Cast to BetterAuthSession to access nested session properties
  const fullSession = session as unknown as BetterAuthSession;

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Session Debugger</h1>
      <p className="text-muted-foreground">
        This page displays all information from your current authentication
        session
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {session.user.image && (
              <div className="flex justify-center mb-4">
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="h-24 w-24 rounded-full"
                />
              </div>
            )}

            <div>
              <h3 className="font-medium text-sm text-muted-foreground">
                Name
              </h3>
              <p>{session.user.name || '-'}</p>
            </div>

            <div>
              <h3 className="font-medium text-sm text-muted-foreground">
                Email
              </h3>
              <p>{session.user.email}</p>
            </div>

            <div>
              <h3 className="font-medium text-sm text-muted-foreground">
                User ID
              </h3>
              <p className="font-mono text-xs">{session.user.id}</p>
            </div>

            <div>
              <h3 className="font-medium text-sm text-muted-foreground">
                Role
              </h3>
              <div className="flex items-center gap-2">
                <Badge
                  variant={getRoleBadgeStyles(session.user.role).variant}
                  className={cn(getRoleBadgeStyles(session.user.role).className)}
                >
                  {session.user.role}
                </Badge>
              </div>
            </div>

            {session.user.isImpersonating && (
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">
                  Impersonation Status
                </h3>
                <Badge
                  className="bg-amber-100 text-amber-800 border-amber-300"
                >
                  Impersonating Role
                </Badge>
                {session.user.originalRole && (
                  <div className="mt-2">
                    <h4 className="text-xs text-muted-foreground">
                      Original Role:
                    </h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge variant="outline">
                        {session.user.originalRole}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            )}

            {session.user.groups && session.user.groups.length > 0 && (
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">
                  Groups
                </h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {session.user.groups.map(group => (
                    <Badge key={group} variant="outline">
                      {group}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Session Meta Information */}
        <Card>
          <CardHeader>
            <CardTitle>Session Meta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Create sections for accessing nested session data if available */}
            {fullSession.session ? (
              <>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">
                    Session ID
                  </h3>
                  <p className="font-mono text-xs">{fullSession.session.id}</p>
                </div>

                {fullSession.session.expiresAt && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">
                      Expires
                    </h3>
                    <p className="text-sm">
                      {new Date(fullSession.session.expiresAt).toLocaleString()}
                    </p>
                  </div>
                )}

                {fullSession.session.createdAt && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">
                      Created At
                    </h3>
                    <p className="text-sm">
                      {new Date(fullSession.session.createdAt).toLocaleString()}
                    </p>
                  </div>
                )}

                {fullSession.session.updatedAt && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">
                      Updated At
                    </h3>
                    <p className="text-sm">
                      {new Date(fullSession.session.updatedAt).toLocaleString()}
                    </p>
                  </div>
                )}

                {fullSession.session.ipAddress && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">
                      IP Address
                    </h3>
                    <p className="font-mono text-xs">
                      {fullSession.session.ipAddress}
                    </p>
                  </div>
                )}

                {fullSession.session.userAgent && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">
                      User Agent
                    </h3>
                    <p className="text-xs line-clamp-2">
                      {fullSession.session.userAgent}
                    </p>
                  </div>
                )}

                {fullSession.session.impersonatedBy && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">
                      Impersonated By
                    </h3>
                    <p className="font-mono text-xs">
                      {fullSession.session.impersonatedBy}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-md">
                <p className="text-sm text-yellow-800">
                  No detailed session metadata available
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Raw Session Data */}
      <Card>
        <CardHeader>
          <CardTitle>Raw Session Data</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
            {JSON.stringify(session, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
