import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

/**
 * NextAuth Middleware
 * Protects routes and handles authentication flow
 * Redirects unauthenticated users appropriately
 */
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Allow access to landing page and auth routes
    if (
      pathname === '/' ||
      pathname.startsWith('/auth/') ||
      pathname.startsWith('/api/auth/') ||
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/favicon.ico')
    ) {
      return NextResponse.next();
    }

    // Protect the /app route - require authentication
    if (pathname.startsWith('/app')) {
      if (!token) {
        // Redirect to landing page with a sign-in prompt
        const url = new URL('/', req.url);
        url.searchParams.set('signin', 'required');
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Always allow access to public routes
        if (
          pathname === '/' ||
          pathname.startsWith('/auth/') ||
          pathname.startsWith('/api/auth/') ||
          pathname.startsWith('/_next/') ||
          pathname.startsWith('/favicon.ico')
        ) {
          return true;
        }

        // Require authentication for /app routes
        if (pathname.startsWith('/app')) {
          return !!token;
        }

        // Default: allow access
        return true;
      },
    },
  }
);

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