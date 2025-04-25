import { db } from '@/db';
import { user } from '@/db/schema';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  const userList = await db.select().from(user);
  
  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Total user registered : {userList.length}</p>
      <ul>
        {userList.length > 0 &&
          userList.map(user => (
            <li key={user.id}>
              {user.name} (
              {user.email.replace(
                /^[^@]+/,
                '*'.repeat(user.email.indexOf('@'))
              )}
              )
            </li>
          ))}
      </ul>
    </div>
  );
}
