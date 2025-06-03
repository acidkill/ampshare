
export type ApplianceType = 'car-charger' | 'oven' | 'washing-machine' | 'dryer' | 'dishwasher';
export type ApartmentId = 'stensvoll' | 'nowak'; // Changed
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
  apartment: "Stensvoll" | "Nowak"; // Changed
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

// Types for Unplanned Appliance Use Requests
export type UnplannedRequestStatus = 'pending' | 'approved' | 'denied' | 'cancelled';

export interface UnplannedRequest {
  id: string;
  requesterUserId: string;
  requesterApartmentId: ApartmentId;
  targetApartmentId: ApartmentId; // The apartment that needs to approve
  applianceType: ApplianceType;
  dayOfWeek: DayOfWeek; 
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  reason: string;
  status: UnplannedRequestStatus;
  requestedAt: string; // ISO date string
  respondedAt?: string; // ISO date string
  responderUserId?: string; 
}

export const getApartmentDisplayName = (apartmentId: ApartmentId): string => {
  if (apartmentId === 'stensvoll') return 'Stensvoll';
  if (apartmentId === 'nowak') return 'Nowak';
  return 'Unknown Apartment';
};
