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

// Helper function to check if table exists
function tableExists(db: Database, tableName: string): Promise<boolean> {
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

export const up = async (db: Database): Promise<void> => {
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
    await new Promise<void>((resolve, reject) => {
      db.run(`
        CREATE TABLE sessions (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          expiresAt TEXT NOT NULL,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          console.error('Error creating sessions table:', err);
          return reject(err);
        }
        console.log('Sessions table created successfully');
        resolve();
      });
    });

    // Create an index on userId for faster lookups
    await new Promise<void>((resolve, reject) => {
      db.run('CREATE INDEX IF NOT EXISTS idx_sessions_userId ON sessions(userId)', (err) => {
        if (err) {
          console.error('Error creating index on sessions.userId:', err);
          return reject(err);
        }
        console.log('Created index on sessions.userId');
        resolve();
      });
    });

    console.log('Successfully completed sessions table migration');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

export const down = async (db: Database): Promise<void> => {
  console.log('Starting to rollback sessions table');
  
  try {
    const exists = await tableExists(db, 'sessions');
    
    if (!exists) {
      console.log('Sessions table does not exist, nothing to drop');
      return;
    }
    
    console.log('Dropping sessions table...');
    
    await new Promise<void>((resolve, reject) => {
      db.run('DROP TABLE IF EXISTS sessions', (err) => {
        if (err) {
          console.error('Error dropping sessions table:', err);
          return reject(err);
        }
        console.log('Successfully dropped sessions table');
        resolve();
      });
    });
    
    console.log('Successfully completed sessions table rollback');
  } catch (error) {
    console.error('Error during rollback:', error);
    throw error;
  }
};
