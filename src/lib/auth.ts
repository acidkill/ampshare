import type { User, SeedUser } from '@/types';
import { getDb } from './db'; // Assuming you have a db connection setup (e.g., in src/lib/db.ts)
import { hash } from 'bcryptjs'; // For password hashing
import { v4 as uuidv4 } from 'uuid'; // Using uuid for user IDs if not using hardcoded ones

// This array should primarily be used for seeding the database, not for runtime user management.
// IMPORTANT: Passwords are hardcoded for demonstration. DO NOT use this in production.
// Add forcePasswordChange: true for all users to prompt for change on first login.
export const hardcodedUsers: SeedUser[] = [
  { id: 'user1', username: 'bente_stensvoll', password: 'password12341234!', apartmentId: 'stensvoll', name: 'Bente (Stensvoll)', forcePasswordChange: true },
  { id: 'user2', username: 'fredrik_stensvoll', password: 'password12341234!', apartmentId: 'stensvoll', name: 'Fredrik (Stensvoll)', forcePasswordChange: true },
  { id: 'user3', username: 'aleksandra_nowak', password: 'password2345!123', apartmentId: 'nowak', name: 'Aleksandra (Nowak)', forcePasswordChange: true },
  { id: 'user4', username: 'toni_nowak', password: 'password2345!123', apartmentId: 'nowak', name: 'Toni (Nowak)', forcePasswordChange: true },
];

// Note: hardcodedUsers is now primarily for initial seeding in db.ts
// Runtime operations should use the database.

export const findUserByUsername = async (username: string): Promise<User | undefined> => {
  const db = await getDb();
  const user = await db.get<User>('SELECT * FROM users WHERE username = ?', username);
  // SQLite boolean is 0 or 1, convert to boolean
  if (user) {
    user.forcePasswordChange = Boolean(user.forcePasswordChange);
  }
  return user;
};

export const getUserById = async (userId: string): Promise<User | undefined> => {
  const db = await getDb();
  const user = await db.get<User>('SELECT * FROM users WHERE id = ?', userId);
   // SQLite boolean is 0 or 1, convert to boolean
  if (user) {
    user.forcePasswordChange = Boolean(user.forcePasswordChange);
  }
  return user;
};

export const updateUserPassword = async (userId: string, newPassword: string): Promise<User | undefined> => {
  const db = await getDb();
  const hashedPassword = await hash(newPassword, 10);

  const result = await db.run('UPDATE users SET password = ?, forcePasswordChange = 0 WHERE id = ?', hashedPassword, userId);

  if (result.changes && result.changes > 0) {
    return getUserById(userId); // Fetch the updated user
  }
  return undefined;
};
