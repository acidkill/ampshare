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
});
