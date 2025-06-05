export interface User {
  id: string;
  username: string;
  email?: string;
  forcePasswordChange?: boolean; // Added based on usage in auth.ts
  // Add other user properties as needed
}

export interface SeedUser {
  id: string;
  username: string;
  password: string; // Storing plain password for seeding, will be hashed on actual user creation or migration
  email?: string;
  apartmentId: string;
  name: string;
  forcePasswordChange?: boolean; // Optional as it might not be present for all seed users initially
  // Add other seed user properties as needed
}
