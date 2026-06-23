import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/', '/about', '/service', '/contact', '/products', '/login', '/register', '/admin/login'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (isPublic) return NextResponse.next();

  const token = req.cookies.get('token')?.value;

  const authHeader = req.headers.get('authorization');
  const hasToken = Boolean(token) || Boolean(authHeader?.startsWith('Bearer '));

  if (!hasToken) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo|public).*)',
  ],
};
