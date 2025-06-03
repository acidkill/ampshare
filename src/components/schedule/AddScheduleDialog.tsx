'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useSchedule } from '@/hooks/useSchedule';
import { useAuth } from '@/hooks/useAuth';
import type { ScheduledAppliance, ApartmentId, ApplianceType, DayOfWeek } from '@/types';
import { ALL_APPLIANCES, ALL_DAYS, getApartmentDisplayName } from '@/types';
import { getApplianceName } from '@/components/icons/ApplianceIcons';
import React, { useState, useEffect } from 'react';

// Helper to get current day name
const getCurrentDayName = (): DayOfWeek => {
  // Intl.DateTimeFormat is robust for getting day names in a specific locale.
  // Make sure the output matches your DayOfWeek type exactly (e.g., "Monday", "Tuesday").
  const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date()) as DayOfWeek;
  if (ALL_DAYS.includes(dayName)) {
    return dayName;
  }
  // Fallback, though unlikely for 'en-US' & 'long'. Adjust if your DayOfWeek has different casing or names.
  console.warn("Could not determine current day of week reliably, defaulting to Monday.");
  return 'Monday';
};


const scheduleSchema = z.object({
  applianceType: z.custom<ApplianceType>(val => ALL_APPLIANCES.includes(val as ApplianceType), "Invalid appliance type"),
  dayOfWeek: z.custom<DayOfWeek>(val => ALL_DAYS.includes(val as DayOfWeek), "Invalid day of week"),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  description: z.string().optional(),
}).refine(data => {
  if (data.startTime && data.endTime) {
    return data.startTime < data.endTime;
  }
  return true; 
}, {
  message: "End time must be after start time",
  path: ["endTime"],
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

interface AddScheduleDialogProps {
  apartmentId: ApartmentId;
  existingSchedule?: ScheduledAppliance;
  triggerButton?: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
  isOpen?: boolean;
}

const getInitialFormValues = (existingSchedule?: ScheduledAppliance): ScheduleFormValues => {
  if (existingSchedule) {
    return {
      applianceType: existingSchedule.applianceType,
      dayOfWeek: existingSchedule.dayOfWeek,
      startTime: existingSchedule.startTime,
      endTime: existingSchedule.endTime,
      description: existingSchedule.description || '',
    };
  }
  return {
    applianceType: undefined as unknown as ApplianceType, 
    dayOfWeek: undefined as unknown as DayOfWeek, 
    startTime: '', 
    endTime: '',  
    description: '',
  };
};

export function AddScheduleDialog({ apartmentId, existingSchedule, triggerButton, onOpenChange, isOpen: controlledIsOpen }: AddScheduleDialogProps) {
  const { addScheduleItem, updateScheduleItem } = useSchedule();
  const { currentUser } = useAuth();
  const [internalOpen, setInternalOpen] = useState(false);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;
  const setIsOpen = controlledIsOpen !== undefined && onOpenChange ? onOpenChange : setInternalOpen;

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: getInitialFormValues(existingSchedule),
  });

  useEffect(() => {
    form.reset(getInitialFormValues(existingSchedule));
  }, [existingSchedule, isOpen, form]);


  if (!currentUser) return null;

  const apartmentDisplayName = getApartmentDisplayName(apartmentId);

  const onSubmit = (data: ScheduleFormValues) => {
    // Restriction: Cannot create new schedule for the current day of the week
    if (!existingSchedule && data.dayOfWeek === getCurrentDayName()) {
      form.setError("dayOfWeek", {
        type: "manual",
        message: "Schedules cannot be created for the current day. Please select a different day.",
      });
      return;
    }

    if (existingSchedule) {
      updateScheduleItem({
        ...existingSchedule,
        ...data,
        userId: currentUser.id,
      });
    } else {
      addScheduleItem({
        id: crypto.randomUUID(),
        apartmentId,
        userId: currentUser.id,
        ...data,
      });
    }
    setIsOpen(false); 
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset(getInitialFormValues(existingSchedule));
      form.clearErrors("dayOfWeek"); // Clear current day error when dialog closes
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {triggerButton && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{existingSchedule ? 'Edit Schedule' : 'Add New Schedule'}</DialogTitle>
          <DialogDescription>
            {existingSchedule ? 'Update the details for this appliance usage.' : `Schedule an appliance for ${apartmentDisplayName}. Note: Schedules cannot be set for the current day of the week.`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="applianceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Appliance</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an appliance" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ALL_APPLIANCES.map(appliance => (
                        <SelectItem key={appliance} value={appliance}>{getApplianceName(appliance)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dayOfWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Day of Week</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a day" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ALL_DAYS.map(day => (
                        <SelectItem key={day} value={day} disabled={!existingSchedule && day === getCurrentDayName()}>
                          {day} {!existingSchedule && day === getCurrentDayName() ? '(Not allowed for today)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Quick wash cycle" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">{existingSchedule ? 'Save Changes' : 'Add Schedule'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
