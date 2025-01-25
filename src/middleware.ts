import { withMiddlewareAuthRequired, getSession } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default withMiddlewareAuthRequired(async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getSession(req, res);
  
  // Asegurarse de que la URL base sea correcta
  const baseUrl = process.env.AUTH0_BASE_URL || 'https://pacerpic.com';
  
  if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/api/images/upload')) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/api/auth/login', baseUrl));
    }
  }

  // Activar worker si es una petición a queue
  if (req.nextUrl.pathname.startsWith('/api/images/queue')) {
    fetch(`${req.nextUrl.origin}/api/worker`, {
      method: 'GET',
      headers: {
        'x-worker-activation': 'internal'
      }
    }).catch(console.error);
  }

  return res;
});

export const config = {
  matcher: ['/admin/:path*', '/api/images/upload', '/api/images/queue/:path*']
}; 