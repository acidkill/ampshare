import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  // Set CORS headers
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { headers });
  }

  try {
    const { username, password } = await request.json();
    console.log('Login attempt for user:', username);
    
    const db = await getDb();
    
    // First, get the user by username only
    const user = await db.get(
      "SELECT id, username, password, apartmentId, name, forcePasswordChange FROM users WHERE username = ?",
      username
    );

    console.log('User found in database:', user ? 'yes' : 'no');

    if (user) {
      // Compare the provided password with the hashed password in the database
      const passwordMatch = await bcrypt.compare(password, user.password);
      console.log('Password match:', passwordMatch);

      if (passwordMatch) {
        const responseData = {
          success: true,
          user: {
            id: user.id,
            username: user.username,
            apartmentId: user.apartmentId,
            name: user.name,
            forcePasswordChange: user.forcePasswordChange === 1, // Convert back to boolean
          },
        };
        console.log('Login successful, returning:', responseData);
        return new NextResponse(JSON.stringify(responseData), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...Object.fromEntries(headers.entries())
          }
        });
      }
    }

    console.log('Invalid credentials for user:', username);
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Invalid credentials' }), 
      { 
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...Object.fromEntries(headers.entries())
        }
      }
    );
  } catch (error) {
    console.error('Login API error:', error);
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...Object.fromEntries(headers.entries())
        }
      }
    );
  }
}
