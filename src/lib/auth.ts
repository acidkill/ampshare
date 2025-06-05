import type { User, SeedUser } from '@/types';
// Import specific database functions instead of getDb directly
import { 
  getUserByUsername as dbGetUserByUsername,
  getUserById as dbGetUserById,
  updateUser as dbUpdateUser,
  getUserByUsernameWithPassword as dbGetUserByUsernameWithPassword,
  getAll as dbGetAll // For getUsersByApartmentId
} from './db'; 
import { hash, compare } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { sign } from 'jsonwebtoken';

// This array should primarily be used for seeding the database, not for runtime user management.
// IMPORTANT: Passwords are hardcoded for demonstration. DO NOT use this in production.
// Add forcePasswordChange: true for all users to prompt for change on first login.
export const hardcodedUsers: SeedUser[] = [
  { id: 'user1', username: 'bente_stensvoll', password: 'password12341234!', apartmentId: 'stensvoll', name: 'Bente (Stensvoll)', role: 'user', forcePasswordChange: true },
  { id: 'user2', username: 'fredrik_stensvoll', password: 'password12341234!', apartmentId: 'stensvoll', name: 'Fredrik (Stensvoll)', role: 'user', forcePasswordChange: true },
  { id: 'user3', username: 'aleksandra_nowak', password: 'password2345!123', apartmentId: 'nowak', name: 'Aleksandra (Nowak)', role: 'user', forcePasswordChange: true },
  { id: 'user4', username: 'toni_nowak', password: 'password2345!123', apartmentId: 'nowak', name: 'Toni (Nowak)', role: 'user', forcePasswordChange: true },
];

export const findUserByUsername = async (username: string): Promise<User | undefined> => {
  try {
    const user = await dbGetUserByUsername(username);
    // The dbGetUserByUsername from db.ts already maps DB user to User type, including boolean conversion
    return user;
  } catch (error) {
    console.error(`Error in findUserByUsername for ${username}:`, error);
    return undefined;
  }
};

export const getUserById = async (userId: string): Promise<User | undefined> => {
  try {
    const user = await dbGetUserById(userId);
    // The dbGetUserById from db.ts already maps DB user to User type
    return user;
  } catch (error) {
    console.error(`Error in getUserById for ${userId}:`, error);
    return undefined;
  }
};

export const updateUserPassword = async (userId: string, newPassword: string): Promise<User | undefined> => {
  try {
    // dbUpdateUser handles hashing and updating
    const updatedUser = await dbUpdateUser(userId, { 
      password: newPassword, 
      forcePasswordChange: false // Typically, password change resets this flag
    });
    return updatedUser;
  } catch (error) {
    console.error(`Error updating password for user ${userId}:`, error);
    return undefined;
  }
};

// Internal function to find a user by username, including their password hash.
const _findUserByUsernameWithPassword = async (username: string): Promise<(User & { passwordHash: string }) | undefined> => {
  try {
    // This function from db.ts returns the user with passwordHash
    return await dbGetUserByUsernameWithPassword(username);
  } catch (error) {
    console.error(`Error in _findUserByUsernameWithPassword for ${username}:`, error);
    return undefined;
  }
};

// Use environment variable for JWT_SECRET, with a fallback for local dev if not set.
// Ensure this is set in your .env.local or environment for production.
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-dev-secret-key-please-change-for-prod';
if (JWT_SECRET === 'your-default-dev-secret-key-please-change-for-prod' && process.env.NODE_ENV === 'production') {
  console.warn("WARNING: Using default JWT_SECRET in production. This is insecure. Set a strong JWT_SECRET environment variable.");
}


export const login = async (username: string, passwordInput: string): Promise<{ user: User, token: string } | undefined> => {
  const userWithPasswordHash = await _findUserByUsernameWithPassword(username);

  if (!userWithPasswordHash || !userWithPasswordHash.passwordHash) {
    console.log(`Login attempt: User ${username} not found or no password hash.`);
    return undefined;
  }

  try {
    const passwordsMatch = await compare(passwordInput, userWithPasswordHash.passwordHash);
    if (passwordsMatch) {
      // Exclude passwordHash from the user object returned to the client
      const { passwordHash, ...userWithoutPasswordHash } = userWithPasswordHash;
      
      const payload = {
        id: userWithoutPasswordHash.id,
        username: userWithoutPasswordHash.username,
        role: userWithoutPasswordHash.role,
        apartmentId: userWithoutPasswordHash.apartmentId,
      };

      try {
        const token = sign(payload, JWT_SECRET, { expiresIn: '1h' });
        return { user: userWithoutPasswordHash, token };
      } catch (jwtError) {
        console.error("Error signing JWT:", jwtError);
        return undefined;
      }
    }
    console.log(`Login attempt: Password mismatch for user ${username}.`);
    return undefined;
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return undefined;
  }
};

export const getUsersByApartmentId = async (apartmentId: string): Promise<User[]> => {
  try {
    // Assuming User type in db.ts already handles forcePasswordChange conversion if needed
    const users = await dbGetAll<User>('SELECT id, username, name, email, apartmentId, role, forcePasswordChange FROM Users WHERE apartmentId = ?', [apartmentId]);
    // Ensure forcePasswordChange is boolean
     return users.map(user => ({
        ...user,
        forcePasswordChange: Boolean(user.forcePasswordChange),
      }));
  } catch (error) {
    console.error(`Error fetching users for apartmentId ${apartmentId}:`, error);
    return [];
  }
};
