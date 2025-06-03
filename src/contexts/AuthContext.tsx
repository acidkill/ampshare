
'use client';

import type { User } from '@/types';
import { findUserByUsername, getUserById, updateUserPasswordInMockDB } from '@/lib/auth';
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password_DO_NOT_USE_IN_PROD: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  changePassword: (userId: string, currentPassword_DO_NOT_USE_IN_PROD: string, newPassword_DO_NOT_USE_IN_PROD: string) => Promise<{ success: boolean; message: string }>;
  updateCurrentUser: (user: User) => void; // Added to update current user state from settings
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const storedUserId = localStorage.getItem('ampshare_userId');
    if (storedUserId) {
      const user = getUserById(storedUserId);
      if (user) {
        setCurrentUser(user);
      } else {
        localStorage.removeItem('ampshare_userId');
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading && !currentUser && pathname !== '/login') {
      router.replace('/login');
    }
    // Redirect to settings if forcePasswordChange is true, unless already on settings or login page
    if (!loading && currentUser && currentUser.forcePasswordChange && pathname !== '/login' && !pathname.startsWith('/settings')) {
       router.replace('/settings?firstLogin=true');
    } else if (!loading && currentUser && !currentUser.forcePasswordChange && pathname === '/login') {
       router.push('/dashboard');
    }


  }, [currentUser, loading, router, pathname]);

  const login = async (username: string, password_DO_NOT_USE_IN_PROD: string): Promise<boolean> => {
    const user = findUserByUsername(username);
    if (user && user.password === password_DO_NOT_USE_IN_PROD) {
      setCurrentUser(user);
      localStorage.setItem('ampshare_userId', user.id);
      if (user.forcePasswordChange) {
        router.push('/settings?firstLogin=true');
      } else {
        router.push('/dashboard');
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ampshare_userId');
    router.push('/login');
  };

  const changePassword = useCallback(async (userId: string, currentPassword_DO_NOT_USE_IN_PROD: string, newPassword_DO_NOT_USE_IN_PROD: string): Promise<{ success: boolean; message: string }> => {
    const user = getUserById(userId);
    if (!user || user.password !== currentPassword_DO_NOT_USE_IN_PROD) {
      return { success: false, message: "Current password incorrect." };
    }

    // Password policy is handled by Zod schema in the form. Here we just update.
    const updatedUser = updateUserPasswordInMockDB(userId, newPassword_DO_NOT_USE_IN_PROD);
    if (updatedUser) {
      setCurrentUser(updatedUser); // Update current user state
      toast({ title: "Password Changed", description: "Your password has been successfully updated." });
      return { success: true, message: "Password updated successfully." };
    }
    return { success: false, message: "Failed to update password." };
  }, [toast]);
  
  const updateCurrentUser = useCallback((user: User) => {
    setCurrentUser(user);
  }, []);


  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading, changePassword, updateCurrentUser }}>
      {loading && pathname !== '/login' ? <FullPageLoader /> : children}
    </AuthContext.Provider>
  );
};

const FullPageLoader = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-background">
    <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
  </div>
);

    