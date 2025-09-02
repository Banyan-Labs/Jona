// client/src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/database';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createMiddlewareClient<Database>({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  // Allow public access to login/register
  const publicRoutes = ['/login', '/register','/contact','/about'];
  if (publicRoutes.includes(pathname)) {
    return res;
  }

  // Block unauthenticated access to protected routes
  if (!session?.user) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Optional: Role-based protection for admin routes
  if (pathname.startsWith('/admin')) {
    const role =
      session.user.user_metadata?.role || session.user.app_metadata?.role;
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/auth/dashboard', req.url));
    }
  }


  return res;
}

export const config = {
  matcher: [
    '/dashboard',
    '/profile',
    '/admin/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};