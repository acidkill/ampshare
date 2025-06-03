
'use client';

import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Flame, LogOut, Settings, UserCircle, Menu } from 'lucide-react';
import Link from 'next/link';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { ThemeToggle } from './ThemeToggle'; 

export function AppNavbar() {
  const { currentUser, logout } = useAuth();
  const { isMobile } = useSidebar();

  const getInitials = (name: string) => {
    const names = name.split(' ');
    return names.map((n) => n[0]).join('').toUpperCase();
  };
  
  const isPasswordChangeForced = !!currentUser?.forcePasswordChange;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-2">
        {isMobile && (
          <SidebarTrigger asChild disabled={isPasswordChangeForced}>
            <Button variant="ghost" size="icon">
              <Menu/>
            </Button>
          </SidebarTrigger>
        )}
        <Link 
          href={isPasswordChangeForced ? "#" : "/dashboard"} 
          className={`flex items-center gap-2 font-semibold text-primary ${isPasswordChangeForced ? 'pointer-events-none opacity-50' : ''}`}
          aria-disabled={isPasswordChangeForced}
          tabIndex={isPasswordChangeForced ? -1 : undefined}
        >
          <Flame className="h-6 w-6" />
          <span className="font-headline text-xl hidden md:inline">AmpShare</span>
        </Link>
      </div>
      
      <div className="ml-auto flex items-center gap-2 md:gap-4">
        <ThemeToggle /> 
        <Button variant="ghost" size="icon" className="rounded-full" disabled={isPasswordChangeForced}>
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        {currentUser && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={`https://placehold.co/100x100.png?text=${getInitials(currentUser.name)}`} alt={currentUser.name} data-ai-hint="avatar person" />
                  <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {currentUser.username}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled={isPasswordChangeForced}>
                <UserCircle className="mr-2 h-4 w-4" />
                Profile (Placeholder)
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} disabled={isPasswordChangeForced && window.location.pathname.startsWith('/settings?firstLogin=true')}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
