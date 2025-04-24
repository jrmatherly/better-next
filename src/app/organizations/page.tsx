import { OrganizationManager } from '@/components/organizations/organization-manager';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Organizations',
  description: 'Manage your organizations and team members',
};

export default function OrganizationsPage() {
  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
        <p className="text-muted-foreground">
          Create and manage organizations, invite team members, and control
          access.
        </p>
      </div>

      <OrganizationManager />

      <div className="mt-8 text-sm text-muted-foreground">
        <h3 className="font-medium mb-2">Working with Organizations:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Each organization can have multiple members with different roles
          </li>
          <li>Organization owners can invite new members via email</li>
          <li>Members can belong to multiple organizations</li>
          <li>Organization settings control access permissions and features</li>
          <li>Each organization has its own resources and data isolation</li>
        </ul>
      </div>
    </div>
  );
}
