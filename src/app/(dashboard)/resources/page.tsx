import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { ResourcesList } from '@/components/resources/resources-list';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function ResourcesPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Resources"
        text="Manage your virtual machines, databases, and other resources."
      >
        <Button asChild>
          <Link href="/resources/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Resource
          </Link>
        </Button>
      </DashboardHeader>
      <ResourcesList />
    </DashboardShell>
  );
}
