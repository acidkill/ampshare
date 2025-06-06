// UserRole is more specific now, admin for administrators, tenant for apartment users.
export type UserRole = 'admin' | 'tenant';

export interface Apartment {
  id: string; // e.g., 'stensvoll', 'nowak'
  name: string; // e.g., "Stensvoll Household"
  address?: string; // Optional address field
}

export interface User {
  id: string;
  username: string;
  name: string; // User's full name or display name
  email?: string;
  apartmentId: string; // ID of the apartment the user belongs to
  role: UserRole;
  forcePasswordChange?: boolean; // Added based on usage in auth.ts
  // Add other user properties as needed
}

export interface SeedUser {
  id: string;
  username: string;
  password: string; // Storing plain password for seeding, will be hashed on actual user creation or migration
  name: string;
  email?: string;
  apartmentId: string;
  role: UserRole;
  forcePasswordChange?: boolean; // Optional as it might not be present for all seed users initially
  // Add other seed user properties as needed
}

// Define Appliance type based on ApplianceSelector component
export interface Appliance {
  id: string;      // e.g., 'car_charger', 'oven'
  name: string;    // e.g., 'Car Charger', 'Oven'
  icon: string;    // e.g., '🔌', '🍳'
}

// Define ScheduleEntry type for storing scheduled items
export interface ScheduleEntry {
  day: string;        // e.g., 'Mon', 'Tue'
  time: string;       // e.g., '09:00', '14:00'
  applianceId: string;
  userId: string;     // Who scheduled it
  apartmentId: string;
  // Potentially other details like duration, notes, etc.
}

export interface Conflict {
  id: string;
  type: 'appliance_overlap' | 'power_overload' | 'other'; // Type of conflict
  description: string; // Detailed description of the conflict
  scheduleEntryIds: string[]; // IDs of ScheduleEntry items involved in the conflict
  suggestedResolution?: string; // AI or rule-based suggestion
  status: 'unresolved' | 'resolved' | 'ignored';
  createdAt: string; // ISO date string
  resolvedAt?: string; // ISO date string, optional
  resolutionNotes?: string; // Notes on how the conflict was resolved or why it was ignored
}

// Represents the payload of the JWT for session management
export interface JWTPayload {
  id: string; // User ID
  username: string;
  role: UserRole;
  apartmentId: string;
  // Add other non-sensitive fields needed for session validation or quick access
}
