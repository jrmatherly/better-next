import { FieldTechnologyPage } from '@/components/teams/field-technology/field-technology-page';
import { withFieldTechProtection } from '@/lib/auth/protect-server';

// Protect the Field Technology page with role-based access control
// Only users with 'admin' or 'fieldtech' roles can access this page
const ProtectedFieldTechnology = withFieldTechProtection(() => {
  return <FieldTechnologyPage />;
});

export default ProtectedFieldTechnology;
