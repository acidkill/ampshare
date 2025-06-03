'use client';

import { useAuth } from '@/hooks/useAuth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, KeyRound, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';

const passwordPolicy = z.string()
  .min(8, { message: "Password must be at least 8 characters long." })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
  .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
  .regex(/[0-9]/, { message: "Password must contain at least one digit." })
  .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character." });

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Current password is required.' }),
  newPassword: passwordPolicy,
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "New passwords do not match.",
  path: ["confirmNewPassword"],
}).refine(data => data.currentPassword !== data.newPassword, {
  message: "New password must be different from the current password.",
  path: ["newPassword"],
});

type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

export function PasswordChangeForm() {
  const { currentUser, changePassword, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFirstLogin = searchParams.get('firstLogin') === 'true';

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onSubmit = async (data: PasswordChangeFormValues) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!currentUser) {
      setError("No user logged in.");
      setLoading(false);
      return;
    }

    const result = await changePassword(currentUser.id, data.currentPassword, data.newPassword);

    if (result.success) {
      setSuccess(result.message);
      toast({
        title: "Password Changed",
        description: result.message,
      });
      form.reset();
      // If it was a forced password change, redirect to dashboard
      if (isFirstLogin) {
        router.push('/dashboard');
      }
    } else {
      setError(result.message);
      toast({
        title: "Password Change Failed",
        description: result.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  if (!currentUser) {
    return <p>Loading user information...</p>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {isFirstLogin && !success && (
          <Alert variant="default" className="bg-primary/10 border-primary text-primary">
            <KeyRound className="h-4 w-4 !text-primary" />
            <AlertTitle>Welcome to AmpShare!</AlertTitle>
            <AlertDescription>
              For security reasons, you are required to change your password before proceeding.
            </AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert variant="default" className="bg-green-100 border-green-600 text-green-700 dark:bg-green-900/30 dark:border-green-500 dark:text-green-400">
            <CheckCircle className="h-4 w-4 !text-green-600 dark:!text-green-400" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter your current password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter your new password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmNewPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Confirm your new password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="text-sm text-muted-foreground space-y-1">
            <p>Password must:</p>
            <ul className="list-disc list-inside pl-4">
                <li>Be at least 8 characters long</li>
                <li>Contain at least one uppercase letter</li>
                <li>Contain at least one lowercase letter</li>
                <li>Contain at least one digit</li>
                <li>Contain at least one special character (e.g., !@#$%^&*)</li>
            </ul>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
        <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
          {loading ? 'Changing Password...' : 'Change Password'}
        </Button>
        {isFirstLogin && (
            <Button type="button" variant="outline" onClick={logout} className="w-full sm:w-auto" disabled={loading}>
                Logout
            </Button>
        )}
        </div>

      </form>
    </Form>
  );
}
