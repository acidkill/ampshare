import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { runMigrations } from './migrations';
import { hardcodedUsers } from './auth'; // Import hardcoded users for initial seeding
import { User } from '@/types';

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (db) {
    return db;
  }

  db = await open({
    filename: '/app/data/ampshare.db', // Path inside the Docker container, mounted to a persistent volume
    driver: sqlite3.Database,
  });

  await runMigrations(db);
  await seedInitialUsers(db);

  return db;
}

async function seedInitialUsers(db: Database) {
  try {
    const count = await db.get("SELECT COUNT(*) as count FROM users");
    if (count.count === 0) {
      console.log("Seeding initial users...");
      for (const user of hardcodedUsers) {
        // IMPORTANT: In a production application, passwords should ALWAYS be hashed (e.g., using bcrypt).
        // For this demonstration, they are stored as plain text.
        await db.run(
          "INSERT INTO users (id, username, password, apartmentId, name, forcePasswordChange) VALUES (?, ?, ?, ?, ?, ?)",
          user.id,
          user.username,
          user.password,
          user.apartmentId,
          user.name,
          user.forcePasswordChange ? 1 : 0 // SQLite stores booleans as 0 or 1
        );
      }
      console.log("Initial users seeded successfully.");
    } else {
      console.log("Users already exist, skipping seeding.");
    }
  } catch (error) {
    console.error("Error seeding initial users:", error);
  }
}
