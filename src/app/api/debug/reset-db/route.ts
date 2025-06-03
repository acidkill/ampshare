import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { hardcodedUsers } from '@/lib/auth';

export async function POST() {
  try {
    const db = await getDb();
    
    // Clear existing users
    await db.run("DELETE FROM users");
    console.log("Cleared existing users");
    
    // Re-seed with hardcoded users
    for (const user of hardcodedUsers) {
      await db.run(
        "INSERT INTO users (id, username, password, apartmentId, name, forcePasswordChange) VALUES (?, ?, ?, ?, ?, ?)",
        user.id,
        user.username,
        user.password,
        user.apartmentId,
        user.name,
        user.forcePasswordChange ? 1 : 0
      );
      console.log(`Re-seeded user: ${user.username}`);
    }

    const count = await db.get("SELECT COUNT(*) as count FROM users");
    
    return NextResponse.json({
      message: 'Database reset successfully',
      userCount: count.count
    });
  } catch (error) {
    console.error('Error resetting database:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}