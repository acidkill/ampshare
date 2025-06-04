import { Database } from 'sqlite3';

type SQLiteDatabaseType = Database;

// Helper function to run a query and return a promise
function runQuery(db: SQLiteDatabaseType, query: string, params: any[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) {
        console.error('Query error:', { query, params, error: err });
        return reject(err);
      }
      resolve();
    });
  });
}

// Helper function to check if table exists
function tableExists(db: SQLiteDatabaseType, tableName: string): Promise<boolean> {
  return new Promise((resolve) => {
    db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
      [tableName],
      (err, row) => {
        if (err) {
          console.error('Error checking for table:', tableName, err);
          return resolve(false);
        }
        resolve(!!row);
      }
    );
  });
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
    
    await new Promise<void>((resolve, reject) => {
      // Drop the index first if it exists
      db.run('DROP INDEX IF EXISTS idx_sessions_userId', (err) => {
        if (err) {
          console.error('Error dropping index:', err);
          return reject(err);
        }
        console.log('Dropped sessions index');
        
        // Then drop the table
        db.run('DROP TABLE IF EXISTS sessions', (err) => {
          if (err) {
            console.error('Error dropping sessions table:', err);
            return reject(err);
          }
          console.log('Dropped sessions table');
          resolve();
        });
      });
    });
    
    console.log('Successfully rolled back sessions table migration');
  } catch (error) {
    console.error('Rollback failed:', error);
    throw error;
  }
};
