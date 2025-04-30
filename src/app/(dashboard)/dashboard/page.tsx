import { DashboardGrid } from '@/components/dashboard/dashboard-grid';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard"
        text="Manage your resources and view system health."
      />
      <DashboardGrid />
    </DashboardShell>
  );
}
