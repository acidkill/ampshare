import { Database } from 'sqlite3';

export const up = (db: Database) => {
  return new Promise<void>((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS sessions (
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
      console.log('Sessions table created or already exists');
      resolve();
    });
  });
};

export const down = (db: Database) => {
  return new Promise<void>((resolve, reject) => {
    db.run('DROP TABLE IF EXISTS sessions', (err) => {
      if (err) {
        console.error('Error dropping sessions table:', err);
        return reject(err);
      }
      console.log('Dropped sessions table');
      resolve();
    });
  });
};
