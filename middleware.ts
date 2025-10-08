import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.teachforfree.com';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect /dashboard routes
  if (pathname.startsWith('/dashboard')) {
    try {
      // Call your Java backend to validate session via cookies
      const res = await fetch(`${API_BASE}/auth/session`, {
        method: 'GET',
        headers: {
          cookie: req.headers.get('cookie') || '',
        },
      });

      if (!res.ok) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
      }

      return NextResponse.next();
    } catch (err) {
      console.error('Middleware session check failed:', err);
      const loginUrl = new URL('/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Everything else continues normally
  return NextResponse.next();
}

export const config = {
  matcher: ['/(protected)/:path*'],
};