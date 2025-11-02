
'use client';

import { SidebarProvider, Sidebar, SidebarContent, SidebarInset } from '@/components/ui/sidebar';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';
import { UserProvider } from '@/hooks/use-user';
import { Loader2 } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { MobileHeader } from '@/components/dashboard/mobile-header';

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);


  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // or a redirect component
  }

  return (
    <SidebarProvider>
        <Sidebar>
            <SidebarContent>
                <DashboardNav />
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


export default function DashboardLayout({
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
