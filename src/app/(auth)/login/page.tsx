'use client';

import { AuthForm } from '@/components/auth/AuthForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If user is already logged in, redirect to dashboard or callback URL
    if (currentUser && !authLoading) {
      const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
      router.push(callbackUrl);
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [currentUser, authLoading, router, searchParams]);

  if (isLoading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Flame className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline text-primary">AmpShare</CardTitle>
          <CardDescription>Sign in to manage your appliance schedule.</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm />
        </CardContent>
      </Card>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Manage high-voltage appliance usage efficiently.
      </p>
    </div>
  );
}
