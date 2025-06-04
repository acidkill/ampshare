import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { up as createSessionsTable } from './migrations/001_create_sessions_table';

// Define database types
type SQLiteDatabase = Database<sqlite3.Database, sqlite3.Statement>;

// Database connection instance
let dbInstance: SQLiteDatabase | null = null;

// Get the database path from environment variable or use default
const dbDir = process.env.DATABASE_DIR || path.join(process.cwd(), 'data');
const dbPath = process.env.DATABASE_PATH || path.join(dbDir, 'ampshare.db');

// Migration type
type Migration = {
  name: string;
  up: (db: sqlite3.Database) => Promise<void>;
};

// Ensure the database directory exists
if (!fs.existsSync(dbDir)) {
  try {
    fs.mkdirSync(dbDir, { recursive: true, mode: 0o755 });
    console.log(`✅ Created database directory: ${dbDir}`);
  } catch (error) {
    console.error('❌ Failed to create database directory:', error);
    throw error;
  }
}

/**
 * Creates all necessary database tables if they don't exist
 */
async function createTables(db: SQLiteDatabase): Promise<void> {
  console.log('Ensuring database tables exist...');
  
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        apartmentId TEXT,
        forcePasswordChange INTEGER DEFAULT 1,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        expiresAt TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS schedules (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        userId TEXT NOT NULL,
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        days TEXT NOT NULL,
        active INTEGER DEFAULT 1,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    
    console.log('✅ Database tables verified/created');
  } catch (error) {
    console.error('❌ Failed to create database tables:', error);
    throw error;
  }
}

/**
 * Runs database migrations
 */
async function runMigrations(db: SQLiteDatabase): Promise<void> {
  console.log('Starting database migrations...');
  const rawDb = (db as any).driver as sqlite3.Database;
  
  // Wrap in transaction for atomicity
  await db.exec('BEGIN TRANSACTION');
  
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

    let anyMigrationRun = false;

    // Run pending migrations
    for (const migration of migrations) {
      if (!completedMigrationNames.has(migration.name)) {
        anyMigrationRun = true;
        console.log(`Running migration: ${migration.name}`);
        
        try {
          await migration.up(rawDb);
          await db.run('INSERT INTO migrations (name) VALUES (?)', migration.name);
          console.log(`✅ Successfully completed migration: ${migration.name}`);
        } catch (error) {
          console.error(`❌ Migration ${migration.name} failed:`, error);
          await db.exec('ROLLBACK');
          throw error;
        }
      }
    }
    
    if (!anyMigrationRun) {
      console.log('No new migrations to run');
    }
    
    // Commit the transaction if we got here
    await db.exec('COMMIT');
    console.log('✅ All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration process failed, rolling back...');
    await db.exec('ROLLBACK').catch(rollbackError => {
      console.error('Error during rollback:', rollbackError);
    });
    throw error;
  }
}

/**
 * Seeds the database with initial data
 */
async function seedDatabase(): Promise<void> {
  const db = await getDb();
  
  try {
    // Check if we already have users
    const userCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM users');
    
    if (userCount && userCount.count === 0) {
      console.log('No users found, seeding admin user...');
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      await db.run(
        'INSERT INTO users (id, username, password, name, role, forcePasswordChange) VALUES (?, ?, ?, ?, ?, ?)',
        '1',
        'admin',
        hashedPassword,
        'Admin User',
        'admin',
        1
      );
      
      console.log('✅ Admin user created with username: admin');
      console.log('⚠️  Please change the default password on first login!');
    }
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
    throw error;
  }
}

/**
 * Gets the database instance, initializing it if necessary
 */
export async function getDb(): Promise<SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  console.log(`Initializing database at ${dbPath}...`);
  
  try {
    // Ensure database directory exists
    if (!fs.existsSync(dbDir)) {
      console.log(`Creating database directory: ${dbDir}`);
      fs.mkdirSync(dbDir, { recursive: true, mode: 0o755 });
      console.log(`✅ Created database directory: ${dbDir}`);
    }

    console.log(`Connecting to database at ${dbPath}...`);
    
    // Open the database connection
    const newDbInstance = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    
    console.log(`✅ Database connection established to ${dbPath}`);
    
    // Configure database settings
    await newDbInstance.exec('PRAGMA foreign_keys = ON;');
    await newDbInstance.exec('PRAGMA busy_timeout = 5000;');
    await newDbInstance.exec('PRAGMA journal_mode = WAL;');
    
    // Check database integrity
    const integrityCheck = await newDbInstance.get('PRAGMA integrity_check;');
    console.log('Database integrity check:', integrityCheck);
    
    // Set up database schema
    await createTables(newDbInstance);
    await runMigrations(newDbInstance);
    
    // Seed initial data if needed
    await seedDatabase();
    
    // Store the instance for future use
    dbInstance = newDbInstance;
    return dbInstance;
    
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Closes the database connection
 */
export async function closeDb(): Promise<void> {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
    console.log('Database connection closed');
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  await closeDb();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDb();
  process.exit(0);
});

export default { getDb, closeDb };