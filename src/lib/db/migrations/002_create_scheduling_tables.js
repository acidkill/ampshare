
// src/lib/db/migrations/002_create_scheduling_tables.js
console.log('Starting migration: Creating scheduling tables...');

// This migration script is designed to be idempotent.
// It uses 'CREATE TABLE IF NOT EXISTS' to avoid errors on re-runs.
// Foreign key constraints are included to maintain data integrity.

async function up(db) {
  console.log('Applying migration 002: Creating appliances, schedule_entries, and conflicts tables...');

  // Create Appliances Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS appliances (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      voltage INTEGER DEFAULT 240, -- Assuming default high voltage
      createdAt TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
  `);
  console.log('- "appliances" table created or already exists.');

  // Create Schedule Entries Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS schedule_entries (
      id TEXT PRIMARY KEY,
      day TEXT NOT NULL,
      time TEXT NOT NULL,
      userId TEXT NOT NULL,
      applianceId TEXT NOT NULL,
      apartmentId TEXT NOT NULL,
      createdAt TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      notes TEXT,
      FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
      FOREIGN KEY (applianceId) REFERENCES appliances(id) ON DELETE RESTRICT,
      FOREIGN KEY (apartmentId) REFERENCES apartments(id) ON DELETE CASCADE
    );
  `);
  // Add index for faster lookups by day, time, and apartment
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_schedule_lookup ON schedule_entries(day, time, apartmentId);`);
  console.log('- "schedule_entries" table created or already exists.');

  // Create Conflicts Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS conflicts (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK(type IN ('appliance_overlap', 'power_overload', 'other')),
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'unresolved' CHECK(status IN ('unresolved', 'resolved', 'ignored')),
      suggestedResolution TEXT,
      createdAt TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      resolvedAt TEXT,
      resolutionNotes TEXT
    );
  `);
  console.log('- "conflicts" table created or already exists.');
  
  // Create a joining table for the many-to-many relationship between conflicts and schedule_entries
  await db.exec(`
    CREATE TABLE IF NOT EXISTS conflict_schedule_entries (
      conflictId TEXT NOT NULL,
      scheduleEntryId TEXT NOT NULL,
      PRIMARY KEY (conflictId, scheduleEntryId),
      FOREIGN KEY (conflictId) REFERENCES conflicts(id) ON DELETE CASCADE,
      FOREIGN KEY (scheduleEntryId) REFERENCES schedule_entries(id) ON DELETE CASCADE
    );
  `);
  console.log('- "conflict_schedule_entries" joining table created or already exists.');

  // Seed Appliances Table
  // Using INSERT OR IGNORE to prevent errors if the appliances already exist.
  const appliances = [
    { id: 'car_charger', name: 'Car Charger', icon: '🔌' },
    { id: 'oven', name: 'Oven', icon: '🍳' },
    { id: 'washing_machine', name: 'Washing Machine', icon: '🧺' },
    { id: 'dryer', name: 'Dryer', icon: '💨' },
    { id: 'dishwasher', name: 'Dishwasher', icon: '🍽️' },
  ];

  console.log('Seeding appliances...');
  for (const appliance of appliances) {
    await db.run(
      'INSERT OR IGNORE INTO appliances (id, name, icon) VALUES (?, ?, ?)',
      appliance.id,
      appliance.name,
      appliance.icon
    );
  }
  console.log('- Appliances seeded successfully.');

  console.log('Migration 002 completed successfully.');
}

async function down(db) {
  console.log('Reverting migration 002...');
  await db.exec('DROP TABLE IF EXISTS conflict_schedule_entries;');
  await db.exec('DROP TABLE IF EXISTS conflicts;');
  await db.exec('DROP TABLE IF EXISTS schedule_entries;');
  await db.exec('DROP TABLE IF EXISTS appliances;');
  console.log('Migration 002 reverted successfully.');
}

module.exports = { up, down };
