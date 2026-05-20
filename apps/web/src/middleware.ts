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

function isTokenExpired(payload: JwtPayload): boolean {
  return Date.now() >= payload.exp * 1000;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ACCESS_TOKEN_KEY)?.value;

  // Auth routes - redirect to home if already logged in
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (token) {
      const payload = decodeToken(token);
      if (payload && !isTokenExpired(payload)) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
    return NextResponse.next();
  }

  // Protected routes - open login modal with redirect param
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      const url = new URL('/', request.url);
      url.searchParams.set('login', 'true');
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    const payload = decodeToken(token);
    if (!payload || isTokenExpired(payload)) {
      const url = new URL('/', request.url);
      url.searchParams.set('login', 'true');
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // Admin routes - token required + ADMIN role required
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      const url = new URL('/', request.url);
      url.searchParams.set('login', 'true');
      return NextResponse.redirect(url);
    }

    const payload = decodeToken(token);

    if (!payload || isTokenExpired(payload)) {
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
