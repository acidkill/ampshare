
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';
import type { UserRole } from './types'; // Assuming UserRole might be part of the JWT payload

// TODO: Use a strong, environment-specific secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-and-long-jwt-secret-key'; // Placeholder

interface JwtPayload {
  id: string;
  username: string;
  role: UserRole;
  apartmentId: string;
  iat: number;
  exp: number;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const publicPaths = ['/login', '/api/auth/login']; // Paths accessible without authentication

  // Allow requests to public paths and static assets/Next.js internals
  if (publicPaths.includes(pathname) || pathname.startsWith('/_next/') || pathname.startsWith('/static/') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const tokenCookie = request.cookies.get('auth_token');

  if (!tokenCookie) {
    console.log('Middleware: No auth_token cookie found. Redirecting to login.');
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const decoded = verify(tokenCookie.value, JWT_SECRET) as JwtPayload;
    // You can add further checks here, e.g., if the user role is allowed for the path
    console.log('Middleware: Token verified for user:', decoded.username);

    // Optionally, pass user data to the page via request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.id);
    requestHeaders.set('x-user-role', decoded.role);
    requestHeaders.set('x-user-apartment-id', decoded.apartmentId);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error: any) {
    console.error('Middleware: Invalid token or verification error - ', error.message);
    const loginUrl = new URL('/login', request.url);
    // Clear the invalid cookie before redirecting
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('auth_token');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login page itself to avoid redirect loops
     */
    // Apply middleware to all paths that are not explicitly public or static assets.
    // This regex ensures it doesn't run for API routes, static files, image optimization, or the login page.
    '/((?!api|_next/static|_next/image|favicon.ico|login).*) ',
    // Apply to specific protected top-level paths if preferred over blanket approach
    // '/dashboard/:path*',
    // '/profile/:path*',
    // '/admin/:path*',
  ],
};
