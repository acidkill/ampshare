'use client';

import React, { createContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { ScheduledAppliance, ApartmentId, AIApplianceInput } from '@/types';
import { resolveScheduleConflicts, ResolveScheduleConflictsInput, ResolveScheduleConflictsOutput } from '@/ai/flows/resolve-schedule-conflicts';
import { useToast } from '@/hooks/use-toast';

interface ScheduleContextType {
  schedules: Record<ApartmentId, ScheduledAppliance[]>;
  addScheduleItem: (item: ScheduledAppliance) => Promise<void>;
  removeScheduleItem: (apartmentId: ApartmentId, itemId: string) => Promise<void>;
  updateScheduleItem: (item: ScheduledAppliance) => Promise<void>;
  getCombinedSchedule: () => ScheduledAppliance[];
  runConflictDetection: () => Promise<ResolveScheduleConflictsOutput | null>;
  loadingConflicts: boolean;
  conflictResolutionResult: ResolveScheduleConflictsOutput | null;
  clearConflictResult: () => void;
  loadingSchedules: boolean;
}

export const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const ScheduleProvider = ({ children }: { children: ReactNode }) => {
  const [schedules, setSchedules] = useState<Record<ApartmentId, ScheduledAppliance[]>>({
    stensvoll: [],
    nowak: [],
  });
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [loadingConflicts, setLoadingConflicts] = useState(false);
  const [conflictResolutionResult, setConflictResolutionResult] = useState<ResolveScheduleConflictsOutput | null>(null);
  const { toast } = useToast();

  const fetchSchedules = useCallback(async () => {
    setLoadingSchedules(true);
    try {
      const response = await fetch('/api/schedules');
      if (!response.ok) {
        throw new Error('Failed to fetch schedules');
      }
      const data: ScheduledAppliance[] = await response.json();
      const organizedSchedules: Record<ApartmentId, ScheduledAppliance[]> = {
        stensvoll: data.filter(s => s.apartmentId === 'stensvoll'),
        nowak: data.filter(s => s.apartmentId === 'nowak'),
      };
      setSchedules(organizedSchedules);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      toast({
        title: "Error",
        description: "Could not load schedules.",
        variant: "destructive",
      });
    } finally {
      setLoadingSchedules(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const addScheduleItem = useCallback(async (item: ScheduledAppliance) => {
    try {
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!response.ok) {
        throw new Error('Failed to add schedule item');
      }
      const newSchedule = await response.json();
      setSchedules(prev => ({
        ...prev,
        [newSchedule.apartmentId]: [...prev[newSchedule.apartmentId], newSchedule],
      }));
      toast({ title: "Schedule Added", description: `${newSchedule.applianceType} scheduled for ${newSchedule.dayOfWeek} at ${newSchedule.startTime}.` });
    } catch (error) {
      console.error("Error adding schedule item:", error);
      toast({ title: "Error", description: "Could not add schedule item.", variant: "destructive" });
    }
  }, [toast]);

  const removeScheduleItem = useCallback(async (apartmentId: ApartmentId, itemId: string) => {
    try {
      const response = await fetch(`/api/schedules/${itemId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to remove schedule item');
      }
      setSchedules(prev => ({
        ...prev,
        [apartmentId]: prev[apartmentId].filter(schedule => schedule.id !== itemId),
      }));
      toast({ title: "Schedule Removed", description: "The scheduled item has been removed." });
    } catch (error) {
      console.error("Error removing schedule item:", error);
      toast({ title: "Error", description: "Could not remove schedule item.", variant: "destructive" });
    }
  }, [toast]);

  const updateScheduleItem = useCallback(async (item: ScheduledAppliance) => {
    try {
      const response = await fetch(`/api/schedules/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!response.ok) {
        throw new Error('Failed to update schedule item');
      }
      const updatedSchedule = await response.json();
      setSchedules(prev => ({
        ...prev,
        [updatedSchedule.apartmentId]: prev[updatedSchedule.apartmentId].map(schedule => schedule.id === updatedSchedule.id ? updatedSchedule : schedule),
      }));
      toast({ title: "Schedule Updated", description: `The schedule for ${updatedSchedule.applianceType} has been updated.` });
    } catch (error) {
      console.error("Error updating schedule item:", error);
      toast({ title: "Error", description: "Could not update schedule item.", variant: "destructive" });
    }
  }, [toast]);

  const getCombinedSchedule = useCallback(() => {
    return [...schedules.stensvoll, ...schedules.nowak];
  }, [schedules]);

  const mapToAIInput = (scheduledItems: ScheduledAppliance[], apartmentName: "Stensvoll" | "Nowak"): AIApplianceInput[] => {
    return scheduledItems.map(item => ({
      applianceType: item.applianceType,
      startTime: item.startTime,
      endTime: item.endTime,
      apartment: apartmentName,
      dayOfWeek: item.dayOfWeek,
    }));
  };

  const runConflictDetection = useCallback(async () => {
    setLoadingConflicts(true);
    setConflictResolutionResult(null);
    try {
      const input: ResolveScheduleConflictsInput = {
        stensvollSchedule: mapToAIInput(schedules.stensvoll, "Stensvoll"),
        nowakSchedule: mapToAIInput(schedules.nowak, "Nowak"),
      };
      const result = await resolveScheduleConflicts(input);
      setConflictResolutionResult(result);
      if (result.conflictsDetected) {
        toast({
          title: "Conflicts Detected!",
          description: result.conflictSummary,
          variant: "destructive",
          duration: 10000,
        });
      } else {
        toast({
          title: "No Conflicts Found",
          description: "The current schedule has no conflicts.",
        });
      }
      return result;
    } catch (error) {
      console.error("Error running conflict detection:", error);
      toast({
        title: "Error",
        description: "Could not run conflict detection.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoadingConflicts(false);
    }
  }, [schedules, toast]);

  const clearConflictResult = useCallback(() => {
    setConflictResolutionResult(null);
  }, []);

  return (
    <ScheduleContext.Provider value={{
      schedules,
      addScheduleItem,
      removeScheduleItem,
      updateScheduleItem,
      getCombinedSchedule,
      runConflictDetection,
      loadingConflicts,
      conflictResolutionResult,
      clearConflictResult,
      loadingSchedules,
    }}>
      {children}
    </ScheduleContext.Provider>
  );
};
