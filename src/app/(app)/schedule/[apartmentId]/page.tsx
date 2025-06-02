'use client';

import { useParams } from 'next/navigation';
import { useSchedule } from '@/hooks/useSchedule';
import { useAuth } from '@/hooks/useAuth';
import type { ApartmentId, DayOfWeek, ScheduledAppliance } from '@/types';
import { ALL_DAYS } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddScheduleDialog } from '@/components/schedule/AddScheduleDialog';
import { ApplianceIcon, getApplianceName } from '@/components/icons/ApplianceIcons';
import { PlusCircle, Edit, Trash2, CalendarDays, Zap } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from 'next/link';
import React, { useState } from 'react';


export default function ApartmentSchedulePage() {
  const params = useParams();
  const apartmentId = params.apartmentId as ApartmentId;
  const { schedules, removeScheduleItem } = useSchedule();
  const { currentUser } = useAuth();

  const [editingSchedule, setEditingSchedule] = useState<ScheduledAppliance | undefined>(undefined);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  if (!currentUser || !apartmentId || (apartmentId !== 'apartment1' && apartmentId !== 'apartment2')) {
    return <p className="text-center text-red-500">Invalid apartment ID or not authorized.</p>;
  }

  const apartmentSchedule = schedules[apartmentId] || [];

  // Group schedule by day
  const scheduleByDay = ALL_DAYS.reduce((acc, day) => {
    acc[day] = apartmentSchedule.filter(item => item.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {} as Record<DayOfWeek, ScheduledAppliance[]>);
  
  const handleEdit = (item: ScheduledAppliance) => {
    setEditingSchedule(item);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    // Delay resetting editingSchedule to allow dialog to close smoothly
    setTimeout(() => setEditingSchedule(undefined), 300);
  };


  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-headline text-primary flex items-center gap-2">
              <CalendarDays className="h-7 w-7"/>
              Apartment {apartmentId === 'apartment1' ? '1' : '2'} Schedule
            </CardTitle>
            <CardDescription>
              Manage your high-voltage appliance usage for Apartment {apartmentId === 'apartment1' ? '1' : '2'}.
            </CardDescription>
          </div>
          {currentUser.apartmentId === apartmentId && (
             <AddScheduleDialog
              apartmentId={apartmentId}
              triggerButton={
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Schedule
                </Button>
              }
            />
          )}
        </CardHeader>
        <CardContent>
          {ALL_DAYS.map(day => (
            <div key={day} className="mb-6">
              <h3 className="text-xl font-semibold mb-3 border-b pb-2">{day}</h3>
              {scheduleByDay[day].length === 0 ? (
                <p className="text-sm text-muted-foreground">No appliances scheduled for {day}.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Appliance</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Description</TableHead>
                      {currentUser.apartmentId === apartmentId && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduleByDay[day].map(item => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ApplianceIcon type={item.applianceType} className="h-5 w-5" />
                            {getApplianceName(item.applianceType)}
                          </div>
                        </TableCell>
                        <TableCell>{item.startTime} - {item.endTime}</TableCell>
                        <TableCell>{item.userId === currentUser?.id ? 'You' : `User ${item.userId}`}</TableCell>
                        <TableCell className="max-w-xs truncate">{item.description || '-'}</TableCell>
                        {currentUser.apartmentId === apartmentId && (
                          <TableCell className="text-right space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => removeScheduleItem(apartmentId, item.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          ))}
          {apartmentSchedule.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No schedules added yet for this apartment. Click "Add Schedule" to get started.
            </p>
          )}
          {editingSchedule && (
            <AddScheduleDialog
              apartmentId={apartmentId}
              existingSchedule={editingSchedule}
              isOpen={isEditDialogOpen}
              onOpenChange={handleCloseEditDialog}
            />
          )}
           <div className="mt-8 flex justify-end">
            <Button asChild variant="outline">
              <Link href="/conflicts">
                <Zap className="mr-2 h-4 w-4" /> Check for Conflicts
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
