import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

const ACCESS_TOKEN_KEY = 'nuvora_access_token';

interface JwtPayload {
  sub: string;
  role: 'USER' | 'ADMIN';
  iat: number;
  exp: number;
}

const protectedRoutes = [
  '/cart',
  '/wishlist',
  '/checkout',
  '/orders',
  '/profile',
];

const adminRoutes = ['/admin'];
const authRoutes = ['/login', '/register'];

function decodeToken(token: string): JwtPayload | null {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ACCESS_TOKEN_KEY)?.value;

  // Auth routes - redirect to home if a session cookie exists.
  // Actual validity (expired/refreshable) is handled client-side.
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes - only check that a session cookie exists.
  // Do NOT validate `exp` here — the access token is short-lived
  // by design (15m) and is silently refreshed client-side via the
  // axios response interceptor + refreshToken cookie. Validating
  // `exp` here causes a forced logout every 15 minutes even when
  // the refresh token is still valid.
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      const url = new URL('/', request.url);
      url.searchParams.set('login', 'true');
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Admin routes - check cookie presence + role from token payload.
  // Role doesn't change on refresh, so decoding for role is fine —
  // we just don't gate on `exp`.
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      const url = new URL('/', request.url);
      url.searchParams.set('login', 'true');
      return NextResponse.redirect(url);
    }

    const payload = decodeToken(token);

    if (!payload) {
      const url = new URL('/', request.url);
      url.searchParams.set('login', 'true');
      return NextResponse.redirect(url);
    }

    if (payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
};
