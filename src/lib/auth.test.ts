
import { findUserByUsername, getUserById, updateUserPassword, getUsersByApartmentId, login, verifyToken } from './auth'; // Added verifyToken
// Import the new DB functions to be mocked
import {
  getUserByUsername as dbGetUserByUsername,
  getUserById as dbGetUserById,
  updateUser as dbUpdateUser,
  getUserByUsernameWithPassword as dbGetUserByUsernameWithPassword,
  getAll as dbGetAll
} from './db';
import { hash, compare } from 'bcryptjs';
import type { User, JWTPayload } from '@/types'; // Added JWTPayload
import { sign, verify } from 'jsonwebtoken'; // Added verify for mocking

// Mock the specific db functions that auth.ts uses
jest.mock('./db', () => ({
  getUserByUsername: jest.fn(),
  getUserById: jest.fn(),
  updateUser: jest.fn(),
  getUserByUsernameWithPassword: jest.fn(),
  getAll: jest.fn(),
}));

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(), // Added mock for verify
}));

const mockUserNoForceChange: User = {
  id: 'user1',
  username: 'testuser1',
  name: 'Test User 1',
  email: 'test1@example.com',
  apartmentId: 'aptTest1',
  role: 'tenant', // Updated role
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

// Cast mocked DB functions to their Jest Mock type
const mockedDbGetUserByUsername = dbGetUserByUsername as jest.Mock;
const mockedDbGetUserById = dbGetUserById as jest.Mock;
const mockedDbUpdateUser = dbUpdateUser as jest.Mock;
const mockedDbGetUserByUsernameWithPassword = dbGetUserByUsernameWithPassword as jest.Mock;
const mockedDbGetAll = dbGetAll as jest.Mock;

const mockedBcryptHash = hash as jest.Mock;
const mockedBcryptCompare = compare as jest.Mock;
const mockedJwtSign = sign as jest.Mock;
const mockedJwtVerify = verify as jest.Mock; // Added mock for verify

const testJwtSecret = process.env.JWT_SECRET || 'your-default-dev-secret-key-please-change-for-prod';

describe('Auth Library', () => {
  beforeEach(() => {
    mockedDbGetUserByUsername.mockReset();
    mockedDbGetUserById.mockReset();
    mockedDbUpdateUser.mockReset();
    mockedDbGetUserByUsernameWithPassword.mockReset();
    mockedDbGetAll.mockReset();
    mockedBcryptHash.mockReset();
    mockedBcryptCompare.mockReset();
    mockedJwtSign.mockReset();
    mockedJwtVerify.mockReset(); // Reset verify mock
  });

  // ... existing describe blocks for findUserByUsername, getUserById, etc. ...
  describe('findUserByUsername', () => {
    it('should return a user if username exists', async () => {
      mockedDbGetUserByUsername.mockResolvedValue(mockUserNoForceChange);
      const user = await findUserByUsername('testuser1');
      expect(mockedDbGetUserByUsername).toHaveBeenCalledWith('testuser1');
      expect(user).toEqual(mockUserNoForceChange);
    });

    it('should return undefined if username does not exist', async () => {
      mockedDbGetUserByUsername.mockResolvedValue(undefined);
      const user = await findUserByUsername('nonexistent');
      expect(user).toBeUndefined();
    });

    it('should return undefined if db function throws', async () => {
      mockedDbGetUserByUsername.mockRejectedValue(new Error('DB error'));
      const user = await findUserByUsername('anyuser');
      expect(user).toBeUndefined();
    });
  });

  describe('getUserById', () => {
    it('should return a user if ID exists', async () => {
      mockedDbGetUserById.mockResolvedValue(mockUserWithForceChange);
      const user = await getUserById('user2');
      expect(mockedDbGetUserById).toHaveBeenCalledWith('user2');
      expect(user).toEqual(mockUserWithForceChange);
    });

    it('should return undefined if ID does not exist', async () => {
      mockedDbGetUserById.mockResolvedValue(undefined);
      const user = await getUserById('nonexistentid');
      expect(user).toBeUndefined();
    });

     it('should return undefined if db function throws', async () => {
      mockedDbGetUserById.mockRejectedValue(new Error('DB error'));
      const user = await getUserById('anyid');
      expect(user).toBeUndefined();
    });
  });

  describe('updateUserPassword', () => {
    const userIdToUpdate = 'user1';
    const newPassword = 'newSecurePassword123';
    const updatedUserMock = { ...mockUserNoForceChange, role: 'tenant', forcePasswordChange: false };

    it('should update password and return updated user', async () => {
      mockedDbUpdateUser.mockResolvedValue(updatedUserMock);
      const result = await updateUserPassword(userIdToUpdate, newPassword);
      expect(mockedDbUpdateUser).toHaveBeenCalledWith(userIdToUpdate, {
        password: newPassword,
        forcePasswordChange: false,
      });
      expect(result).toEqual(updatedUserMock);
    });

    it('should return undefined if dbUpdateUser fails or user not found', async () => {
      mockedDbUpdateUser.mockResolvedValue(undefined);
      const result = await updateUserPassword('nonexistentUser', newPassword);
      expect(result).toBeUndefined();
    });

    it('should return undefined if dbUpdateUser throws an error', async () => {
        mockedDbUpdateUser.mockRejectedValue(new Error('DB update error'));
        const result = await updateUserPassword(userIdToUpdate, newPassword);
        expect(result).toBeUndefined();
    });
  });

  describe('getUsersByApartmentId', () => {
    const mockUserApt1User1: User = { ...mockUserNoForceChange, id: 'user10', apartmentId: 'apt1', role: 'tenant' };
    const mockUserApt1User2: User = { ...mockUserWithForceChange, id: 'user11', apartmentId: 'apt1' };

    it('should return users for a given apartmentId', async () => {
      const dbUsers = [mockUserApt1User1, mockUserApt1User2];
      mockedDbGetAll.mockResolvedValue(dbUsers);
      const users = await getUsersByApartmentId('apt1');
      expect(mockedDbGetAll).toHaveBeenCalledWith('SELECT id, username, name, email, apartmentId, role, forcePasswordChange FROM Users WHERE apartmentId = ?', ['apt1']);
      expect(users).toEqual(dbUsers.map(u => ({...u, forcePasswordChange: Boolean(u.forcePasswordChange)})));
    });

    it('should return an empty array if no users are found', async () => {
      mockedDbGetAll.mockResolvedValue([]);
      const users = await getUsersByApartmentId('nonexistent-apt');
      expect(users).toEqual([]);
    });

    it('should return an empty array if dbGetAll throws', async () => {
      mockedDbGetAll.mockRejectedValue(new Error('DB getAll error'));
      const users = await getUsersByApartmentId('apt1');
      expect(users).toEqual([]);
    });
  });

  describe('login', () => {
    const testUsername = 'testloginuser';
    const testPassword = 'password123';
    const storedHashedPassword = 'hashedPasswordExample';

    const mockUserForLoginDB: User & { passwordHash: string } = {
      id: 'userLogin01',
      username: testUsername,
      name: 'Login Test User',
      email: 'login@example.com',
      apartmentId: 'aptLogin',
      role: 'tenant', // Updated role
      forcePasswordChange: false,
      passwordHash: storedHashedPassword,
    };

    const expectedUserAfterLogin: User = {
      id: 'userLogin01',
      username: testUsername,
      name: 'Login Test User',
      email: 'login@example.com',
      apartmentId: 'aptLogin',
      role: 'tenant', // Updated role
      forcePasswordChange: false,
    };

    it('should return user object and token on successful login', async () => {
      mockedDbGetUserByUsernameWithPassword.mockResolvedValue(mockUserForLoginDB);
      mockedBcryptCompare.mockResolvedValue(true);
      const expectedToken = 'mocked.jwt.token';
      mockedJwtSign.mockReturnValue(expectedToken);

      const result = await login(testUsername, testPassword);

      expect(mockedDbGetUserByUsernameWithPassword).toHaveBeenCalledWith(testUsername);
      expect(mockedBcryptCompare).toHaveBeenCalledWith(testPassword, storedHashedPassword);
      const expectedPayload: JWTPayload = {
        id: expectedUserAfterLogin.id,
        username: expectedUserAfterLogin.username,
        role: expectedUserAfterLogin.role,
        apartmentId: expectedUserAfterLogin.apartmentId,
      };
      expect(mockedJwtSign).toHaveBeenCalledWith(expectedPayload, testJwtSecret, { expiresIn: '1h' });
      expect(result).toBeDefined();
      expect(result?.user).toEqual(expectedUserAfterLogin);
      expect(result?.token).toBe(expectedToken);
      expect(result?.user).not.toHaveProperty('passwordHash');
    });

    it('should return undefined if user is not found', async () => {
      mockedDbGetUserByUsernameWithPassword.mockResolvedValue(undefined);
      const result = await login('unknownuser', testPassword);
      expect(result).toBeUndefined();
      expect(mockedBcryptCompare).not.toHaveBeenCalled();
    });

    it('should return undefined if user has no password hash', async () => {
      const userWithoutHash = { ...mockUserForLoginDB, passwordHash: undefined as any };
      mockedDbGetUserByUsernameWithPassword.mockResolvedValue(userWithoutHash);
      const result = await login(testUsername, testPassword);
      expect(result).toBeUndefined();
      expect(mockedBcryptCompare).not.toHaveBeenCalled();
    });

    it('should return undefined if passwords do not match', async () => {
      mockedDbGetUserByUsernameWithPassword.mockResolvedValue(mockUserForLoginDB);
      mockedBcryptCompare.mockResolvedValue(false);
      const result = await login(testUsername, 'wrongpassword');
      expect(result).toBeUndefined();
      expect(mockedBcryptCompare).toHaveBeenCalledWith('wrongpassword', storedHashedPassword);
    });

    it('should return undefined if _findUserByUsernameWithPassword throws', async () => {
        mockedDbGetUserByUsernameWithPassword.mockRejectedValue(new Error('DB error for find with hash'));
        const result = await login(testUsername, testPassword);
        expect(result).toBeUndefined();
    });

    it('should return undefined if bcrypt.compare throws', async () => {
      mockedDbGetUserByUsernameWithPassword.mockResolvedValue(mockUserForLoginDB);
      mockedBcryptCompare.mockRejectedValue(new Error('Compare bcrypt error'));
      const result = await login(testUsername, testPassword);
      expect(result).toBeUndefined();
    });

    it('should return undefined if JWT signing fails', async () => {
      mockedDbGetUserByUsernameWithPassword.mockResolvedValue(mockUserForLoginDB);
      mockedBcryptCompare.mockResolvedValue(true);
      mockedJwtSign.mockImplementation(() => { throw new Error('JWT sign error'); });
      const result = await login(testUsername, testPassword);
      expect(result).toBeUndefined();
      expect(mockedJwtSign).toHaveBeenCalled();
    });
  });

  describe('verifyToken', () => {
    const mockPayload: JWTPayload = {
      id: 'user123',
      username: 'verifier',
      role: 'tenant',
      apartmentId: 'aptVerify',
    };
    const mockToken = 'valid.mock.token';

    it('should return decoded payload for a valid token', () => {
      mockedJwtVerify.mockReturnValue(mockPayload);
      const result = verifyToken(mockToken);
      expect(mockedJwtVerify).toHaveBeenCalledWith(mockToken, testJwtSecret);
      expect(result).toEqual(mockPayload);
    });

    it('should return null if token is invalid or verification fails', () => {
      mockedJwtVerify.mockImplementation(() => { throw new Error('Invalid signature'); });
      const result = verifyToken('invalid.token');
      expect(result).toBeNull();
    });

    it('should return null if token is expired (verify throws specific error)', () => {
      const expiredError = new Error('jwt expired');
      (expiredError as any).name = 'TokenExpiredError';
      mockedJwtVerify.mockImplementation(() => { throw expiredError; });
      const result = verifyToken('expired.token');
      expect(result).toBeNull();
    });
  });
});
