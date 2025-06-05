
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

// Define the path for the SQLite database file
// Store it in a `data` directory at the project root for persistence
const dbPath = process.env.NODE_ENV === 'test' 
  ? ':memory:' 
  : path.join(process.cwd(), 'data', 'ampshare.db');

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

const schema = `
  CREATE TABLE IF NOT EXISTS Apartments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS Users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    apartmentId TEXT NOT NULL,
    role TEXT NOT NULL, -- 'admin' or 'tenant'
    passwordHash TEXT NOT NULL, -- Store hashed passwords, not plaintext
    forcePasswordChange BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (apartmentId) REFERENCES Apartments(id)
  );

  CREATE TABLE IF NOT EXISTS Appliances (
    id TEXT PRIMARY KEY, -- e.g., 'car_charger', 'oven'
    name TEXT NOT NULL,   -- e.g., 'Car Charger', 'Oven'
    icon TEXT -- e.g., '🔌', '🍳'
  );

  CREATE TABLE IF NOT EXISTS ScheduleEntries (
    id TEXT PRIMARY KEY,
    day TEXT NOT NULL, -- e.g., 'Mon', 'Tue'
    time TEXT NOT NULL, -- e.g., '09:00', '14:00'
    applianceId TEXT NOT NULL,
    userId TEXT NOT NULL,
    apartmentId TEXT NOT NULL,
    createdAt TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updatedAt TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (applianceId) REFERENCES Appliances(id),
    FOREIGN KEY (userId) REFERENCES Users(id),
    FOREIGN KEY (apartmentId) REFERENCES Apartments(id)
  );

  CREATE TABLE IF NOT EXISTS Conflicts (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- 'appliance_overlap', 'power_overload', 'other'
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unresolved', -- 'unresolved', 'resolved', 'ignored'
    suggestedResolution TEXT,
    createdAt TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    resolvedAt TEXT,
    resolutionNotes TEXT
  );

  CREATE TABLE IF NOT EXISTS ConflictScheduleEntries (
    conflictId TEXT NOT NULL,
    scheduleEntryId TEXT NOT NULL,
    PRIMARY KEY (conflictId, scheduleEntryId),
    FOREIGN KEY (conflictId) REFERENCES Conflicts(id) ON DELETE CASCADE,
    FOREIGN KEY (scheduleEntryId) REFERENCES ScheduleEntries(id) ON DELETE CASCADE
  );
`;

async function initializeDb(): Promise<Database<sqlite3.Database, sqlite3.Statement>> {
  const newDb = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Ensure the data directory exists for file-based db
  if (dbPath !== ':memory:') {
    const fs = await import('fs');
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  console.log(`Connected to SQLite database at ${dbPath}`);
  await newDb.exec(schema);
  console.log('Database schema initialized');
  return newDb;
}

export async function getDb(): Promise<Database<sqlite3.Database, sqlite3.Statement>> {
  if (!db) {
    db = await initializeDb();
  }
  return db;
}

// Generic helper functions
export async function getOne<T>(query: string, params?: any): Promise<T | undefined> {
  const currentDb = await getDb();
  return currentDb.get<T>(query, params);
}

export async function getAll<T>(query: string, params?: any): Promise<T[]> {
  const currentDb = await getDb();
  return currentDb.all<T[]>(query, params);
}

export async function runNonSelect(query: string, params?: any): Promise<sqlite3.RunResult> {
  const currentDb = await getDb();
  return currentDb.run(query, params);
}

// Basic CRUD operations will be added below for each entity
import { v4 as uuidv4 } from 'uuid';
import { Apartment, User, Appliance, ScheduleEntry, Conflict } from '../types'; // Import all types

// --- Apartment CRUD ---
export async function createApartment(apartmentData: Omit<Apartment, 'id'> & { id?: string }): Promise<Apartment> {
  if (!apartmentData.name) {
    throw new Error('Apartment name is required');
  }
  const id = apartmentData.id || uuidv4();
  const newApartment: Apartment = { ...apartmentData, id };
  
  await runNonSelect(
    'INSERT INTO Apartments (id, name) VALUES (?, ?)',
    [newApartment.id, newApartment.name]
  );
  return newApartment;
}

export async function getApartmentById(id: string): Promise<Apartment | undefined> {
  return getOne<Apartment>('SELECT * FROM Apartments WHERE id = ?', [id]);
}

export async function getAllApartments(): Promise<Apartment[]> {
  return getAll<Apartment>('SELECT * FROM Apartments');
}

export async function updateApartment(id: string, updates: Partial<Omit<Apartment, 'id'>>): Promise<Apartment | undefined> {
  if (Object.keys(updates).length === 0) {
    return getApartmentById(id); // No changes
  }
  // We only allow updating the name for now
  if (updates.name === undefined) {
     throw new Error('Only apartment name can be updated, and it was not provided.');
  }
  if (typeof updates.name !== 'string' || updates.name.trim() === '') {
    throw new Error('Apartment name must be a non-empty string.');
  }

  const result = await runNonSelect(
    'UPDATE Apartments SET name = ? WHERE id = ?',
    [updates.name, id]
  );

  if (result.changes === 0) {
    return undefined; // Apartment not found or no changes made
  }
  return getApartmentById(id);
}

export async function deleteApartment(id: string): Promise<boolean> {
  // Consider implications: what happens to users in this apartment?
  // For now, simple delete. Add cascading deletes or checks later if needed.
  const result = await runNonSelect('DELETE FROM Apartments WHERE id = ?', [id]);
  return result.changes > 0;
}

// --- User CRUD --- will be added next
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

// Helper to get count of tenant users in an apartment
export async function getTenantUsersCountByApartmentId(apartmentId: string): Promise<number> {
  const result = await getOne<{ count: number }>(
    "SELECT COUNT(*) as count FROM Users WHERE apartmentId = ? AND role = 'tenant'", 
    [apartmentId]
  );
  return result?.count || 0;
}

// Helper to convert DB user (with passwordHash) to User (without passwordHash)
function mapDbUserToUser(dbUser: any): User {
  const { passwordHash, ...user } = dbUser;
  return user as User;
}

export async function createUser(userData: Omit<User, 'id'> & { password?: string, id?: string }): Promise<User> {
  if (!userData.username || !userData.name || !userData.apartmentId || !userData.role || !userData.password) {
    throw new Error('Username, name, apartmentId, role, and password are required for creating a user.');
  }

  const existingApartment = await getApartmentById(userData.apartmentId);
  if (!existingApartment) {
    throw new Error(`Apartment with id ${userData.apartmentId} not found.`);
  }

  // Check tenant limit for the apartment if the new user is a tenant
  if (userData.role === 'tenant') {
    const tenantCount = await getTenantUsersCountByApartmentId(userData.apartmentId);
    if (tenantCount >= 2) {
      throw new Error(`Apartment ${userData.apartmentId} already has the maximum number of tenants (2).`);
    }
  }

  const passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);
  const id = userData.id || uuidv4();
  const newUserDb = {
    id,
    username: userData.username,
    name: userData.name,
    email: userData.email || null,
    apartmentId: userData.apartmentId,
    role: userData.role,
    passwordHash,
    forcePasswordChange: userData.forcePasswordChange || false,
  };

  try {
    await runNonSelect(
      'INSERT INTO Users (id, username, name, email, apartmentId, role, passwordHash, forcePasswordChange) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [newUserDb.id, newUserDb.username, newUserDb.name, newUserDb.email, newUserDb.apartmentId, newUserDb.role, newUserDb.passwordHash, newUserDb.forcePasswordChange]
    );
    return mapDbUserToUser(newUserDb);
  } catch (error: any) {
    if (error.message && error.message.includes('UNIQUE constraint failed: Users.username')) {
      throw new Error(`Username '${userData.username}' already exists.`);
    }
    if (error.message && error.message.includes('UNIQUE constraint failed: Users.email') && userData.email) {
      throw new Error(`Email '${userData.email}' already exists.`);
    }
    throw error;
  }
}

export async function getUserById(id: string): Promise<User | undefined> {
  const dbUser = await getOne<any>('SELECT * FROM Users WHERE id = ?', [id]);
  return dbUser ? mapDbUserToUser(dbUser) : undefined;
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  const dbUser = await getOne<any>('SELECT * FROM Users WHERE username = ?', [username]);
  return dbUser ? mapDbUserToUser(dbUser) : undefined;
}

// For authentication, we need a function that returns the user with the password hash
export async function getUserByUsernameWithPassword(username: string): Promise<(User & { passwordHash: string }) | undefined> {
  return getOne<(User & { passwordHash: string })>('SELECT * FROM Users WHERE username = ?', [username]);
}


export async function getAllUsers(): Promise<User[]> {
  const dbUsers = await getAll<any>('SELECT * FROM Users');
  return dbUsers.map(mapDbUserToUser);
}

export async function updateUser(id: string, updates: Partial<Omit<User, 'id' | 'username' | 'apartmentId'> & { password?: string, apartmentId?: string }>): Promise<User | undefined> {
  if (Object.keys(updates).length === 0) {
    return getUserById(id);
  }

  const existingUser = await getOne<any>('SELECT * FROM Users WHERE id = ?', [id]);
  if (!existingUser) {
    return undefined; // User not found
  }

  // Check tenant limit if changing apartment or role to tenant
  if (updates.apartmentId && updates.apartmentId !== existingUser.apartmentId) {
    // User is changing apartments. Check new apartment capacity if user is/will be a tenant.
    const futureRole = updates.role || existingUser.role;
    if (futureRole === 'tenant') {
      const tenantCountInNewApartment = await getTenantUsersCountByApartmentId(updates.apartmentId);
      if (tenantCountInNewApartment >= 2) {
        throw new Error(`Target apartment ${updates.apartmentId} already has the maximum number of tenants (2).`);
      }
    }
  } else if (updates.role === 'tenant' && existingUser.role !== 'tenant') {
    // User is changing role to tenant in the current (or explicitly same) apartment.
    // updates.apartmentId is either undefined or same as existingUser.apartmentId
    const currentApartmentIdToCheck = updates.apartmentId || existingUser.apartmentId;
    const tenantCountInCurrentApartment = await getTenantUsersCountByApartmentId(currentApartmentIdToCheck);
    if (tenantCountInCurrentApartment >= 2) {
      throw new Error(`Apartment ${currentApartmentIdToCheck} already has the maximum number of tenants (2) and cannot accommodate another tenant by role change.`);
    }
  }

  const fieldsToUpdate: string[] = [];
  const valuesToUpdate: any[] = [];

  if (updates.name && updates.name !== existingUser.name) {
    fieldsToUpdate.push('name = ?');
    valuesToUpdate.push(updates.name);
  }
  if (updates.email && updates.email !== existingUser.email) {
    fieldsToUpdate.push('email = ?');
    valuesToUpdate.push(updates.email);
  }
  if (updates.role && updates.role !== existingUser.role) {
    fieldsToUpdate.push('role = ?');
    valuesToUpdate.push(updates.role);
  }
  if (updates.forcePasswordChange !== undefined && updates.forcePasswordChange !== existingUser.forcePasswordChange) {
    fieldsToUpdate.push('forcePasswordChange = ?');
    valuesToUpdate.push(updates.forcePasswordChange);
  }
  if (updates.password) {
    const newPasswordHash = await bcrypt.hash(updates.password, SALT_ROUNDS);
    fieldsToUpdate.push('passwordHash = ?');
    valuesToUpdate.push(newPasswordHash);
    // Typically, if a password is updated, forcePasswordChange should be set to false
    if (updates.forcePasswordChange === undefined && existingUser.forcePasswordChange) {
        fieldsToUpdate.push('forcePasswordChange = ?');
        valuesToUpdate.push(false);
    }
  }
  if (updates.apartmentId && updates.apartmentId !== existingUser.apartmentId) {
    const existingApartment = await getApartmentById(updates.apartmentId);
    if (!existingApartment) {
        throw new Error(`Apartment with id ${updates.apartmentId} not found.`);
    }
    fieldsToUpdate.push('apartmentId = ?');
    valuesToUpdate.push(updates.apartmentId);
  }

  if (fieldsToUpdate.length === 0) {
    return getUserById(id); // No actual changes to supported fields
  }

  const query = `UPDATE Users SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
  valuesToUpdate.push(id);

  try {
    const result = await runNonSelect(query, valuesToUpdate);
    if (result.changes === 0) {
      return undefined; 
    }
    return getUserById(id);
  } catch (error: any) {
    if (error.message && error.message.includes('UNIQUE constraint failed: Users.email') && updates.email) {
      throw new Error(`Email '${updates.email}' already exists for another user.`);
    }
    throw error;
  }
}

export async function deleteUser(id: string): Promise<boolean> {
  // Consider implications: what happens to their schedule entries or conflicts?
  const result = await runNonSelect('DELETE FROM Users WHERE id = ?', [id]);
  return result.changes > 0;
}

// --- Appliance CRUD --- will be added next
export async function createAppliance(applianceData: Omit<Appliance, 'id'> & { id?: string }): Promise<Appliance> {
  if (!applianceData.name) {
    throw new Error('Appliance name is required.');
  }
  const id = applianceData.id || uuidv4(); // Allow pre-defined IDs, e.g., from a fixed list
  const newAppliance: Appliance = { ...applianceData, id };

  try {
    await runNonSelect(
      'INSERT INTO Appliances (id, name, icon) VALUES (?, ?, ?)',
      [newAppliance.id, newAppliance.name, newAppliance.icon || null]
    );
    return newAppliance;
  } catch (error: any) {
    if (error.message && error.message.includes('UNIQUE constraint failed: Appliances.id')) {
        throw new Error(`Appliance with id '${newAppliance.id}' already exists.`);
    }
    throw error;
  }
}

export async function getApplianceById(id: string): Promise<Appliance | undefined> {
  return getOne<Appliance>('SELECT * FROM Appliances WHERE id = ?', [id]);
}

export async function getAllAppliances(): Promise<Appliance[]> {
  return getAll<Appliance>('SELECT * FROM Appliances');
}

export async function updateAppliance(id: string, updates: Partial<Omit<Appliance, 'id'>>): Promise<Appliance | undefined> {
  if (Object.keys(updates).length === 0) {
    return getApplianceById(id);
  }

  const existingAppliance = await getApplianceById(id);
  if (!existingAppliance) {
    return undefined; // Appliance not found
  }

  const fieldsToUpdate: string[] = [];
  const valuesToUpdate: any[] = [];

  if (updates.name && updates.name !== existingAppliance.name) {
    fieldsToUpdate.push('name = ?');
    valuesToUpdate.push(updates.name);
  }
  if (updates.icon !== undefined && updates.icon !== existingAppliance.icon) {
    fieldsToUpdate.push('icon = ?');
    valuesToUpdate.push(updates.icon || null);
  }

  if (fieldsToUpdate.length === 0) {
    return existingAppliance;
  }

  const query = `UPDATE Appliances SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
  valuesToUpdate.push(id);

  const result = await runNonSelect(query, valuesToUpdate);
  if (result.changes === 0) {
    return undefined;
  }
  return getApplianceById(id);
}

export async function deleteAppliance(id: string): Promise<boolean> {
  // Consider implications for ScheduleEntries using this appliance
  const result = await runNonSelect('DELETE FROM Appliances WHERE id = ?', [id]);
  return result.changes > 0;
}

// --- ScheduleEntry CRUD --- will be added next
export async function createScheduleEntry(entryData: Omit<ScheduleEntry, 'id'> & { id?: string }): Promise<ScheduleEntry> {
  if (!entryData.day || !entryData.time || !entryData.applianceId || !entryData.userId || !entryData.apartmentId) {
    throw new Error('Day, time, applianceId, userId, and apartmentId are required for a schedule entry.');
  }
  // Validate foreign keys exist
  const [user, apartment, appliance] = await Promise.all([
    getUserById(entryData.userId),
    getApartmentById(entryData.apartmentId),
    getApplianceById(entryData.applianceId)
  ]);
  if (!user) throw new Error(`User with id ${entryData.userId} not found.`);
  if (!apartment) throw new Error(`Apartment with id ${entryData.apartmentId} not found.`);
  if (!appliance) throw new Error(`Appliance with id ${entryData.applianceId} not found.`);

  // Basic validation for day and time format (can be more robust)
  if (!['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].includes(entryData.day)) {
    throw new Error('Invalid day format. Must be one of Mon, Tue, Wed, Thu, Fri, Sat, Sun.');
  }
  if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(entryData.time)) {
    throw new Error('Invalid time format. Must be HH:MM (e.g., 09:00).');
  }

  const id = entryData.id || uuidv4();
  const newEntry: ScheduleEntry & { createdAt?: string, updatedAt?: string} = {
     ...entryData, 
     id,
  };

  const result = await runNonSelect(
    'INSERT INTO ScheduleEntries (id, day, time, applianceId, userId, apartmentId) VALUES (?, ?, ?, ?, ?, ?)',
    [newEntry.id, newEntry.day, newEntry.time, newEntry.applianceId, newEntry.userId, newEntry.apartmentId]
  );
  // Fetch the entry to get default values like createdAt, updatedAt
  return getScheduleEntryById(id) as Promise<ScheduleEntry>; 
}

export async function getScheduleEntryById(id: string): Promise<ScheduleEntry | undefined> {
  return getOne<ScheduleEntry>('SELECT * FROM ScheduleEntries WHERE id = ?', [id]);
}

export async function getAllScheduleEntries(): Promise<ScheduleEntry[]> {
  return getAll<ScheduleEntry>('SELECT * FROM ScheduleEntries ORDER BY createdAt DESC');
}

export async function getScheduleEntriesByApartment(apartmentId: string): Promise<ScheduleEntry[]> {
  return getAll<ScheduleEntry>('SELECT * FROM ScheduleEntries WHERE apartmentId = ? ORDER BY day, time', [apartmentId]);
}

export async function getScheduleEntriesByUser(userId: string): Promise<ScheduleEntry[]> {
  return getAll<ScheduleEntry>('SELECT * FROM ScheduleEntries WHERE userId = ? ORDER BY day, time', [userId]);
}

// More specific queries can be added, e.g., by date range, appliance, etc.

export async function updateScheduleEntry(id: string, updates: Partial<Omit<ScheduleEntry, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'apartmentId'>>): Promise<ScheduleEntry | undefined> {
  if (Object.keys(updates).length === 0) {
    return getScheduleEntryById(id);
  }

  const existingEntry = await getScheduleEntryById(id);
  if (!existingEntry) {
    return undefined; // Entry not found
  }

  const fieldsToUpdate: string[] = [];
  const valuesToUpdate: any[] = [];

  if (updates.day && updates.day !== existingEntry.day) {
    if (!['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].includes(updates.day)) {
        throw new Error('Invalid day format.');
    }
    fieldsToUpdate.push('day = ?');
    valuesToUpdate.push(updates.day);
  }
  if (updates.time && updates.time !== existingEntry.time) {
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(updates.time)) {
        throw new Error('Invalid time format.');
    }
    fieldsToUpdate.push('time = ?');
    valuesToUpdate.push(updates.time);
  }
  if (updates.applianceId && updates.applianceId !== existingEntry.applianceId) {
    const appliance = await getApplianceById(updates.applianceId);
    if (!appliance) throw new Error(`Appliance with id ${updates.applianceId} not found.`);
    fieldsToUpdate.push('applianceId = ?');
    valuesToUpdate.push(updates.applianceId);
  }
  
  if (fieldsToUpdate.length === 0) {
    return existingEntry;
  }

  fieldsToUpdate.push('updatedAt = strftime(\'%Y-%m-%dT%H:%M:%fZ\', \'now\')')

  const query = `UPDATE ScheduleEntries SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
  valuesToUpdate.push(id);

  const result = await runNonSelect(query, valuesToUpdate);
  if (result.changes === 0) {
    return undefined;
  }
  return getScheduleEntryById(id);
}

export async function deleteScheduleEntry(id: string): Promise<boolean> {
  // Also need to handle related conflicts if any
  await runNonSelect('DELETE FROM ConflictScheduleEntries WHERE scheduleEntryId = ?', [id]);
  const result = await runNonSelect('DELETE FROM ScheduleEntries WHERE id = ?', [id]);
  return result.changes > 0;
}

// --- Conflict CRUD --- will be added next
// Helper function to map DB conflict to Conflict type, including scheduleEntryIds
async function mapDbConflictToConflict(dbConflict: any): Promise<Conflict> {
  const scheduleEntryLinks = await getAll<{ scheduleEntryId: string }>(
    'SELECT scheduleEntryId FROM ConflictScheduleEntries WHERE conflictId = ?',
    [dbConflict.id]
  );
  const scheduleEntryIds = scheduleEntryLinks.map(link => link.scheduleEntryId);
  return {
    id: dbConflict.id,
    type: dbConflict.type,
    description: dbConflict.description,
    scheduleEntryIds,
    suggestedResolution: dbConflict.suggestedResolution,
    status: dbConflict.status,
    createdAt: dbConflict.createdAt,
    resolvedAt: dbConflict.resolvedAt,
    resolutionNotes: dbConflict.resolutionNotes,
  };
}

export async function createConflict(conflictData: Omit<Conflict, 'id' | 'createdAt' | 'resolvedAt'> & { id?: string, scheduleEntryIds: string[] }): Promise<Conflict> {
  if (!conflictData.type || !conflictData.description || !conflictData.status || !conflictData.scheduleEntryIds || conflictData.scheduleEntryIds.length === 0) {
    throw new Error('Type, description, status, and at least one scheduleEntryId are required for creating a conflict.');
  }

  // Validate that all scheduleEntryIds exist
  for (const entryId of conflictData.scheduleEntryIds) {
    const entry = await getScheduleEntryById(entryId);
    if (!entry) {
      throw new Error(`ScheduleEntry with id ${entryId} not found.`);
    }
  }

  const id = conflictData.id || uuidv4();
  const newConflictForDb = {
    id,
    type: conflictData.type,
    description: conflictData.description,
    suggestedResolution: conflictData.suggestedResolution || null,
    status: conflictData.status,
    resolutionNotes: conflictData.resolutionNotes || null,
  };

  // Use a transaction to ensure atomicity for Conflicts and ConflictScheduleEntries
  const currentDb = await getDb();
  try {
    await currentDb.run('BEGIN TRANSACTION');
    await currentDb.run(
      'INSERT INTO Conflicts (id, type, description, suggestedResolution, status, resolutionNotes) VALUES (?, ?, ?, ?, ?, ?)',
      [newConflictForDb.id, newConflictForDb.type, newConflictForDb.description, newConflictForDb.suggestedResolution, newConflictForDb.status, newConflictForDb.resolutionNotes]
    );

    for (const scheduleEntryId of conflictData.scheduleEntryIds) {
      await currentDb.run(
        'INSERT INTO ConflictScheduleEntries (conflictId, scheduleEntryId) VALUES (?, ?)',
        [id, scheduleEntryId]
      );
    }
    await currentDb.run('COMMIT');
    
    // Fetch the created conflict to get all fields including defaults and join table data
    const fullConflict = await getConflictById(id);
    if (!fullConflict) throw new Error('Failed to retrieve created conflict.');
    return fullConflict;

  } catch (error) {
    await currentDb.run('ROLLBACK');
    console.error('Failed to create conflict:', error);
    throw error;
  }
}

export async function getConflictById(id: string): Promise<Conflict | undefined> {
  const dbConflict = await getOne<any>('SELECT * FROM Conflicts WHERE id = ?', [id]);
  return dbConflict ? mapDbConflictToConflict(dbConflict) : undefined;
}

export async function getAllConflicts(): Promise<Conflict[]> {
  const dbConflicts = await getAll<any>('SELECT * FROM Conflicts ORDER BY createdAt DESC');
  return Promise.all(dbConflicts.map(mapDbConflictToConflict));
}

export async function updateConflict(id: string, updates: Partial<Omit<Conflict, 'id' | 'createdAt' | 'scheduleEntryIds'> & { scheduleEntryIds?: string[] }>): Promise<Conflict | undefined> {
  if (Object.keys(updates).length === 0) {
    return getConflictById(id);
  }

  const existingConflict = await getConflictById(id);
  if (!existingConflict) {
    return undefined; // Conflict not found
  }

  const fieldsToUpdate: string[] = [];
  const valuesToUpdate: any[] = [];

  if (updates.type && updates.type !== existingConflict.type) {
    fieldsToUpdate.push('type = ?');
    valuesToUpdate.push(updates.type);
  }
  if (updates.description && updates.description !== existingConflict.description) {
    fieldsToUpdate.push('description = ?');
    valuesToUpdate.push(updates.description);
  }
  if (updates.suggestedResolution !== undefined && updates.suggestedResolution !== existingConflict.suggestedResolution) {
    fieldsToUpdate.push('suggestedResolution = ?');
    valuesToUpdate.push(updates.suggestedResolution || null);
  }
  if (updates.status && updates.status !== existingConflict.status) {
    fieldsToUpdate.push('status = ?');
    valuesToUpdate.push(updates.status);
    if (updates.status === 'resolved' || updates.status === 'ignored') {
      fieldsToUpdate.push('resolvedAt = strftime(\'%Y-%m-%dT%H:%M:%fZ\', \'now\')');
    } else {
      fieldsToUpdate.push('resolvedAt = NULL');
    }
  }
  if (updates.resolutionNotes !== undefined && updates.resolutionNotes !== existingConflict.resolutionNotes) {
    fieldsToUpdate.push('resolutionNotes = ?');
    valuesToUpdate.push(updates.resolutionNotes || null);
  }

  const currentDb = await getDb();
  try {
    await currentDb.run('BEGIN TRANSACTION');

    if (fieldsToUpdate.length > 0) {
      const query = `UPDATE Conflicts SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
      const finalValues = [...valuesToUpdate, id];
      const result = await currentDb.run(query, finalValues);
      if (result.changes === 0 && !updates.scheduleEntryIds) { // if only scheduleEntryIds are updated, changes might be 0 here
        // This might happen if the conflict itself wasn't found, or no values actually changed.
        // Consider how to handle this; for now, if no actual field changes and no entry ID changes, we might assume no update needed.
      }
    }

    // Handle scheduleEntryIds update
    if (updates.scheduleEntryIds) {
        // Validate new scheduleEntryIds
        for (const entryId of updates.scheduleEntryIds) {
            const entry = await getScheduleEntryById(entryId);
            if (!entry) {
                throw new Error(`ScheduleEntry with id ${entryId} not found during conflict update.`);
            }
        }
        // Simple approach: delete existing and insert new ones
        await currentDb.run('DELETE FROM ConflictScheduleEntries WHERE conflictId = ?', [id]);
        for (const scheduleEntryId of updates.scheduleEntryIds) {
            await currentDb.run(
            'INSERT INTO ConflictScheduleEntries (conflictId, scheduleEntryId) VALUES (?, ?)',
            [id, scheduleEntryId]
            );
        }
    }

    await currentDb.run('COMMIT');
    return getConflictById(id);

  } catch (error) {
    await currentDb.run('ROLLBACK');
    console.error(`Failed to update conflict ${id}:`, error);
    throw error;
  }
}

export async function deleteConflict(id: string): Promise<boolean> {
  const currentDb = await getDb();
  try {
    await currentDb.run('BEGIN TRANSACTION');
    // ConflictScheduleEntries are deleted by ON DELETE CASCADE
    const result = await currentDb.run('DELETE FROM Conflicts WHERE id = ?', [id]);
    await currentDb.run('COMMIT');
    return result.changes > 0;
  } catch (error) {
    await currentDb.run('ROLLBACK');
    throw error;
  }
}





