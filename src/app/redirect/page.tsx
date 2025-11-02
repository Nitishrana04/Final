
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserProvider, useUser } from '@/hooks/use-user';
import { Loader2 } from 'lucide-react';

function Redirector() {
  const { profile, loading, gym } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Don't do anything until the user's profile is loaded
    if (loading) {
      return;
    }

    // If loading is done and there's still no profile, it's an error or logged-out state.
    // Send them to login to be safe.
    if (!profile) {
      router.push('/login');
      return;
    }

    // Now, route based on role.
    if (profile.role === 'admin') {
      router.push('/admin/dashboard');
    } else if (profile.role === 'gym-owner') {
      // If they are a gym owner but haven't created a gym yet, send them to the creation page.
      if (!gym) {
         router.push('/gym-owner/create-gym');
      } else {
         router.push('/gym-owner/dashboard');
      }
    } else {
      // Default for regular 'user' role
      router.push('/dashboard');
    }

  }, [profile, loading, gym, router]);

  // Display a loading spinner while the logic runs.
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
        <p className="text-muted-foreground">Signing in...</p>
      </div>
    </div>
  );
}


export default function RedirectPage() {
    return (
        <UserProvider>
            <Redirector />
        </UserProvider>
    )
}
