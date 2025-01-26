import { withMiddlewareAuthRequired, getSession } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface Auth0Session {
  user: {
    'https://pacerpic.com/roles'?: string[];
    [key: string]: string[] | string | undefined;
  };
}

export default withMiddlewareAuthRequired(async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getSession(req, res);
  const baseUrl = process.env.AUTH0_BASE_URL || 'https://pacerpic.com';
  
  if (!session?.user) {
    return NextResponse.redirect(new URL('/api/auth/login', baseUrl));
  }

  // Obtener rol del usuario
  const userRole = 
    ((session as Auth0Session)?.user['https://pacerpic.com/roles']?.[0]?.toLowerCase()) || 
    'photographer';

  // Rutas protegidas por rol
  const protectedRoutes = {
    admin: ['/admin'],
    photographer: ['/photographer'],
    organizer: ['/organizer']
  };

  // Verificar acceso basado en rol
  const path = req.nextUrl.pathname;
  const isAllowed = path.startsWith(`/${userRole}`);

  if (!isAllowed) {
    // Redirigir a la ruta correspondiente según el rol
    return NextResponse.redirect(new URL(`/${userRole}`, baseUrl));
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
  ]
}; 