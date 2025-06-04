import sqlite3 from 'sqlite3';
import { open, Database as SQLiteDatabase } from 'sqlite';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';
import { up as createSessionsTable } from './migrations/001_create_sessions_table';

const execAsync = promisify(exec);

// Type for migration function
type MigrationFunction = (db: sqlite3.Database) => Promise<void>;

// Type for migration definition
interface Migration {
  name: string;
  up: MigrationFunction;
}

// Get the database path from environment variables
const dbPath = process.env.DATABASE_PATH || '/app/data/ampshare.db';
const dbDir = path.dirname(dbPath);

// Ensure the directory exists
if (!fs.existsSync(dbDir)) {
  try {
    fs.mkdirSync(dbDir, { recursive: true, mode: 0o755 });
  } catch (error) {
    console.error('Error creating database directory:', error);
    throw error;
  }
}

// Ensure the database file exists
if (!fs.existsSync(dbPath)) {
  try {
    // Create an empty file
    fs.writeFileSync(dbPath, '');
  } catch (error) {
    console.error('Error creating database file:', error);
    throw error;
  }
}

// Log database path for debugging
console.log('Database path:', dbPath);

let dbInstance: Awaited<ReturnType<typeof open>> | null = null;

// Add error logging for database operations
const handleDbError = (error: Error) => {
  console.error('Database error:', error);
  console.error('Database path:', dbPath);
  console.error('Database directory:', dbDir);
  throw error;
};

async function runMigrations(db: SQLiteDatabase) {
  try {
    // Create migrations table if it doesn't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        run_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get completed migrations
    const completedMigrations = await db.all<{ name: string }>(
      'SELECT name FROM migrations ORDER BY name'
    );
    
    const completedMigrationNames = new Set<string>();
    if (Array.isArray(completedMigrations)) {
      completedMigrations.forEach(m => {
        if (m && typeof m.name === 'string') {
          completedMigrationNames.add(m.name);
        }
      });
    }

    // Define migrations to run
    const migrations: Migration[] = [
      { name: '001_create_sessions_table', up: createSessionsTable }
    ];

    // Run pending migrations
    for (const migration of migrations) {
      if (!completedMigrationNames.has(migration.name)) {
        console.log(`Running migration: ${migration.name}`);
        await migration.up((db as any).driver as sqlite3.Database);
        await db.run('INSERT INTO migrations (name) VALUES (?)', migration.name);
        console.log(`Completed migration: ${migration.name}`);
      }
    }
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

export const getDb = async () => {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Create tables if they don't exist
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      apartmentId TEXT,
      name TEXT,
      forcePasswordChange BOOLEAN DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      applianceType TEXT,
      startTime TEXT,
      endTime TEXT,
      dayOfWeek TEXT,
      apartmentId TEXT,
      description TEXT,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  console.log(`Database initialized at ${dbPath}`);

  // Run migrations
  await runMigrations(dbInstance);

  // Optional: Seed initial users if the users table is empty
  const userCount = await dbInstance.get('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    console.log('Seeding initial users...');
    const { hardcodedUsers } = await import('./auth');
    const bcrypt = await import('bcryptjs');

    const insertStmt = await dbInstance.prepare(
      'INSERT INTO users (id, username, password, apartmentId, name, forcePasswordChange) VALUES (?, ?, ?, ?, ?, ?)'
    );

    for (const user of hardcodedUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await insertStmt.run(user.id, user.username, hashedPassword, user.apartmentId, user.name, user.forcePasswordChange ? 1 : 0);
    }
    await insertStmt.finalize();
    console.log('Initial users seeded.');
  }

  return dbInstance;
};

// Call getDb to initialize the database on server startup
getDb().catch(console.error);
