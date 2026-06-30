import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/about', '/service', '/contact', '/products', '/shop', '/login', '/register', '/admin/login'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get('token')?.value;
  const authHeader = req.headers.get('authorization');
  const hasToken = Boolean(token) || Boolean(authHeader?.startsWith('Bearer '));

  if (pathname === '/') {
    const destination = req.nextUrl.clone();
    destination.pathname = hasToken ? '/dashboard/overview' : '/login';
    return NextResponse.redirect(destination);
  }

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (isPublic) return NextResponse.next();

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
