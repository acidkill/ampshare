import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { hardcodedUsers } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    const db = await getDb();

    // Clear existing users
    await db.run("DELETE FROM users");
    console.log("Cleared existing users");

    // Re-seed with hardcoded users (with hashed passwords)
    for (const user of hardcodedUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await db.run(
        "INSERT INTO users (id, username, password, apartmentId, name, forcePasswordChange) VALUES (?, ?, ?, ?, ?, ?)",
        user.id,
        user.username,
        hashedPassword,
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Internal server error', error: errorMessage }, { status: 500 });
  }
}
