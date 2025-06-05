import type { User, SeedUser, JWTPayload } from '@/types';
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
import { sign, verify } from 'jsonwebtoken'; // Added verify

// This array should primarily be used for seeding the database, not for runtime user management.
// IMPORTANT: Passwords are hardcoded for demonstration. DO NOT use this in production.
// Add forcePasswordChange: true for all users to prompt for change on first login.
export const hardcodedUsers: SeedUser[] = [
  { id: 'user1', username: 'bente_stensvoll', password: 'password12341234!', apartmentId: 'stensvoll', name: 'Bente (Stensvoll)', role: 'tenant', forcePasswordChange: true },
  { id: 'user2', username: 'fredrik_stensvoll', password: 'password12341234!', apartmentId: 'stensvoll', name: 'Fredrik (Stensvoll)', role: 'tenant', forcePasswordChange: true },
  { id: 'user3', username: 'aleksandra_nowak', password: 'password2345!123', apartmentId: 'nowak', name: 'Aleksandra (Nowak)', role: 'tenant', forcePasswordChange: true },
  { id: 'user4', username: 'toni_nowak', password: 'password2345!123', apartmentId: 'nowak', name: 'Toni (Nowak)', role: 'tenant', forcePasswordChange: true },
];

export const findUserByUsername = async (username: string): Promise<User | undefined> => {
  try {
    const user = await dbGetUserByUsername(username);
    return user;
  } catch (error) {
    console.error(`Error in findUserByUsername for ${username}:`, error);
    return undefined;
  }
};

export const getUserById = async (userId: string): Promise<User | undefined> => {
  try {
    const user = await dbGetUserById(userId);
    return user;
  } catch (error) {
    console.error(`Error in getUserById for ${userId}:`, error);
    return undefined;
  }
};

export const updateUserPassword = async (userId: string, newPassword: string): Promise<User | undefined> => {
  try {
    const updatedUser = await dbUpdateUser(userId, { 
      password: newPassword, 
      forcePasswordChange: false
    });
    return updatedUser;
  } catch (error) {
    console.error(`Error updating password for user ${userId}:`, error);
    return undefined;
  }
};

const _findUserByUsernameWithPassword = async (username: string): Promise<(User & { passwordHash: string }) | undefined> => {
  try {
    return await dbGetUserByUsernameWithPassword(username);
  } catch (error) {
    console.error(`Error in _findUserByUsernameWithPassword for ${username}:`, error);
    return undefined;
  }
};

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
      const { passwordHash, ...userWithoutPasswordHash } = userWithPasswordHash;
      const payload: JWTPayload = {
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
    const users = await dbGetAll<User>('SELECT id, username, name, email, apartmentId, role, forcePasswordChange FROM Users WHERE apartmentId = ?', [apartmentId]);
    return users.map(user => ({
      ...user,
      forcePasswordChange: Boolean(user.forcePasswordChange),
    }));
  } catch (error) {
    console.error(`Error fetching users for apartmentId ${apartmentId}:`, error);
    return [];
  }
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = verify(token, JWT_SECRET) as JWTPayload;
    // Optional: Add more validation here, e.g., check if user still exists in DB
    return decoded;
  } catch (error: any) {
    // It's good practice to log only the error message for security reasons
    // if (error && error.message) {
    //   console.error('Invalid token:', error.message);
    // } else {
    //   console.error('Invalid token: Unknown error');
    // }
    return null;
  }
};
