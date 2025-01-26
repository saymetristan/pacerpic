import { withMiddlewareAuthRequired, getSession } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default withMiddlewareAuthRequired(async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getSession(req, res);
  const baseUrl = process.env.AUTH0_BASE_URL || 'https://pacerpic.com';
  
  if (!session?.user) {
    return NextResponse.redirect(new URL('/api/auth/login', baseUrl));
  }

  const userRole = 
    (session?.user as any)['https://pacerpic.com/roles']?.[0]?.toLowerCase() || 
    'photographer';

  // Rutas protegidas por rol
  if (req.nextUrl.pathname.startsWith('/admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/', baseUrl));
  }

  if (req.nextUrl.pathname.startsWith('/photographer') && userRole !== 'photographer') {
    return NextResponse.redirect(new URL('/', baseUrl));
  }

  if (req.nextUrl.pathname.startsWith('/organizer') && userRole !== 'organizer') {
    return NextResponse.redirect(new URL('/', baseUrl));
  }

  console.log('Session user:', {
    metadata: session?.user?.user_metadata,
    role: session?.user?.user_metadata?.role,
    raw: session?.user
  });

  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type');

  return res;
});

export const config = {
  matcher: [
    '/admin/:path*', 
    '/photographer/:path*',
    '/organizer/:path*',
    '/api/images/upload'
  ],
}; 