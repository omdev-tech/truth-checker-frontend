import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Language detection utility for SSR
 */
function getLanguageFromRequest(req: NextRequest): string {
  console.log('🌐 Middleware: Detecting language from request');
  
  // 1. Try to get language from our custom cookie first (highest priority)
  const languageCookie = req.cookies.get('truth-checker-lang');
  if (languageCookie?.value && ['en', 'fr'].includes(languageCookie.value)) {
    console.log('🌐 Middleware: Found language in cookie:', languageCookie.value);
    return languageCookie.value;
  }

  // 2. Try to get from standard localStorage cookie (if set by client)
  const localStorageCookie = req.cookies.get('truth-checker-language');
  if (localStorageCookie?.value && ['en', 'fr'].includes(localStorageCookie.value)) {
    console.log('🌐 Middleware: Found language in localStorage cookie:', localStorageCookie.value);
    return localStorageCookie.value;
  }

  // 3. Try to get from Accept-Language header
  const acceptLanguage = req.headers.get('accept-language');
  if (acceptLanguage) {
    const preferredLanguages = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim().toLowerCase())
      .map(lang => lang.split('-')[0]); // Take just the language part (fr-FR -> fr)
    
    for (const lang of preferredLanguages) {
      if (['en', 'fr'].includes(lang)) {
        console.log('🌐 Middleware: Found language in Accept-Language:', lang);
        return lang;
      }
    }
  }

  // 4. Default to English
  console.log('🌐 Middleware: Defaulting to English');
  return 'en';
}

/**
 * NextAuth Middleware with Language Detection
 * Protects routes, handles authentication flow, and sets proper language for SSR
 */
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Detect language for SSR
    const detectedLanguage = getLanguageFromRequest(req);
    console.log('🌐 Middleware: Final detected language:', detectedLanguage);
    
    // Create response
    let response = NextResponse.next();

    // Set language in response headers for SSR
    response.headers.set('x-detected-language', detectedLanguage);
    
    // Always ensure the cookie is set with the detected language
    response.cookies.set('truth-checker-lang', detectedLanguage, {
      path: '/',
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60, // 1 year
      httpOnly: false, // Allow client-side access
    });

    // Also set a backup cookie that matches localStorage key name
    response.cookies.set('truth-checker-language', detectedLanguage, {
      path: '/',
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60, // 1 year
      httpOnly: false, // Allow client-side access
    });

    // Allow access to landing page and auth routes
    if (
      pathname === '/' ||
      pathname.startsWith('/auth/') ||
      pathname.startsWith('/api/auth/') ||
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/favicon.ico')
    ) {
      return response;
    }

    // Protect the /app route - require authentication
    if (pathname.startsWith('/app')) {
      if (!token) {
        // Redirect to landing page with a sign-in prompt
        const url = new URL('/', req.url);
        url.searchParams.set('signin', 'required');
        // Preserve language in redirect
        url.searchParams.set('lang', detectedLanguage);
        return NextResponse.redirect(url);
      }
    }

    return response;
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