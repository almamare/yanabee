import { NextRequest, NextResponse } from 'next/server';
import Cookies from 'js-cookie'; // For cookie-based token storage

export function middleware(request: NextRequest) {
  // We can read cookies from the request
  const token = Cookies.get('token');
  
  // The path you are trying to access
  const path = request.nextUrl.pathname;

  // If the user is not logged in and tries to access a private route, redirect to /login
  if (!token && path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If the user is logged in and tries to access /login, maybe redirect them to /dashboard
  if (token && path.startsWith('/login')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Otherwise, allow the request to continue
  return NextResponse.next();
}

// Configuration: specify which paths you want to match
export const config = {
  matcher: ['/dashboard/:path*', '/login'], 
};
