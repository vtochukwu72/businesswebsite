
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
  
  // A temporary workaround to get role. In a real app, you'd want a more robust
  // way to get custom claims or role from the session cookie without a network request.
  // For now, let's assume if there is a session, the user is authenticated.
  // The route-specific logic will handle authorization.
  const isAuthenticated = !!session;

  const { pathname } = request.nextUrl;

  // If trying to access a seller route
  if (pathname.startsWith('/seller')) {
    // If it's the seller login page, let them proceed
    if (pathname === '/seller/login' || pathname === '/seller-register') {
      return NextResponse.next();
    }
    if (!isAuthenticated) {
       return NextResponse.redirect(new URL('/seller/login', request.url));
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
  matcher: ['/admin/:path*', '/seller/:path*', '/account/:path*'],
};
