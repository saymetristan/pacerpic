import { withMiddlewareAuthRequired, getSession } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default withMiddlewareAuthRequired(async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getSession(req, res);
  const { pathname } = req.nextUrl;

  // Solo protege las rutas de admin
  if (pathname.startsWith('/admin')) {
    // Asegúrate de reemplazar con tu email
    if (!session?.user || session.user.email !== 'admin@pacerpic.com') {
      // Si no es el admin, redirige al home
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return res;
});

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ]
}; 