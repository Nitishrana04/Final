
'use client';

import { SidebarProvider, Sidebar, SidebarContent, SidebarInset } from '@/components/ui/sidebar';
import { GymNav } from '@/components/gym-owner/gym-nav';
import { UserProvider, useUser } from '@/hooks/use-user';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { MobileHeader } from '@/components/dashboard/mobile-header';

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || profile?.role !== 'gym-owner') {
        router.push('/login');
      }
    }
  }, [user, profile, loading, router]);


  if (loading || !profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (profile.role !== 'gym-owner') {
    return null; 
  }

  return (
    <SidebarProvider>
        <Sidebar>
            <SidebarContent>
                <GymNav />
            </SidebarContent>
        </Sidebar>
        <SidebarInset>
            <MobileHeader />
            <div className="p-4 sm:p-6 lg:p-8">
                {children}
            </div>
        </SidebarInset>
    </SidebarProvider>
  );
}


export default function GymOwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <ProtectedLayout>
        {children}
      </ProtectedLayout>
    </UserProvider>
  );
}
