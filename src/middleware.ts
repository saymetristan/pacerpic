import { withMiddlewareAuthRequired, getSession } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default withMiddlewareAuthRequired(async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getSession(req, res);
  
  // Proteger rutas de admin y upload
  if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/api/images/upload')) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/api/auth/login', req.url));
    }
  }

  return res;
});

export const config = {
  matcher: ['/admin/:path*', '/api/images/upload']
}; 