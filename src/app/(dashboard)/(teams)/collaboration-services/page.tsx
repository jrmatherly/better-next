import { CollaborationServicesPage } from '@/components/teams/collaboration-services/collaboration-services-page';
import { withCollabProtection } from '@/lib/auth/protect-server';

// Protect the Collaboration Services page with role-based access control
// Only users with 'admin' or 'collab' roles can access this page
const ProtectedCollaborationServices = withCollabProtection(() => {
  return <CollaborationServicesPage />;
});

export default ProtectedCollaborationServices;
