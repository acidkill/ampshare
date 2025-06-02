
export type ApplianceType = 'car-charger' | 'oven' | 'washing-machine' | 'dryer' | 'dishwasher';
export type ApartmentId = 'apartment1' | 'apartment2';
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export const ALL_DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const ALL_APPLIANCES: ApplianceType[] = ['car-charger', 'oven', 'washing-machine', 'dryer', 'dishwasher'];


export interface ScheduledAppliance {
  id: string;
  applianceType: ApplianceType;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  dayOfWeek: DayOfWeek;
  apartmentId: ApartmentId;
  userId: string;
  description?: string;
}

export interface User {
  id: string;
  username: string;
  password?: string; // Only for local check, not stored in production like this
  apartmentId: ApartmentId;
  name: string;
}

// For AI conflict resolution input, aligning with src/ai/flows/resolve-schedule-conflicts.ts
export interface AIApplianceInput {
  applianceType: string;
  startTime: string;
  endTime: string;
  apartment: "Apartment 1" | "Apartment 2";
  dayOfWeek: string;
}

export interface AISuggestedTimeChange {
  applianceType: string;
  suggestedStartTime: string;
  suggestedEndTime: string;
  reason: string;
}

export interface AIConflictResolutionOutput {
  conflictsDetected: boolean;
  conflictSummary: string;
  suggestedTimeChanges: AISuggestedTimeChange[];
}
