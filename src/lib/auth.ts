
import type { User } from '@/types';

// IMPORTANT: Passwords are hardcoded for demonstration. DO NOT use this in production.
// Add forcePasswordChange: true for all users to prompt for change on first login.
export const hardcodedUsers: User[] = [
  { id: 'user1', username: 'bente_stensvoll', password: 'password12341234!', apartmentId: 'stensvoll', name: 'Bente (Stensvoll)', forcePasswordChange: true },
  { id: 'user2', username: 'fredrik_stensvoll', password: 'password12341234!', apartmentId: 'stensvoll', name: 'Fredrik (Stensvoll)', forcePasswordChange: true },
  { id: 'user3', username: 'aleksandra_nowak', password: 'password2345!123', apartmentId: 'nowak', name: 'Aleksandra (Nowak)', forcePasswordChange: true },
  { id: 'user4', username: 'toni_nowak', password: 'password2345!123', apartmentId: 'nowak', name: 'Toni (Nowak)', forcePasswordChange: true },
];

export const findUserByUsername = (username: string): User | undefined => {
  return hardcodedUsers.find(user => user.username === username);
};

export const getUserById = (userId: string): User | undefined => {
  return hardcodedUsers.find(user => user.id === userId);
};

// Mock function to update user password in the hardcoded list and set forcePasswordChange to false
// In a real app, this would interact with your database and secure password hashing.
export const updateUserPasswordInMockDB = (userId: string, newPassword_DO_NOT_USE_IN_PROD: string): User | null => {
  const userIndex = hardcodedUsers.findIndex(user => user.id === userId);
  if (userIndex !== -1) {
    hardcodedUsers[userIndex].password = newPassword_DO_NOT_USE_IN_PROD;
    hardcodedUsers[userIndex].forcePasswordChange = false;
    return { ...hardcodedUsers[userIndex] }; // Return a copy
  }
  return null;
};

    
