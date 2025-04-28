import UserCard from '@/components/auth/user/user-card';
import { auth } from '@/lib/auth/server';
import { authLogger } from '@/lib/logger';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
/* import { OrganizationCard } from "@/components/organization/organization-card"; */
/* import AccountSwitcher from "@/components/account-switch"; */

export default async function UserProfile() {
  const [session, activeSessions, deviceSessions] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),
    auth.api.listSessions({
      headers: await headers(),
    }),
    auth.api.listDeviceSessions({
      headers: await headers(),
    }),
    /* auth.api.getFullOrganization({
				headers: await headers(),
			}),
			auth.api.listActiveSubscriptions({
				headers: await headers(),
			}), */
  ]).catch(e => {
    authLogger.error('Failed to fetch user data', e);
    throw redirect('/login');
  });
  return (
    <div className="w-full">
      <div className="flex gap-4 flex-col">
        {/* <AccountSwitcher
          sessions={JSON.parse(JSON.stringify(deviceSessions))}
        /> */}
        <UserCard
          session={JSON.parse(JSON.stringify(session))}
          activeSessions={JSON.parse(JSON.stringify(activeSessions))}
        />
        {/* <OrganizationCard
          session={JSON.parse(JSON.stringify(session))}
          activeOrganization={JSON.parse(JSON.stringify(organization))}
        /> */}
      </div>
    </div>
  );
}
