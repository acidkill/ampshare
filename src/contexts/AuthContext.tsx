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
  updateCurrentUser: (user: User) => void; 
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
    if (loading) return;

    if (!currentUser) {
      if (pathname !== '/login' && !pathname.startsWith('/settings')) { // Allow settings if trying to reach it (e.g. forced redirect)
        router.replace('/login');
      }
    } else {
      if (currentUser.forcePasswordChange) {
        if (!pathname.startsWith('/settings')) {
          router.replace('/settings?firstLogin=true');
        }
      } else {
        if (pathname === '/login' || pathname.startsWith('/settings?firstLogin=true')) { // If not forced and on login or initial settings redirect
          router.replace('/dashboard');
        }
      }
    }
  }, [currentUser, loading, router, pathname]);

  const login = async (username: string, password_DO_NOT_USE_IN_PROD: string): Promise<boolean> => {
    setLoading(true);
    const user = findUserByUsername(username);
    if (user && user.password === password_DO_NOT_USE_IN_PROD) {
      setCurrentUser(user);
      localStorage.setItem('ampshare_userId', user.id);
      // Redirection is handled by the useEffect above
      setLoading(false);
      return true;
    }
    setLoading(false);
    return false;
  };

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('ampshare_userId');
    router.push('/login'); // Use push for explicit logout action
  }, [router]);

  const changePassword = useCallback(async (userId: string, currentPassword_DO_NOT_USE_IN_PROD: string, newPassword_DO_NOT_USE_IN_PROD: string): Promise<{ success: boolean; message: string }> => {
    const user = getUserById(userId);
    if (!user || user.password !== currentPassword_DO_NOT_USE_IN_PROD) {
      return { success: false, message: "Current password incorrect." };
    }

    const updatedUser = updateUserPasswordInMockDB(userId, newPassword_DO_NOT_USE_IN_PROD);
    if (updatedUser) {
      setCurrentUser(updatedUser); 
      return { success: true, message: "Password updated successfully." };
    }
    return { success: false, message: "Failed to update password." };
  }, []);
  
  const updateCurrentUser = useCallback((user: User) => {
    setCurrentUser(user);
  }, []);


  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading, changePassword, updateCurrentUser }}>
      {/* Removed loader from here, AppLayout handles its own loader */}
      {children}
    </AuthContext.Provider>
  );
};
