
import type { User } from '@/types';

// IMPORTANT: Passwords are hardcoded for demonstration. DO NOT use this in production.
// Add forcePasswordChange: true for all users to prompt for change on first login.
export const hardcodedUsers: User[] = [
  { id: 'user1', username: 'alice_stensvoll', password: 'password1', apartmentId: 'stensvoll', name: 'Alice (Stensvoll)', forcePasswordChange: true },
  { id: 'user2', username: 'bob_stensvoll', password: 'password1', apartmentId: 'stensvoll', name: 'Bob (Stensvoll)', forcePasswordChange: true },
  { id: 'user3', username: 'charlie_nowak', password: 'password2', apartmentId: 'nowak', name: 'Charlie (Nowak)', forcePasswordChange: true },
  { id: 'user4', username: 'dana_nowak', password: 'password2', apartmentId: 'nowak', name: 'Dana (Nowak)', forcePasswordChange: true },
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

    