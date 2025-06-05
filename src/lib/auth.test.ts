import { findUserByUsername, getUserById, updateUserPassword, hardcodedUsers } from './auth';
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
  compare: jest.fn(), // Though not directly used in functions we test now, good to have
}));

const mockUserNoForceChange: User = {
  id: 'user1',
  username: 'testuser1',
  email: 'test1@example.com',
  forcePasswordChange: false,
};

const mockUserWithForceChange: User = {
  id: 'user2',
  username: 'testuser2',
  email: 'test2@example.com',
  forcePasswordChange: true,
};

// Cast getDb to its Jest Mock type for easier use
const mockedGetDb = getDb as jest.Mock;
const mockedHash = hash as jest.Mock;

describe('Auth Library', () => {
  let mockDbInstance: any;

  beforeEach(() => {
    // Reset mocks before each test
    mockedGetDb.mockReset();
    mockedHash.mockReset();

    // Setup a default mock DB instance for most tests
    mockDbInstance = {
      get: jest.fn(),
      run: jest.fn(),
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
});
