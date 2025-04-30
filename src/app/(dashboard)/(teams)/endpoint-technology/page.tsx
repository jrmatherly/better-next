import { EndpointTechnologyPage } from '@/components/teams/endpoint-technology/endpoint-technology-page';
import { withFieldTechProtection } from '@/lib/auth/protect-server';

// Protect the Endpoint Technology page with role-based access control
// Only users with 'admin', 'security', or 'fieldtech' roles can access this page
const ProtectedEndpointTechnology = withFieldTechProtection(() => {
  return <EndpointTechnologyPage />;
});

export default ProtectedEndpointTechnology;
