import { Database as SQLite3Database } from 'sqlite3';
import { Database as SqliteDatabase } from 'sqlite';

type SQLiteDatabaseType = SQLite3Database | SqliteDatabase<any>;

// Helper function to run a query and return a promise
async function runQuery(db: SQLiteDatabaseType, query: string, params: any[] = []): Promise<void> {
  try {
    if ('all' in db) {
      // This is a sqlite Database instance
      await (db as SqliteDatabase).run(query, ...params);
    } else {
      // This is a raw sqlite3.Database instance
      await new Promise<void>((resolve, reject) => {
        (db as SQLite3Database).run(query, params, function(err: Error | null) {
          if (err) {
            console.error('Query error:', { query, params, error: err });
            return reject(err);
          }
          resolve();
        });
      });
    }
  } catch (error) {
    console.error('Error in runQuery:', { query, error });
    throw error;
  }
}

// Helper function to check if table exists
async function tableExists(db: SQLiteDatabaseType, tableName: string): Promise<boolean> {
  try {
    if ('all' in db) {
      // This is a sqlite Database instance
      const result = await (db as SqliteDatabase).get<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
        tableName
      );
      return !!result;
    } else {
      // This is a raw sqlite3.Database instance
      return new Promise((resolve) => {
        (db as SQLite3Database).get(
          "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
          [tableName],
          (err: Error | null, row: { name: string } | undefined) => {
            if (err) {
              console.error('Error checking for table:', tableName, err);
              return resolve(false);
            }
            resolve(!!row);
          }
        );
      });
    }
  } catch (error) {
    console.error('Error in tableExists:', { tableName, error });
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
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        expiresAt TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    
    await runQuery(db, createTableSQL);
    console.log('Sessions table created successfully');

    // Create an index on userId for faster lookups
    await runQuery(db, 'CREATE INDEX IF NOT EXISTS idx_sessions_userId ON sessions(userId)');
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
    
    // Drop the index first if it exists
    await runQuery(db, 'DROP INDEX IF EXISTS idx_sessions_userId');
    console.log('Dropped sessions index');
    
    // Then drop the table
    await runQuery(db, 'DROP TABLE IF EXISTS sessions');
    console.log('Dropped sessions table');
    
    console.log('Successfully rolled back sessions table migration');
  } catch (error) {
    console.error('Rollback failed:', error);
    throw error;
  }
};
