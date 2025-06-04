import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login', '/api/auth/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for public paths and API routes
  if (publicPaths.some(path => pathname.startsWith(path)) || pathname.startsWith('/_next') || pathname.startsWith('/favicon.ico')) {
    return NextResponse.next();
  }

  // Check for auth token in cookies
  const authToken = request.cookies.get('next-auth.session-token') || 
                   request.cookies.get('__Secure-next-auth.session-token');

  // If no auth token and not on a public path, redirect to login
  if (!authToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
