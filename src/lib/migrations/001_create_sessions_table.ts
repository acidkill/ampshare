import { Database } from 'sqlite';
import { Database as SQLite3Database } from 'sqlite3';

type SQLiteDatabaseType = Database<SQLite3Database, any>;

// Helper function to run a query and return a promise
async function runQuery(db: SQLiteDatabaseType, query: string, params: any[] = []): Promise<void> {
  try {
    await db.run(query, ...params);
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Query error:', { query, params, error: error.message });
    throw error;
  }
}

// Helper function to check if table exists
async function tableExists(db: SQLiteDatabaseType, tableName: string): Promise<boolean> {
  try {
    const result = await db.get<{ name: string } | undefined>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
      tableName
    );
    return !!result;
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error checking for table:', tableName, error.message);
    return false;
  }
}

export const up = async (db: SQLiteDatabaseType): Promise<void> => {
  console.log('Starting migration: Creating sessions table');
  
  try {
    // First, check if the table already exists
    const exists = await tableExists(db, 'sessions');

    if (exists) {
      console.log('Sessions table already exists, skipping creation');
      return;
    }

    console.log('Creating sessions table...');
    
    // Create the sessions table
    await db.exec(`
      CREATE TABLE sessions (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        expiresAt TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    console.log('Sessions table created successfully');

    // Create an index on userId for faster lookups
    await db.exec('CREATE INDEX IF NOT EXISTS idx_sessions_userId ON sessions(userId)');
    console.log('Created index on sessions.userId');

    console.log('Successfully completed sessions table migration');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

export const down = async (db: SQLiteDatabaseType): Promise<void> => {
  console.log('Starting to rollback sessions table');
  
  try {
    const exists = await tableExists(db, 'sessions');
    
    if (!exists) {
      console.log('Sessions table does not exist, nothing to drop');
      return;
    }
    
    console.log('Dropping sessions table...');
    
    try {
      await db.exec('DROP TABLE IF EXISTS sessions');
      console.log('Dropped sessions table');
      
      // Also drop the index if it exists
      await db.exec('DROP INDEX IF EXISTS idx_sessions_userId');
      console.log('Dropped sessions index');
      
      console.log('Successfully rolled back sessions table migration');
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error during rollback:', err.message);
      throw error;
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Rollback failed:', err.message);
    throw error;
  }
};
