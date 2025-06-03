'use client';

import React, { createContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password_DO_NOT_USE_IN_PROD: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (userId: string, newPassword_DO_NOT_USE_IN_PROD: string) => Promise<boolean>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Attempt to load user from session storage on mount
    try {
      const storedUser = sessionStorage.getItem('ampShareUser');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to load user from session storage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password_DO_NOT_USE_IN_PROD: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: password_DO_NOT_USE_IN_PROD }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentUser(data.user);
        sessionStorage.setItem('ampShareUser', JSON.stringify(data.user));
        toast({ title: "Login Successful", description: `Welcome, ${data.user.name}!` });
        return true;
      } else {
        toast({ title: "Login Failed", description: data.message || "Invalid username or password.", variant: "destructive" });
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({ title: "Login Error", description: "An unexpected error occurred during login.", variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    sessionStorage.removeItem('ampShareUser');
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
  }, [toast]);

  const changePassword = useCallback(async (userId: string, newPassword_DO_NOT_USE_IN_PROD: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword: newPassword_DO_NOT_USE_IN_PROD }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentUser(data.user); // Update user in context with forcePasswordChange: false
        sessionStorage.setItem('ampShareUser', JSON.stringify(data.user));
        toast({ title: "Password Changed", description: "Your password has been updated successfully." });
        return true;
      } else {
        toast({ title: "Password Change Failed", description: data.message || "Could not update password.", variant: "destructive" });
        return false;
      }
    } catch (error) {
      console.error("Change password error:", error);
      toast({ title: "Password Change Error", description: "An unexpected error occurred.", variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, changePassword, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
