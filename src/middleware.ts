
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  // Define public paths that do not require authentication
  const publicPaths = [
    '/login',
    '/register',
    '/seller-register',
    '/seller-login',
    '/admin-login',
    '/admin-register',
    '/forgot-password',
  ];

  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // If user is logged in
  if (session) {
    // If they try to access a public-only path (like login), redirect them away.
    // Allow access to /admin/register and /seller-register for demo purposes, can be tightened later.
    if (publicPaths.includes(pathname) && pathname !== '/admin-register' && pathname !== '/seller-register') {
      let redirectUrl = '/account'; // Default redirect for logged-in users
      // A more advanced check could decode the session and redirect based on role,
      // but that requires more complex setup (e.g., JWT library).
      // For now, a simple redirect is sufficient.
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  // If user is not logged in and tries to access a protected route
  if (!session) {
     if (pathname.startsWith('/account')) {
        return NextResponse.redirect(new URL('/login', request.url));
     }
     if (pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/admin-login', request.url));
     }
     if (pathname.startsWith('/seller')) {
        return NextResponse.redirect(new URL('/seller-login', request.url));
     }
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// The matcher defines which routes the middleware will run on.
export const config = {
  matcher: [
      /*
       * Match all request paths except for the ones starting with:
       * - api (API routes)
       * - _next/static (static files)
       * - _next/image (image optimization files)
       * - favicon.ico (favicon file)
       */
      '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
