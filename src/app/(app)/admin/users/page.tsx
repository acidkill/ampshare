
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { hardcodedUsers } from '@/lib/auth';
import { getApartmentDisplayName } from '@/types';
import { Users, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UserManagementPage() {
  const users = hardcodedUsers; // In a real app, this would come from a database or auth provider

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary flex items-center gap-2">
            <Users className="h-7 w-7" />
            User Management
          </CardTitle>
          <CardDescription>
            View and manage users for AmpShare. (Admin functionality for adding/editing users is a placeholder).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-end">
            <Button disabled> <ShieldCheck className="mr-2 h-4 w-4" /> Add New User (Admin)</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Household</TableHead>
                <TableHead className="text-right">Actions (Admin)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{getApartmentDisplayName(user.apartmentId)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" disabled>Edit</Button>
                    <Button variant="destructive" size="sm" className="ml-2" disabled>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           <p className="mt-6 text-sm text-muted-foreground">
            Note: This is a simplified user listing. Full admin capabilities for user onboarding and management would require backend integration.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
