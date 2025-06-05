import type { User, SeedUser } from '@/types';
import { getDb } from './db'; // Assuming you have a db connection setup (e.g., in src/lib/db.ts)
import { hash, compare } from 'bcryptjs'; // For password hashing and comparison
import { v4 as uuidv4 } from 'uuid'; // Using uuid for user IDs if not using hardcoded ones
import { sign } from 'jsonwebtoken'; // For JWT generation

// This array should primarily be used for seeding the database, not for runtime user management.
// IMPORTANT: Passwords are hardcoded for demonstration. DO NOT use this in production.
// Add forcePasswordChange: true for all users to prompt for change on first login.
export const hardcodedUsers: SeedUser[] = [
  { id: 'user1', username: 'bente_stensvoll', password: 'password12341234!', apartmentId: 'stensvoll', name: 'Bente (Stensvoll)', role: 'user', forcePasswordChange: true },
  { id: 'user2', username: 'fredrik_stensvoll', password: 'password12341234!', apartmentId: 'stensvoll', name: 'Fredrik (Stensvoll)', role: 'user', forcePasswordChange: true },
  { id: 'user3', username: 'aleksandra_nowak', password: 'password2345!123', apartmentId: 'nowak', name: 'Aleksandra (Nowak)', role: 'user', forcePasswordChange: true },
  { id: 'user4', username: 'toni_nowak', password: 'password2345!123', apartmentId: 'nowak', name: 'Toni (Nowak)', role: 'user', forcePasswordChange: true },
];

// Note: hardcodedUsers is now primarily for initial seeding in db.ts
// Runtime operations should use the database.

export const findUserByUsername = async (username: string): Promise<User | undefined> => {
  const db = await getDb();
  if (!db) {
    console.error("Database connection not available in findUserByUsername");
    return undefined;
  }
  const user = await db.get<User>('SELECT * FROM users WHERE username = ?', username);
  // SQLite boolean is 0 or 1, convert to boolean
  if (user) {
    user.forcePasswordChange = Boolean(user.forcePasswordChange);
  }
  return user;
};

export const getUserById = async (userId: string): Promise<User | undefined> => {
  const db = await getDb();
  if (!db) {
    console.error("Database connection not available in getUserById");
    return undefined;
  }
  const user = await db.get<User>('SELECT * FROM users WHERE id = ?', userId);
   // SQLite boolean is 0 or 1, convert to boolean
  if (user) {
    user.forcePasswordChange = Boolean(user.forcePasswordChange);
  }
  return user;
};

export const updateUserPassword = async (userId: string, newPassword: string): Promise<User | undefined> => {
  const db = await getDb();
  if (!db) {
    console.error("Database connection not available in updateUserPassword");
    return undefined;
  }
  let hashedPassword;
  try {
    hashedPassword = await hash(newPassword, 10);
  } catch (error) {
    console.error("Error hashing password:", error);
    return undefined;
  }

  try {
    const result = await db.run('UPDATE users SET password = ?, forcePasswordChange = 0 WHERE id = ?', hashedPassword, userId);

    if (result.changes && result.changes > 0) {
      return getUserById(userId); // Fetch the updated user
    }
    return undefined; // User not found or not updated
  } catch (error) {
    console.error("Error updating user password in database:", error);
    return undefined;
  }
};

// Internal function to find a user by username, including their password hash.
// This should NOT be exported and is only for use by the login function.
const _findUserByUsernameWithPassword = async (username: string): Promise<(User & { password?: string }) | undefined> => {
  const db = await getDb();
  if (!db) {
    console.error("Database connection not available in _findUserByUsernameWithPassword");
    return undefined;
  }
  // Select password here, which is not done in the exported findUserByUsername
  const user = await db.get<User & { password?: string }>('SELECT * FROM users WHERE username = ?', username);
  if (user) {
    user.forcePasswordChange = Boolean(user.forcePasswordChange);
  }
  return user;
};

// TODO: Use a strong, environment-specific secret and manage it properly (e.g., via .env files)
const JWT_SECRET = 'your-super-secret-and-long-jwt-secret-key'; // Placeholder

export const login = async (username: string, passwordInput: string): Promise<{ user: User, token: string } | undefined> => {
  const userWithPassword = await _findUserByUsernameWithPassword(username);

  if (!userWithPassword || !userWithPassword.password) {
    // User not found or password not set in DB (should not happen for seeded users with password)
    return undefined;
  }

  try {
    const passwordsMatch = await compare(passwordInput, userWithPassword.password);
    if (passwordsMatch) {
      // IMPORTANT: Destructure user and explicitly exclude password before returning
      const { password, ...userWithoutPassword } = userWithPassword;
      
      // Generate JWT
      const payload = {
        id: userWithoutPassword.id,
        username: userWithoutPassword.username,
        role: userWithoutPassword.role,
        apartmentId: userWithoutPassword.apartmentId,
      };

      try {
        const token = sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
        return { user: userWithoutPassword, token };
      } catch (jwtError) {
        console.error("Error signing JWT:", jwtError);
        return undefined; // Failed to generate token
      }
    }
    return undefined; // Passwords don't match
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return undefined; // Error during comparison
  }
};

// Function to get all users associated with a specific apartment ID
export const getUsersByApartmentId = async (apartmentId: string): Promise<User[]> => {
  const db = await getDb();
  if (!db) {
    console.error("Database connection not available in getUsersByApartmentId");
    return []; // Return empty array if DB connection fails
  }
  try {
    const users = await db.all<User[]>('SELECT * FROM users WHERE apartmentId = ?', apartmentId);
    // SQLite boolean is 0 or 1 for forcePasswordChange, convert to boolean
    if (users) {
      return users.map(user => ({
        ...user,
        forcePasswordChange: Boolean(user.forcePasswordChange),
      }));
    }
    return []; // Return empty array if no users found
  } catch (error) {
    console.error(`Error fetching users for apartmentId ${apartmentId}:`, error);
    return []; // Return empty array on error
  }
};

