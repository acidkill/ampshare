import { Database } from 'sqlite3';

// Helper function to run a query and return a promise
function runQuery(db: Database, query: string, params: any[] = []): Promise<void> {
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

export const up = async (db: Database): Promise<void> => {
  try {
    console.log('Starting migration: Creating sessions table');
    
    // First, check if the table already exists
    const tableExists = await new Promise<boolean>((resolve) => {
      db.get(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='sessions'",
        (err, row) => {
          if (err) {
            console.error('Error checking for sessions table:', err);
            return resolve(false);
          }
          resolve(!!row);
        }
      );
    });

    if (tableExists) {
      console.log('Sessions table already exists, skipping creation');
      return;
    }

    // Create the sessions table
    await runQuery(
      db,
      `CREATE TABLE sessions (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        expiresAt TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )`
    );

    // Create an index on userId for faster lookups
    await runQuery(
      db,
      'CREATE INDEX IF NOT EXISTS idx_sessions_userId ON sessions(userId)'
    );

    console.log('Successfully created sessions table');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

export const down = async (db: Database): Promise<void> => {
  try {
    console.log('Dropping sessions table');
    await runQuery(db, 'DROP TABLE IF EXISTS sessions');
    console.log('Successfully dropped sessions table');
  } catch (error) {
    console.error('Error dropping sessions table:', error);
    throw error;
  }
};
