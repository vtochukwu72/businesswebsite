
import { NextResponse, type NextRequest } from 'next/server';
import { initializeApp, getApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseAdminConfig } from './firebase/admin-config';

// Initialize Firebase Admin SDK
try {
  if (!getApps().length) {
    initializeApp({
      credential: {
        projectId: firebaseAdminConfig.projectId,
        clientEmail: firebaseAdminConfig.clientEmail,
        privateKey: firebaseAdminConfig.privateKey.replace(/\\n/g, '\n'),
      },
    });
  }
} catch (error: any) {
  console.error('Firebase Admin Initialization Error in Middleware:', error.message);
}

async function getRoleFromSession(sessionCookie: string | undefined): Promise<string | null> {
  if (!sessionCookie) return null;

  try {
    const decodedToken = await getAuth().verifySessionCookie(sessionCookie, true);
    const userDoc = await getFirestore().collection('users').doc(decodedToken.uid).get();
    
    if (userDoc.exists) {
      return userDoc.data()?.role || null;
    }
    return null;
  } catch (error) {
    // Session cookie is invalid or expired.
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  const userRole = await getRoleFromSession(session);
  const isAuthenticated = !!userRole;

  // --- Seller Route Protection ---
  if (pathname.startsWith('/seller')) {
     if (!isAuthenticated || userRole !== 'seller') {
       return NextResponse.redirect(new URL('/seller', request.url));
     }
  }

  // --- Admin Route Protection ---
  if (pathname.startsWith('/admin')) {
    const isAdmin = userRole === 'admin' || userRole === 'super_admin';
    if (!isAuthenticated || !isAdmin) {
      // Redirect non-admins to the admin login page
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
     // If they are an admin and trying to access the login page, redirect to dashboard
    if (isAdmin && pathname === '/admin/login') {
       return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // --- Account Route Protection ---
  if (pathname.startsWith('/account')) {
    if (!isAuthenticated) {
       return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // --- Public Auth Pages ---
  // Allow access to seller registration and main login/register pages
  if (pathname === '/seller-register' || pathname === '/login' || pathname === '/register') {
      return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/seller/:path*', '/account/:path*'],
};
