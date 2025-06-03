import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';

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

    // Use bcrypt to compare the current password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 });
    }

    // Hash the new password before storing
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const result = await db.run(
      "UPDATE users SET password = ?, forcePasswordChange = 0 WHERE id = ?",
      hashedNewPassword,
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
