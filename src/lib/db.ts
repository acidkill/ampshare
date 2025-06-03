import Database from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

// Get the database path from environment variables
// Use a default path if not set, though it's better to always set it
const dbPath = process.env.DATABASE_PATH || '/app/data/ampshare.db';

// Ensure the directory exists
const dbDir = path.dirname(dbPath);
import fs from 'fs';
if (!fs.existsSync(dbDir)) {
  try {
    fs.mkdirSync(dbDir, { recursive: true });
  } catch (error) {
    console.error('Error creating database directory:', error);
    throw error;
  }
}

let dbInstance: Awaited<ReturnType<typeof open>> | null = null;

// Add error logging for database operations
const handleDbError = (error: Error) => {
  console.error('Database error:', error);
  console.error('Database path:', dbPath);
  console.error('Database directory:', dbDir);
  throw error;
};

export const getDb = async () => {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await open({
    filename: dbPath,
    driver: Database.Database,
  });

  // Run migrations or schema creation here
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL, -- Store hashed passwords
      apartmentId TEXT,
      name TEXT,
      forcePasswordChange BOOLEAN DEFAULT 0
    );

    -- Add other tables here (e.g., for schedules)
    CREATE TABLE IF NOT EXISTS schedules (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      day TEXT NOT NULL,
      time TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  console.log(`Database initialized at ${dbPath}`);

  // Optional: Seed initial users if the users table is empty
  const userCount = await dbInstance.get('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    console.log('Seeding initial users...');
    const { hardcodedUsers } = await import('./auth'); // Import hardcoded users for seeding
    const bcrypt = await import('bcryptjs'); // Import bcrypt for hashing seed passwords

    const insertStmt = await dbInstance.prepare(
      'INSERT INTO users (id, username, password, apartmentId, name, forcePasswordChange) VALUES (?, ?, ?, ?, ?, ?)'
    );

    for (const user of hardcodedUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10); // Hash the hardcoded password
      await insertStmt.run(user.id, user.username, hashedPassword, user.apartmentId, user.name, user.forcePasswordChange ? 1 : 0);
    }
    await insertStmt.finalize();
    console.log('Initial users seeded.');
  }

  return dbInstance;
};

// Call getDb to initialize the database on server startup
getDb().catch(console.error);