import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const db = await getDb();

    const user = await db.get(
      "SELECT id, username, apartmentId, name, forcePasswordChange FROM users WHERE id = ?",
      id
    );

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Convert forcePasswordChange from 0/1 to boolean
    user.forcePasswordChange = Boolean(user.forcePasswordChange);

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}