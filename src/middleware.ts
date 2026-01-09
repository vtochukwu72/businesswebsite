
import { NextResponse, type NextRequest } from 'next/server';
import { getSdks, initializeFirebase } from '@/firebase';

async function getRoleFromSession(sessionCookie: string | undefined) {
  if (!sessionCookie) return null;
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.FIREBASE_API_KEY!,
          'Authorization': `Bearer ${sessionCookie}`
        },
         body: JSON.stringify({ idToken: sessionCookie }),
      }
    );

    if (!res.ok) {
      return null;
    }
    
    const { users } = await res.json();
    const user = users?.[0];

    if (!user) return null;
    
    const { firestore } = getSdks(initializeFirebase().firebaseApp);
    const userDoc = await firestore.collection('users').doc(user.localId).get();
    
    return userDoc.exists ? userDoc.data()?.role : null;
  } catch (error) {
    console.error("Middleware session error:", error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  
  const isAuthenticated = !!session;

  const { pathname } = request.nextUrl;

  // Allow seller registration page to be public
  if (pathname === '/seller-register') {
      return NextResponse.next();
  }

  // If trying to access a seller route
  if (pathname.startsWith('/seller')) {
    if (!isAuthenticated) {
       // Allow access to the base /seller route which will handle its own auth check
       if (pathname === '/seller') {
         return NextResponse.next();
       }
       return NextResponse.redirect(new URL('/seller', request.url));
    }
  }

  if (pathname.startsWith('/admin')) {
     if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  if (pathname.startsWith('/account')) {
    if (!isAuthenticated) {
       return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/seller/:path*', '/account/:path*', '/seller-register'],
};
