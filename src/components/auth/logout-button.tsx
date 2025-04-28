'use client';

import { signOut } from '@/lib/auth/client';
import { authLogger } from '@/lib/logger';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function LogoutButton({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push('/');
            router.refresh();
          },
        },
      });
    } catch (error) {
      toast.error('Something went wrong.');
      authLogger.error('Logout failed', { error });
    }
  };

  return (
    <Button 
      onClick={handleSignOut}
      variant="ghost" 
      className="w-full justify-start"
    >
      {children}
    </Button>
  );
}
