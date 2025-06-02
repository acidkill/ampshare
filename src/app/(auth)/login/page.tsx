'use client';

import { AuthForm } from '@/components/auth/AuthForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame } from 'lucide-react';

export default function LoginPage() {
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
