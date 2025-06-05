import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth'; // Use our new verifyToken
import type { JWTPayload, UserRole } from './types'; // Use JWTPayload

// JWT_SECRET is now handled within verifyToken in auth.ts

// Define paths that are public (accessible without authentication)
const publicPaths = ['/login', '/api/auth/login'];

// Define paths that require admin role
const adminPaths = ['/admin']; // Add more specific admin paths like '/admin/users', '/admin/settings'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow requests to Next.js internals and static assets to pass through
  if (pathname.startsWith('/_next/') || pathname.startsWith('/static/') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Allow requests to explicitly public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const tokenCookie = request.cookies.get('auth_token');

  if (!tokenCookie) {
    console.log(`Middleware: No auth_token for path ${pathname}. Redirecting to login.`);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectedFrom', pathname); // Optionally pass where the user was going
    return NextResponse.redirect(loginUrl);
  }

  const decodedPayload = verifyToken(tokenCookie.value) as JWTPayload | null;

  if (!decodedPayload) {
    console.log(`Middleware: Invalid or expired token for path ${pathname}. Redirecting to login.`);
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('auth_token'); // Clear the invalid cookie
    return response;
  }

  // Role-based access control
  const userRole = decodedPayload.role;
  const isAdminPath = adminPaths.some(path => pathname.startsWith(path));

  if (isAdminPath && userRole !== 'admin') {
    console.log(`Middleware: Non-admin user (${decodedPayload.username}, role: ${userRole}) attempting to access admin path ${pathname}. Redirecting to home.`);
    // Redirect to a general page or a "forbidden" page if one exists
    // For now, redirecting to the root path.
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }

  // If token is valid and role checks pass (if any), proceed
  // Optionally, pass user data to the page via request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', decodedPayload.id);
  requestHeaders.set('x-user-username', decodedPayload.username);
  requestHeaders.set('x-user-role', decodedPayload.role);
  requestHeaders.set('x-user-apartment-id', decodedPayload.apartmentId);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes are typically handled separately or have their own auth checks)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /login (the login page itself, to avoid redirect loops)
     * - Any file extension (e.g. .png, .jpg, .svg), assumed to be static assets.
     */
    // This regex tries to match paths that are not API endpoints, static files, image files, or the login page.
    // It now explicitly excludes paths with extensions.
    '/((?!api|_next/static|_next/image|favicon.ico|login|.*\.[^.]+$).*) ',

    // If you prefer to explicitly protect specific top-level paths:
    // '/dashboard/:path*',
    // '/schedule/:path*', // Protect all schedule pages
    // '/profile/:path*',
    // '/settings/:path*',
    // '/admin/:path*',
  ],
};
