import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { userId, newPassword } = await request.json();
    const db = await getDb();

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
      return NextResponse.json({
        success: true,
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          apartmentId: updatedUser.apartmentId,
          name: updatedUser.name,
          forcePasswordChange: updatedUser.forcePasswordChange === 1,
        },
      });
    } else {
      return NextResponse.json({ success: false, message: 'User not found or password not changed' }, { status: 404 });
    }
  } catch (error) {
    console.error('Change password API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
