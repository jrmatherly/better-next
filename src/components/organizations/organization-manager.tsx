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
import { useOrganizations } from '@/hooks/use-organizations';
import type {
  Organization,
  OrganizationCreateParams,
  OrganizationInviteParams,
} from '@/types/plugins';
import { formatDistanceToNow } from 'date-fns';
import { MailPlus, PlusIcon, Users } from 'lucide-react';
import { type FC, useEffect, useState } from 'react';
import { toast } from 'sonner';

/**
 * Organization Manager component
 * Allows users to view and manage organizations they belong to
 */
export const OrganizationManager: FC = () => {
  const { getOrganizations, createOrganization, inviteUser, isLoading } =
    useOrganizations();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [newOrgName, setNewOrgName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteOrgId, setInviteOrgId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchOrganizations = async () => {
      const fetchedOrgs = await getOrganizations();
      setOrganizations(fetchedOrgs);
    };

    fetchOrganizations();
  }, [getOrganizations]);

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim()) {
      toast.error('Please enter an organization name');
      return;
    }

    setIsCreating(true);

    const params: OrganizationCreateParams = {
      name: newOrgName.trim(),
    };

    const newOrg = await createOrganization(params);

    if (newOrg) {
      setOrganizations([...organizations, newOrg]);
      setNewOrgName('');
      setCreateDialogOpen(false);
    }

    setIsCreating(false);
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim() || !inviteOrgId) {
      toast.error('Please enter an email address');
      return;
    }

    setIsInviting(true);

    const params: OrganizationInviteParams = {
      organizationId: inviteOrgId,
      email: inviteEmail.trim(),
      role: 'member', // Default role
    };

    const result = await inviteUser(params);

    if (result) {
      setInviteEmail('');
      setInviteDialogOpen(false);
    }

    setIsInviting(false);
  };

  const openInviteDialog = (orgId: string) => {
    setInviteOrgId(orgId);
    setInviteDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organizations</CardTitle>
        <CardDescription>View and manage your organizations</CardDescription>
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
            <TableCaption>Your organizations</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Members</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No organizations found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                organizations.map(org => (
                  <TableRow key={org.id}>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(org.createdAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>{org.role || 'Member'}</TableCell>
                    <TableCell>{org.memberCount || 1}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openInviteDialog(org.id)}
                        className="mr-2"
                        aria-label={`Invite users to ${org.name}`}
                      >
                        <MailPlus className="h-4 w-4 mr-1" />
                        Invite
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        aria-label={`View ${org.name} details`}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        {/* Create Organization Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Organization</DialogTitle>
              <DialogDescription>
                Enter a name for your new organization.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="org-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="org-name"
                  value={newOrgName}
                  onChange={e => setNewOrgName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., My Company"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={handleCreateOrganization}
                disabled={isCreating || !newOrgName.trim()}
              >
                {isCreating ? 'Creating...' : 'Create Organization'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Invite User Dialog */}
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite User</DialogTitle>
              <DialogDescription>
                Enter the email address of the user you want to invite.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="invite-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="col-span-3"
                  placeholder="user@example.com"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={handleInviteUser}
                disabled={isInviting || !inviteEmail.trim()}
              >
                {isInviting ? 'Inviting...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
      <CardFooter>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-1" />
          Create New Organization
        </Button>
      </CardFooter>
    </Card>
  );
};
