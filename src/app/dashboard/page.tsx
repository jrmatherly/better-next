import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';

export default async function DashboardPage() {
  // Get session from server component
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <div>Please sign in to access your dashboard</div>;
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
      {/* Dashboard content */}
    </div>
  );
}
