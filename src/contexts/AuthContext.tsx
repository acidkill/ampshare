'use client';

import type { User } from '@/types';
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
    const loadUser = async () => {
      const storedUserId = localStorage.getItem('ampshare_userId');
      if (storedUserId && storedUserId !== 'undefined' && storedUserId !== 'null') { // Added more robust check
        try {
          const response = await fetch(`/api/auth/user/${storedUserId}`);
          if (response.ok) {
            const user = await response.json();
            setCurrentUser(user);
          } else {
            localStorage.removeItem('ampshare_userId');
          }
        } catch (error) {
          console.error('Error loading user:', error);
          localStorage.removeItem('ampshare_userId');
        }
      }
      setLoading(false);
    };

    loadUser();
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
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password: password_DO_NOT_USE_IN_PROD }),
      });

      if (response.ok) {
        const user = await response.json();
        setCurrentUser(user);
        localStorage.setItem('ampshare_userId', user.id);
        setLoading(false);
        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
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
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId, 
          currentPassword: currentPassword_DO_NOT_USE_IN_PROD,
          newPassword: newPassword_DO_NOT_USE_IN_PROD 
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setCurrentUser(updatedUser);
        return { success: true, message: "Password updated successfully." };
      } else {
        const error = await response.json();
        return { success: false, message: error.message || "Failed to update password." };
      }
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, message: "Failed to update password." };
    }
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
