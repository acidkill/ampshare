
'use client';

import { AppNavbar } from '@/components/layout/AppNavbar';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Flame, LayoutDashboard, CalendarDays, Users, Zap, Power, Settings } from 'lucide-react'; 
import Link from 'next/link';
import { usePathname } from 'next/navigation';


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.replace('/login');
    }
  }, [currentUser, loading, router]);

  if (loading || (!currentUser && !pathname.startsWith('/settings')) ) { // Allow settings page if redirecting for password change
     // If loading, or no user and not trying to access settings page initially
    if (!loading && !currentUser && pathname !== '/login' && !pathname.startsWith('/settings')) {
      return ( // Avoid flash of loader if already on login/settings due to auth redirect
         <div className="flex h-screen w-screen items-center justify-center bg-background">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        </div>
      );
    } else if (loading) {
        return (
         <div className="flex h-screen w-screen items-center justify-center bg-background">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        </div>
      );
    }
  }
  
  // If user exists but needs to change password, AuthContext will redirect to /settings.
  // The layout should still render for the /settings page.
  const showSidebarAndNavbar = currentUser && (!currentUser.forcePasswordChange || pathname.startsWith('/settings'));


  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/schedule/stensvoll', label: 'Stensvoll Schedule', icon: CalendarDays },
    { href: '/schedule/nowak', label: 'Nowak Schedule', icon: CalendarDays },
    { href: '/conflicts', label: 'Conflict Resolution', icon: Zap },
    { href: '/admin/users', label: 'User Management', icon: Users },
  ];

  return (
    <SidebarProvider defaultOpen>
      {showSidebarAndNavbar && (
        <Sidebar variant="sidebar" collapsible="icon">
          <SidebarHeader className="border-b border-sidebar-border">
            <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold text-sidebar-primary group-data-[collapsible=icon]:justify-center">
              <Flame className="h-7 w-7" />
              <span className="font-headline group-data-[collapsible=icon]:hidden">AmpShare</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                    tooltip={{ children: item.label, side: 'right', className: 'bg-sidebar text-sidebar-foreground border-sidebar-border' }}
                    disabled={currentUser?.forcePasswordChange && !pathname.startsWith('/settings')} // Disable nav if password change is forced
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t border-sidebar-border">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={{ children: 'Settings', side: 'right' }}>
                  <Link href="/settings">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                    onClick={currentUser && !currentUser.forcePasswordChange ? () => {} : () => router.push('/login')} // Placeholder for logout, ensure it's not available if pass change needed
                    tooltip={{ children: 'Logout', side: 'right' }}
                    disabled={currentUser?.forcePasswordChange && !pathname.startsWith('/settings')}
                >
                  <Power />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
      )}
      <SidebarInset>
        {showSidebarAndNavbar && <AppNavbar />}
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

    