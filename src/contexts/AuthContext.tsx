'use client';

import type { User } from '@/types';
import { findUserByUsername, getUserById } from '@/lib/auth';
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password_DO_NOT_USE_IN_PROD: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

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
      router.push('/login');
    }
    if (!loading && currentUser && pathname === '/login') {
      router.push('/dashboard');
    }
  }, [currentUser, loading, router, pathname]);

  const login = async (username: string, password_DO_NOT_USE_IN_PROD: string): Promise<boolean> => {
    const user = findUserByUsername(username);
    // IMPORTANT: This is a mock authentication. DO NOT use this in production.
    if (user && user.password === password_DO_NOT_USE_IN_PROD) {
      setCurrentUser(user);
      localStorage.setItem('ampshare_userId', user.id);
      router.push('/dashboard');
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ampshare_userId');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading }}>
      {loading && pathname !== '/login' ? <FullPageLoader /> : children}
    </AuthContext.Provider>
  );
};

const FullPageLoader = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-background">
    <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
  </div>
);
