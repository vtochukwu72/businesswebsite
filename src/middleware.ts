
import { NextResponse, type NextRequest } from 'next/server';
import { initializeApp, getApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { firebaseAdminConfig } from './firebase/admin-config';

// This middleware is now simplified to only handle basic redirects for logged-in
// users trying to access login pages. The core role-based protection is moved
// to the layouts (`src/app/admin/layout.tsx`, `src/app/seller/layout.tsx`)
// to avoid using `firebase-admin` in the Edge Runtime.

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  // If the user is authenticated and tries to visit a login/register page,
  // redirect them to a default authenticated page (e.g., account).
  if (session) {
    if (pathname === '/login' || pathname === '/register' || pathname === '/seller/login' || pathname === '/admin/login' || pathname === '/seller-register') {
      return NextResponse.redirect(new URL('/account', request.url));
    }
  }

  // If the user is not authenticated and tries to access a protected route,
  // the respective layout (admin, seller, account) will handle the redirect
  // on the client side to the correct login page.
  if (!session) {
     if (pathname.startsWith('/account')) {
        return NextResponse.redirect(new URL('/login', request.url));
     }
     if (pathname.startsWith('/admin')) {
        // Allow access to /admin/login even without a session
        if (pathname !== '/admin/login') {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
     }
     if (pathname.startsWith('/seller')) {
        if (pathname !== '/seller/login' && pathname !== '/seller-register') {
             return NextResponse.redirect(new URL('/seller/login', request.url));
        }
     }
  }


  return NextResponse.next();
}

// The matcher ensures this middleware runs on the specified paths.
export const config = {
  matcher: [
      '/admin/:path*',
      '/seller/:path*',
      '/seller-register',
      '/account/:path*',
      '/login',
      '/register'
    ],
};
