
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Dumbbell, LogOut, Building, Settings, Gem } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarFooter } from '@/components/ui/sidebar';
import { useUser } from '@/hooks/use-user';

const navItems = [
  { href: '/gym-owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/gym-owner/profile', label: 'Gym Profile', icon: Settings },
];

export function GymNav() {
  const pathname = usePathname();
  const { gym } = useUser();

  const isMembersActive = () => {
    return pathname.startsWith('/gym-owner/members') || pathname === '/gym-owner/dashboard';
  }

  return (
    <>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-3 p-2">
            <Building className="h-8 w-8 text-accent drop-shadow-[0_0_4px_hsl(var(--accent))]" />
            <div>
              <span className="font-bold text-lg">{gym?.name || 'My Gym'}</span>
              <p className="text-xs text-muted-foreground">Owner Dashboard</p>
            </div>
        </div>
      </SidebarHeader>
      <SidebarMenu className="flex-1 p-4">
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/gym-owner/dashboard'} tooltip={{children: 'Dashboard', side: "right"}}>
              <Link href='/gym-owner/dashboard'>
                <LayoutDashboard />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
             <SidebarMenuButton asChild isActive={pathname.startsWith('/gym-owner/members')} tooltip={{children: 'Members', side: "right"}}>
              <Link href='/gym-owner/dashboard'>
                <Users />
                <span>Members</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/gym-owner/profile'} tooltip={{children: 'Gym Profile', side: "right"}}>
              <Link href='/gym-owner/profile'>
                <Settings />
                <span>Gym Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/gym-owner/subscription'} tooltip={{children: 'Subscription', side: "right"}}>
              <Link href='/gym-owner/subscription'>
                <Gem />
                <span>Subscription</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
      </SidebarMenu>
      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={{children: "Logout", side: "right"}}>
                    <Link href="/login">
                        <LogOut />
                        <span>Logout</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
