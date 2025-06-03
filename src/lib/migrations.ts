import { Database } from 'sqlite';

const migrations = [
  `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    apartmentId TEXT NOT NULL,
    name TEXT NOT NULL,
    forcePasswordChange INTEGER DEFAULT 0
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS schedules (
    id TEXT PRIMARY KEY,
    applianceType TEXT NOT NULL,
    startTime TEXT NOT NULL,
    endTime TEXT NOT NULL,
    dayOfWeek TEXT NOT NULL,
    apartmentId TEXT NOT NULL,
    userId TEXT NOT NULL,
    description TEXT,
    FOREIGN KEY (userId) REFERENCES users(id)
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS unplanned_requests (
    id TEXT PRIMARY KEY,
    requesterUserId TEXT NOT NULL,
    requesterApartmentId TEXT NOT NULL,
    targetApartmentId TEXT NOT NULL,
    applianceType TEXT NOT NULL,
    dayOfWeek TEXT NOT NULL,
    startTime TEXT NOT NULL,
    endTime TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL,
    requestedAt TEXT NOT NULL,
    respondedAt TEXT,
    responderUserId TEXT,
    FOREIGN KEY (requesterUserId) REFERENCES users(id),
    FOREIGN KEY (responderUserId) REFERENCES users(id)
  );
  `,
];

export async function runMigrations(db: Database) {
  for (let i = 0; i < migrations.length; i++) {
    try {
      await db.exec(migrations[i]);
      console.log(`Migration ${i + 1} applied successfully.`);
    } catch (error) {
      console.error(`Error applying migration ${i + 1}:`, error);
      // Depending on your error handling strategy, you might want to throw or exit here
    }
  }
}
