import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function useAuthSync() {
  const { user, isLoading } = useUser();
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!isLoading && user) {
      // Sincronizar token de Auth0 con Supabase
      supabase.auth.setSession({
        access_token: user.sub,
        refresh_token: '',
        provider_token: user.sub,
        expires_in: 3600
      });
    }
  }, [user, isLoading]);

  return { user, isLoading };
} 