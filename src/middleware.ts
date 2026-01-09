import { NextResponse, type NextRequest } from 'next/server';
import { initAdmin } from '@/firebase/admin-init';

async function getRoleFromSession(sessionCookie: string | undefined) {
  if (!sessionCookie) return null;
  try {
    const { auth, db } = await initAdmin();
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    return userDoc.exists ? userDoc.data()?.role : null;
  } catch (error) {
    // Session cookie is invalid or expired.
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  const role = await getRoleFromSession(session?.value);

  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    if (role !== 'admin' && role !== 'super_admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (pathname.startsWith('/seller')) {
    if (role !== 'seller') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  if (pathname.startsWith('/account')) {
    if (!role) {
       return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/seller/:path*', '/account/:path*'],
};
