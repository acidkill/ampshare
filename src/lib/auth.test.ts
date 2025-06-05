import { findUserByUsername, getUserById, updateUserPassword, getUsersByApartmentId, login, hardcodedUsers } from './auth';
import { getDb } from './db'; // This will be our mock
import { hash } from 'bcryptjs';
import type { User } from '@/types';

// Mock the db module
jest.mock('./db', () => ({
  getDb: jest.fn(),
}));

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

const mockUserNoForceChange: User = {
  id: 'user1',
  username: 'testuser1',
  name: 'Test User 1',
  email: 'test1@example.com',
  apartmentId: 'aptTest1',
  role: 'user',
  forcePasswordChange: false,
};

const mockUserWithForceChange: User = {
  id: 'user2',
  username: 'testuser2',
  name: 'Test User 2',
  email: 'test2@example.com',
  apartmentId: 'aptTest2',
  role: 'admin',
  forcePasswordChange: true,
};

// Cast getDb to its Jest Mock type for easier use
const mockedGetDb = getDb as jest.Mock;
const mockedHash = hash as jest.Mock;
const mockedBcryptCompare = require('bcryptjs').compare as jest.Mock;
const mockedJwtSign = require('jsonwebtoken').sign as jest.Mock;

describe('Auth Library', () => {
  let mockDbInstance: any;

  beforeEach(() => {
    // Reset mocks before each test
    mockedGetDb.mockReset();
    mockedHash.mockReset();
    if (mockedBcryptCompare) mockedBcryptCompare.mockReset(); // Reset compare mock
    if (mockedJwtSign) mockedJwtSign.mockReset(); // Reset JWT sign mock

    // Setup a default mock DB instance for most tests
    mockDbInstance = {
      get: jest.fn(),
      run: jest.fn(),
      all: jest.fn(), // Added for getUsersByApartmentId
    };
    mockedGetDb.mockReturnValue(Promise.resolve(mockDbInstance));
  });

  describe('findUserByUsername', () => {
    it('should return a user if username exists and forcePasswordChange is 0', async () => {
      // DB returns user with forcePasswordChange as 0 (number)
      mockDbInstance.get.mockResolvedValue({ ...mockUserNoForceChange, forcePasswordChange: 0 });
      const user = await findUserByUsername('testuser1');
      expect(mockDbInstance.get).toHaveBeenCalledWith('SELECT * FROM users WHERE username = ?', 'testuser1');
      expect(user).toEqual(mockUserNoForceChange); // Expect boolean false
      expect(user?.forcePasswordChange).toBe(false);
    });

    it('should return a user if username exists and forcePasswordChange is 1', async () => {
      // DB returns user with forcePasswordChange as 1 (number)
      mockDbInstance.get.mockResolvedValue({ ...mockUserWithForceChange, forcePasswordChange: 1 });
      const user = await findUserByUsername('testuser2');
      expect(mockDbInstance.get).toHaveBeenCalledWith('SELECT * FROM users WHERE username = ?', 'testuser2');
      expect(user).toEqual(mockUserWithForceChange); // Expect boolean true
      expect(user?.forcePasswordChange).toBe(true);
    });

    it('should return undefined if username does not exist', async () => {
      mockDbInstance.get.mockResolvedValue(undefined);
      const user = await findUserByUsername('nonexistent');
      expect(user).toBeUndefined();
    });

    it('should return undefined if getDb returns null (db connection fails)', async () => {
      mockedGetDb.mockReturnValue(Promise.resolve(null)); // Simulate DB connection failure
      const user = await findUserByUsername('anyuser');
      expect(user).toBeUndefined();
      // Check if console.error was called (optional, depends on if you want to assert logging)
      // This requires spying on console.error
    });
  });

  // More tests for getUserById and updateUserPassword will go here

  describe('getUserById', () => {
    it('should return a user if ID exists and forcePasswordChange is 0', async () => {
      mockDbInstance.get.mockResolvedValue({ ...mockUserNoForceChange, forcePasswordChange: 0 });
      const user = await getUserById('user1');
      expect(mockDbInstance.get).toHaveBeenCalledWith('SELECT * FROM users WHERE id = ?', 'user1');
      expect(user).toEqual(mockUserNoForceChange);
      expect(user?.forcePasswordChange).toBe(false);
    });

    it('should return a user if ID exists and forcePasswordChange is 1', async () => {
      mockDbInstance.get.mockResolvedValue({ ...mockUserWithForceChange, forcePasswordChange: 1 });
      const user = await getUserById('user2');
      expect(mockDbInstance.get).toHaveBeenCalledWith('SELECT * FROM users WHERE id = ?', 'user2');
      expect(user).toEqual(mockUserWithForceChange);
      expect(user?.forcePasswordChange).toBe(true);
    });

    it('should return undefined if ID does not exist', async () => {
      mockDbInstance.get.mockResolvedValue(undefined);
      const user = await getUserById('nonexistentid');
      expect(user).toBeUndefined();
    });

    it('should return undefined if getDb returns null (db connection fails)', async () => {
      mockedGetDb.mockReturnValue(Promise.resolve(null));
      const user = await getUserById('anyid');
      expect(user).toBeUndefined();
    });
  });

  describe('updateUserPassword', () => {
    const userIdToUpdate = 'user1';
    const newPassword = 'newSecurePassword123';
    const newHashedPassword = 'hashedNewSecurePassword123';

    beforeEach(() => {
      mockedHash.mockResolvedValue(newHashedPassword);
      // Ensure getUserById (called internally) also uses a fresh mock for its db call
      // For simplicity here, we assume a successful update leads to a successful fetch.
      // A more granular test could mock db.get for the internal getUserById separately.
      mockDbInstance.get.mockImplementation(async (query: string, id: string) => {
        if (query.includes('SELECT * FROM users WHERE id = ?') && id === userIdToUpdate) {
          return { ...mockUserNoForceChange, id: userIdToUpdate, forcePasswordChange: 0 };
        }
        return undefined;
      });
    });

    it('should update password, hash it, set forcePasswordChange to 0, and return updated user', async () => {
      mockDbInstance.run.mockResolvedValue({ changes: 1 });

      const updatedUser = await updateUserPassword(userIdToUpdate, newPassword);

      expect(mockedHash).toHaveBeenCalledWith(newPassword, 10);
      expect(mockDbInstance.run).toHaveBeenCalledWith(
        'UPDATE users SET password = ?, forcePasswordChange = 0 WHERE id = ?',
        newHashedPassword,
        userIdToUpdate
      );
      expect(mockDbInstance.get).toHaveBeenCalledWith('SELECT * FROM users WHERE id = ?', userIdToUpdate); // Check internal getUserById call
      expect(updatedUser).toBeDefined();
      expect(updatedUser?.id).toBe(userIdToUpdate);
      expect(updatedUser?.forcePasswordChange).toBe(false);
    });

    it('should return undefined if user ID to update is not found (db.run affects 0 rows)', async () => {
      mockDbInstance.run.mockResolvedValue({ changes: 0 }); // Simulate no user found/updated
      const updatedUser = await updateUserPassword('nonexistentUser', newPassword);
      expect(mockDbInstance.run).toHaveBeenCalledWith(
        'UPDATE users SET password = ?, forcePasswordChange = 0 WHERE id = ?',
        newHashedPassword,
        'nonexistentUser'
      );
      expect(updatedUser).toBeUndefined();
    });

    it('should return undefined if getDb returns null (db connection fails)', async () => {
      mockedGetDb.mockReturnValue(Promise.resolve(null));
      const updatedUser = await updateUserPassword(userIdToUpdate, newPassword);
      expect(mockedHash).not.toHaveBeenCalled(); // Hash shouldn't be called if DB fails first
      expect(mockDbInstance.run).not.toHaveBeenCalled();
      expect(updatedUser).toBeUndefined();
    });

    it('should return undefined if hashing fails', async () => {
      mockedHash.mockRejectedValue(new Error('Hashing failed'));
      const updatedUser = await updateUserPassword(userIdToUpdate, newPassword);
      expect(mockedHash).toHaveBeenCalledWith(newPassword, 10);
      expect(mockDbInstance.run).not.toHaveBeenCalled();
      expect(updatedUser).toBeUndefined();
      // You might want to assert that an error is logged or handled
    });

    it('should return undefined if db.run fails (e.g., database error during update)', async () => {
      mockDbInstance.run.mockRejectedValue(new Error('DB run error'));
      const updatedUser = await updateUserPassword(userIdToUpdate, newPassword);
      expect(mockedHash).toHaveBeenCalledWith(newPassword, 10);
      expect(mockDbInstance.run).toHaveBeenCalled();
      expect(updatedUser).toBeUndefined();
    });
  });

  describe('getUsersByApartmentId', () => {
    const mockUserApt1User1: User = {
      id: 'user10',
      username: 'apt1user1',
      name: 'Apt1 User1',
      apartmentId: 'apt1',
      role: 'user',
      forcePasswordChange: false,
    };

    const mockUserApt1User2: User = {
      id: 'user11',
      username: 'apt1user2',
      name: 'Apt1 User2',
      apartmentId: 'apt1',
      role: 'admin',
      forcePasswordChange: true,
    };

    it('should return users for a given apartmentId and convert forcePasswordChange', async () => {
      const dbUsers = [
        { ...mockUserApt1User1, forcePasswordChange: 0 }, // DB returns 0
        { ...mockUserApt1User2, forcePasswordChange: 1 }, // DB returns 1
      ];
      mockDbInstance.all.mockResolvedValue(dbUsers);

      const users = await getUsersByApartmentId('apt1');

      expect(mockDbInstance.all).toHaveBeenCalledWith('SELECT * FROM users WHERE apartmentId = ?', 'apt1');
      expect(users).toHaveLength(2);
      expect(users).toEqual([
        mockUserApt1User1, // Expect boolean false
        mockUserApt1User2, // Expect boolean true
      ]);
      expect(users[0].forcePasswordChange).toBe(false);
      expect(users[1].forcePasswordChange).toBe(true);
    });

    it('should return an empty array if no users are found for the apartmentId', async () => {
      mockDbInstance.all.mockResolvedValue([]);
      const users = await getUsersByApartmentId('nonexistent-apt');
      expect(users).toEqual([]);
    });

    it('should return an empty array if getDb returns null (db connection fails)', async () => {
      mockedGetDb.mockReturnValue(Promise.resolve(null));
      const users = await getUsersByApartmentId('apt1');
      expect(users).toEqual([]);
    });

    it('should return an empty array if db.all fails', async () => {
      mockDbInstance.all.mockRejectedValue(new Error('DB all error'));
      const users = await getUsersByApartmentId('apt1');
      expect(users).toEqual([]);
      // Optionally, check for console.error if critical
    });
  });

  describe('login', () => {
    const testUsername = 'testloginuser';
    const testPassword = 'password123';
    const storedHashedPassword = 'hashedPasswordExample';

    // User mock that _findUserByUsernameWithPassword would return (includes password hash)
    const mockUserForLoginDB: User & { password?: string } = {
      id: 'userLogin01',
      username: testUsername,
      name: 'Login Test User',
      email: 'login@example.com',
      apartmentId: 'aptLogin',
      role: 'user',
      forcePasswordChange: false,
      password: storedHashedPassword,
    };

    // Expected user object returned by login (excludes password)
    const expectedUserAfterLogin: User = {
      id: 'userLogin01',
      username: testUsername,
      name: 'Login Test User',
      email: 'login@example.com',
      apartmentId: 'aptLogin',
      role: 'user',
      forcePasswordChange: false,
    };

    it('should return user object and token on successful login', async () => {
      mockDbInstance.get.mockResolvedValue(mockUserForLoginDB); // Mock for _findUserByUsernameWithPassword
      mockedBcryptCompare.mockResolvedValue(true); // Simulate password match
      const expectedToken = 'mocked.jwt.token';
      mockedJwtSign.mockReturnValue(expectedToken);

      const result = await login(testUsername, testPassword);

      expect(mockDbInstance.get).toHaveBeenCalledWith('SELECT * FROM users WHERE username = ?', testUsername);
      expect(mockedBcryptCompare).toHaveBeenCalledWith(testPassword, storedHashedPassword);
      expect(mockedJwtSign).toHaveBeenCalledWith(
        {
          id: expectedUserAfterLogin.id,
          username: expectedUserAfterLogin.username,
          role: expectedUserAfterLogin.role,
          apartmentId: expectedUserAfterLogin.apartmentId,
        },
        'your-super-secret-and-long-jwt-secret-key', // This should match the secret in auth.ts
        { expiresIn: '1h' }
      );
      expect(result).toBeDefined();
      expect(result?.user).toEqual(expectedUserAfterLogin);
      expect(result?.token).toBe(expectedToken);
      expect(result?.user).not.toHaveProperty('password');
    });

    it('should return undefined if user is not found by _findUserByUsernameWithPassword', async () => {
      mockDbInstance.get.mockResolvedValue(undefined);
      const user = await login('unknownuser', testPassword);
      expect(user).toBeUndefined();
      expect(mockedBcryptCompare).not.toHaveBeenCalled();
    });

    it('should return undefined if user is found but has no password hash in DB', async () => {
      const userWithoutPasswordHash = { ...mockUserForLoginDB };
      delete userWithoutPasswordHash.password;
      mockDbInstance.get.mockResolvedValue(userWithoutPasswordHash);
      const user = await login(testUsername, testPassword);
      expect(user).toBeUndefined();
      expect(mockedBcryptCompare).not.toHaveBeenCalled();
    });

    it('should return undefined if passwords do not match', async () => {
      mockDbInstance.get.mockResolvedValue(mockUserForLoginDB);
      mockedBcryptCompare.mockResolvedValue(false); // Simulate password mismatch

      const user = await login(testUsername, 'wrongpassword');
      expect(user).toBeUndefined();
      expect(mockedBcryptCompare).toHaveBeenCalledWith('wrongpassword', storedHashedPassword);
    });

    it('should return undefined if getDb returns null (db connection fails for _findUserByUsernameWithPassword)', async () => {
      mockedGetDb.mockReturnValue(Promise.resolve(null)); // This affects _findUserByUsernameWithPassword
      const user = await login(testUsername, testPassword);
      expect(user).toBeUndefined();
      expect(mockedBcryptCompare).not.toHaveBeenCalled();
    });

    it('should return undefined if bcrypt.compare throws an error', async () => {
      mockDbInstance.get.mockResolvedValue(mockUserForLoginDB);
      mockedBcryptCompare.mockRejectedValue(new Error('Compare bcrypt error')); // Simulate error during compare

      const result = await login(testUsername, testPassword);
      expect(result).toBeUndefined();
    });

    it('should return undefined if JWT signing fails', async () => {
      mockDbInstance.get.mockResolvedValue(mockUserForLoginDB);
      mockedBcryptCompare.mockResolvedValue(true);
      mockedJwtSign.mockImplementation(() => { throw new Error('JWT sign error'); });

      const result = await login(testUsername, testPassword);
      expect(result).toBeUndefined();
      expect(mockedJwtSign).toHaveBeenCalled(); // Ensure it was called
    });
  });
});
