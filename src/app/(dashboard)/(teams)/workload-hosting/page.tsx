import { WorkloadHostingPage } from '@/components/teams/workload-hosting/workload-hosting-page';
import { withAdminProtection } from '@/lib/auth/protect-server';

// Protect the Workload Hosting page with role-based access control
// Only users with 'admin' role can access this page
const ProtectedWorkloadHosting = withAdminProtection(() => {
  return <WorkloadHostingPage />;
});

export default ProtectedWorkloadHosting;
