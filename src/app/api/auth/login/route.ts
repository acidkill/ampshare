import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

// Helper function to handle CORS headers
function setCorsHeaders(headers: Headers, request: Request) {
  const origin = request.headers.get('origin');
  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
  } else {
    headers.set('Access-Control-Allow-Origin', '*');
  }
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Access-Control-Allow-Credentials', 'true');
  return headers;
}

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
  console.log('=== LOGIN REQUEST ===');
  console.log('Request URL:', request.url);
  console.log('Request method:', request.method);
  console.log('Request headers:', Object.fromEntries(request.headers.entries()));
  
  // Handle preflight request
  if (request.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    const headers = new Headers();
    setCorsHeaders(headers, request);
    return new NextResponse(null, { headers });
  }
  
  console.log('Processing login request...');

  try {
    const { username, password } = await request.json();
    console.log('Login attempt for user:', username);
    
    try {
      const db = await getDb();
      
      if (!db) {
        console.error('Database connection is null');
        return NextResponse.json(
          { success: false, message: 'Database connection failed' },
          { status: 500 }
        );
      }
      
      // First, get the user by username only
      console.log('Executing database query for user:', username);
      const user = await db.get(
        "SELECT id, username, password, apartmentId, name, forcePasswordChange FROM users WHERE username = ?",
        [username]  // Ensure this is an array of parameters
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
          console.log('Login successful, creating response...');
          
          const headers = new Headers();
          headers.set('Content-Type', 'application/json');
          setCorsHeaders(headers, request);
          
          // Add cache control headers
          headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
          headers.set('Pragma', 'no-cache');
          headers.set('Expires', '0');
          
          // Set the session cookie in the response headers
          const cookieOptions = {
            httpOnly: true,
            path: '/',
            expires: expiresAt,
            sameSite: 'lax' as const,
            secure: process.env.NODE_ENV === 'production',
            domain: 'beltalowda.ddns.net' // Removed leading dot for better compatibility
          };
          
          console.log('Setting cookie with options:', JSON.stringify(cookieOptions, null, 2));
          
          setCookie(
            headers,
            'session_token',
            sessionToken,
            cookieOptions
          );
          
          // Create the response with the headers
          const response = new NextResponse(JSON.stringify(responseData), {
            status: 200,
            headers
          });
          
          // Log the response headers for debugging
          console.log('Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
          
          console.log('Sending successful login response');
          return response;
        }
      }

      // If we get here, authentication failed
      return NextResponse.json(
        { success: false, message: 'Invalid username or password' },
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Login API error:', error);
      return NextResponse.json(
        { success: false, message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
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
