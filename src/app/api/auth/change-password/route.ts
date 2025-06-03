import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { userId, currentPassword, newPassword } = await request.json();
    const db = await getDb();

    // First, verify the current password
    const user = await db.get(
      "SELECT id, password FROM users WHERE id = ?",
      userId
    );

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // IMPORTANT: In a production app, use bcrypt.compare() for password verification
    if (user.password !== currentPassword) {
      return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 });
    }

    // IMPORTANT: In a production app, hash newPassword before storing
    const result = await db.run(
      "UPDATE users SET password = ?, forcePasswordChange = 0 WHERE id = ?",
      newPassword,
      userId
    );

    if (result.changes && result.changes > 0) {
      const updatedUser = await db.get(
        "SELECT id, username, apartmentId, name, forcePasswordChange FROM users WHERE id = ?",
        userId
      );
      
      // Convert forcePasswordChange from 0/1 to boolean
      const userResponse = {
        id: updatedUser.id,
        username: updatedUser.username,
        apartmentId: updatedUser.apartmentId,
        name: updatedUser.name,
        forcePasswordChange: Boolean(updatedUser.forcePasswordChange),
      };
      
      return NextResponse.json(userResponse);
    } else {
      return NextResponse.json({ message: 'Failed to update password' }, { status: 500 });
    }
  } catch (error) {
    console.error('Change password API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
