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
  // SidebarTrigger, // Removed as AppNavbar handles its own trigger if needed
} from '@/components/ui/sidebar';
import { Flame, LayoutDashboard, CalendarDays, Users, Zap, Power, Settings } from 'lucide-react'; 
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { setupLazyComponents } from '@/web-components/lazy-registry';


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !currentUser && pathname !== '/login' && !pathname.startsWith('/settings')) {
      router.replace('/login');
    }
    setupLazyComponents();
  }, [currentUser, loading, router, pathname]);

  if (loading) {
    return (
       <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  // If user is not logged in AND not trying to access settings (which might be a forced redirect), show loader or nothing.
  // This prevents layout flash before AuthContext redirects.
  if (!currentUser && !pathname.startsWith('/settings') && pathname !== '/login') {
    return null; 
  }

  const isPasswordChangeForced = !!currentUser?.forcePasswordChange;
  // Show sidebar and navbar if user exists AND (they are not forced to change password OR they are on the settings page)
  const showSidebarAndNavbar = !!currentUser && (!isPasswordChangeForced || pathname.startsWith('/settings'));


  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/schedule/stensvoll', label: 'Stensvoll Schedule', icon: CalendarDays },
    { href: '/schedule/nowak', label: 'Nowak Schedule', icon: CalendarDays },
    { href: '/conflicts', label: 'Conflict Resolution', icon: Zap },
    { href: '/admin/users', label: 'User Management', icon: Users },
  ];

  const handleLogout = () => {
    logout();
  };
  

  return (
    <SidebarProvider defaultOpen>
      {showSidebarAndNavbar && (
        <Sidebar variant="sidebar" collapsible="icon">
          <SidebarHeader className="border-b border-sidebar-border">
            <Link 
              href={isPasswordChangeForced ? "#" : "/dashboard"} 
              className={`flex items-center gap-2 text-lg font-semibold text-sidebar-primary group-data-[collapsible=icon]:justify-center ${isPasswordChangeForced ? 'pointer-events-none opacity-50' : ''}`}
              aria-disabled={isPasswordChangeForced}
              tabIndex={isPasswordChangeForced ? -1 : undefined}
            >
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
                    disabled={isPasswordChangeForced && !pathname.startsWith('/settings')}
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
                <SidebarMenuButton 
                  asChild 
                  tooltip={{ children: 'Settings', side: 'right' }}
                  isActive={pathname.startsWith('/settings')}
                >
                  <Link href="/settings">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                    onClick={handleLogout}
                    tooltip={{ children: 'Logout', side: 'right' }}
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
        <main className={`flex-1 p-4 md:p-6 lg:p-8 bg-background ${!showSidebarAndNavbar && !pathname.startsWith('/settings') ? 'h-screen flex items-center justify-center' : ''}`}>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
