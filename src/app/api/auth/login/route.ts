import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const db = await getDb();

    // IMPORTANT: In a production app, hash passwords and compare securely (e.g., using bcrypt.compare)
    const user = await db.get(
      "SELECT id, username, apartmentId, name, forcePasswordChange FROM users WHERE username = ? AND password = ?",
      username,
      password
    );

    if (user) {
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          apartmentId: user.apartmentId,
          name: user.name,
          forcePasswordChange: user.forcePasswordChange === 1, // Convert back to boolean
        },
      });
    } else {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
