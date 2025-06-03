import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();
    
    const users = await db.all(
      "SELECT id, username, apartmentId, name, forcePasswordChange FROM users"
    );

    // Convert forcePasswordChange from 0/1 to boolean for all users
    const usersWithBooleans = users.map(user => ({
      ...user,
      forcePasswordChange: Boolean(user.forcePasswordChange)
    }));

    return NextResponse.json(usersWithBooleans);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}