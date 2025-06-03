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
import { useUnplannedRequest } from '@/hooks/useUnplannedRequest';
import { useAuth } from '@/hooks/useAuth';
import type { ApplianceType, DayOfWeek } from '@/types';
import { ALL_APPLIANCES, ALL_DAYS } from '@/types';
import { getApplianceName } from '@/components/icons/ApplianceIcons';
import React, { useState, useEffect } from 'react';

const unplannedRequestSchema = z.object({
  applianceType: z.custom<ApplianceType>(val => ALL_APPLIANCES.includes(val as ApplianceType), "Invalid appliance type"),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  reason: z.string().min(1, { message: "Reason is required." }),
}).refine(data => {
  if (data.startTime && data.endTime) {
    return data.startTime < data.endTime;
  }
  return true;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
});

type UnplannedRequestFormValues = z.infer<typeof unplannedRequestSchema>;

interface UnplannedRequestDialogProps {
  triggerButton?: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
  isOpen?: boolean;
}

const getCurrentDayOfWeek = (): DayOfWeek => {
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
  const dayName = new Intl.DateTimeFormat('en-US', options).format(today);
  if (ALL_DAYS.includes(dayName as DayOfWeek)) {
    return dayName as DayOfWeek;
  }
  // Fallback, should ideally not happen with 'en-US' and 'long'
  console.warn("Could not determine current day of week correctly, defaulting to Monday:", dayName);
  return 'Monday';
};


export function UnplannedRequestDialog({ triggerButton, onOpenChange, isOpen: controlledIsOpen }: UnplannedRequestDialogProps) {
  const { createUnplannedRequest } = useUnplannedRequest();
  const { currentUser } = useAuth();
  const [internalOpen, setInternalOpen] = useState(false);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;
  const setIsOpen = controlledIsOpen !== undefined && onOpenChange ? onOpenChange : setInternalOpen;

  const form = useForm<UnplannedRequestFormValues>({
    resolver: zodResolver(unplannedRequestSchema),
    defaultValues: {
      applianceType: undefined as unknown as ApplianceType,
      startTime: '',
      endTime: '',
      reason: '',
    },
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset({
        applianceType: undefined as unknown as ApplianceType,
        startTime: '',
        endTime: '',
        reason: '',
      });
    }
  }, [isOpen, form]);

  if (!currentUser) return null;

  const onSubmit = (data: UnplannedRequestFormValues) => {
    const currentDay = getCurrentDayOfWeek();
    createUnplannedRequest({
      ...data,
      dayOfWeek: currentDay,
    });
    setIsOpen(false);
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset({
        applianceType: undefined as unknown as ApplianceType,
        startTime: '',
        endTime: '',
        reason: '',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {triggerButton && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Unplanned Appliance Use</DialogTitle>
          <DialogDescription>
            Submit a request for using a high-voltage appliance outside of the regular schedule. This request is for today only.
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time (Today)</FormLabel>
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
                    <FormLabel>End Time (Today)</FormLabel>
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
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Request</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Unexpected guests, need to do laundry" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <p className="text-xs text-muted-foreground">
              Your request for <strong>{getApplianceName(form.getValues().applianceType)}</strong> on <strong>{getCurrentDayOfWeek()}</strong> from <strong>{form.getValues().startTime || 'N/A'}</strong> to <strong>{form.getValues().endTime || 'N/A'}</strong> will be sent to the {currentUser.apartmentId === 'stensvoll' ? 'Nowak' : 'Stensvoll'} household for approval.
            </p>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Submit Request</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
