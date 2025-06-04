import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

// Helper function to set cookie in the response headers
function setCookie(headers: Headers, name: string, value: string, options: {
  httpOnly?: boolean;
  path?: string;
  expires?: Date;
  sameSite?: 'lax' | 'strict' | 'none';
  secure?: boolean;
} = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`);
  if (options.httpOnly) parts.push('HttpOnly');
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options.secure) parts.push('Secure');
  
  headers.append('Set-Cookie', parts.join('; '));
}

export async function POST(request: Request) {
  // Handle preflight request
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { 
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      } 
    });
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
        console.log('Login successful, creating session');
        
        // Create a session token
        const sessionToken = uuidv4();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
        
        // Store session in the database
        await db.run(
          'INSERT INTO sessions (id, userId, expiresAt) VALUES (?, ?, ?)',
          [sessionToken, user.id, expiresAt.toISOString()]
        );
        
        console.log('Session created, returning user data');
        
        // Create response with user data
        const response = new NextResponse(JSON.stringify(responseData), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
            'Access-Control-Allow-Credentials': 'true',
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        // Set the session cookie in the response headers
        setCookie(
          response.headers,
          'session_token',
          sessionToken,
          {
            httpOnly: true,
            path: '/',
            expires: expiresAt,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
          }
        );
        
        return response;
      }
    }

    console.log('Invalid credentials for user:', username);
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Invalid credentials' }), 
      { 
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
          'Access-Control-Allow-Credentials': 'true'
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
          'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
          'Access-Control-Allow-Credentials': 'true'
        }
      }
    );
  }
}
