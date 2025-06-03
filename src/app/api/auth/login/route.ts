import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const db = await getDb();

    // First, get the user by username only
    const user = await db.get(
      "SELECT id, username, password, apartmentId, name, forcePasswordChange FROM users WHERE username = ?",
      username
    );

    if (user) {
      // Compare the provided password with the hashed password in the database
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
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
      }
    }

    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
