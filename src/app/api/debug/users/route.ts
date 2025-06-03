import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();
    
    const users = await db.all(
      "SELECT id, username, apartmentId, name, forcePasswordChange, password FROM users"
    );

    // Convert forcePasswordChange from 0/1 to boolean for all users
    const usersWithBooleans = users.map(user => ({
      ...user,
      forcePasswordChange: Boolean(user.forcePasswordChange)
    }));

    return NextResponse.json({
      count: users.length,
      users: usersWithBooleans
    });
  } catch (error) {
    console.error('Error fetching debug users:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Internal server error', error: errorMessage }, { status: 500 });
  }
}
