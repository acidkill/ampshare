'use client';

import React, { createContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { ScheduledAppliance, ApartmentId, AIApplianceInput } from '@/types';
import { resolveScheduleConflicts, ResolveScheduleConflictsInput, ResolveScheduleConflictsOutput } from '@/ai/flows/resolve-schedule-conflicts';
import { useToast } from '@/hooks/use-toast';

interface ScheduleContextType {
  schedules: Record<ApartmentId, ScheduledAppliance[]>;
  addScheduleItem: (item: ScheduledAppliance) => void;
  removeScheduleItem: (apartmentId: ApartmentId, itemId: string) => void;
  updateScheduleItem: (item: ScheduledAppliance) => void;
  getCombinedSchedule: () => ScheduledAppliance[];
  runConflictDetection: () => Promise<ResolveScheduleConflictsOutput | null>;
  loadingConflicts: boolean;
  conflictResolutionResult: ResolveScheduleConflictsOutput | null;
  clearConflictResult: () => void;
}

export const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

const initialSchedules: Record<ApartmentId, ScheduledAppliance[]> = {
  apartment1: [],
  apartment2: [],
};

export const ScheduleProvider = ({ children }: { children: ReactNode }) => {
  const [schedules, setSchedules] = useState<Record<ApartmentId, ScheduledAppliance[]>>(initialSchedules);
  const [loadingConflicts, setLoadingConflicts] = useState(false);
  const [conflictResolutionResult, setConflictResolutionResult] = useState<ResolveScheduleConflictsOutput | null>(null);
  const { toast } = useToast();

  // Load schedules from localStorage on mount
  useEffect(() => {
    try {
      const storedSchedules = localStorage.getItem('ampShareSchedules');
      if (storedSchedules) {
        const parsedSchedules = JSON.parse(storedSchedules);
        // Basic validation
        if (parsedSchedules.apartment1 && parsedSchedules.apartment2) {
           setSchedules(parsedSchedules);
        }
      }
    } catch (error) {
      console.error("Failed to load schedules from localStorage", error);
    }
  }, []);

  // Save schedules to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('ampShareSchedules', JSON.stringify(schedules));
    } catch (error) {
      console.error("Failed to save schedules to localStorage", error);
    }
  }, [schedules]);


  const addScheduleItem = useCallback((item: ScheduledAppliance) => {
    setSchedules(prev => ({
      ...prev,
      [item.apartmentId]: [...prev[item.apartmentId], item],
    }));
    toast({ title: "Schedule Added", description: `${item.applianceType} scheduled for ${item.dayOfWeek} at ${item.startTime}.` });
  }, [toast]);

  const removeScheduleItem = useCallback((apartmentId: ApartmentId, itemId: string) => {
    setSchedules(prev => ({
      ...prev,
      [apartmentId]: prev[apartmentId].filter(schedule => schedule.id !== itemId),
    }));
    toast({ title: "Schedule Removed", description: "The scheduled item has been removed." });
  }, [toast]);

  const updateScheduleItem = useCallback((item: ScheduledAppliance) => {
    setSchedules(prev => ({
      ...prev,
      [item.apartmentId]: prev[item.apartmentId].map(schedule => schedule.id === item.id ? item : schedule),
    }));
    toast({ title: "Schedule Updated", description: `The schedule for ${item.applianceType} has been updated.` });
  }, [toast]);

  const getCombinedSchedule = useCallback(() => {
    return [...schedules.apartment1, ...schedules.apartment2];
  }, [schedules]);

  const mapToAIInput = (scheduledItems: ScheduledAppliance[], apartmentName: "Apartment 1" | "Apartment 2"): AIApplianceInput[] => {
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
        apartment1Schedule: mapToAIInput(schedules.apartment1, "Apartment 1"),
        apartment2Schedule: mapToAIInput(schedules.apartment2, "Apartment 2"),
        // Optional fields, can be added later
        // usageHistory: "...", 
        // userPreferences: "..."
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
      clearConflictResult
    }}>
      {children}
    </ScheduleContext.Provider>
  );
};
