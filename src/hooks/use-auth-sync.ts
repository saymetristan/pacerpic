"use client";

import { useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export type UserRole = 'admin' | 'photographer' | 'organizer';

interface Auth0Metadata {
  role?: string;
  [key: string]: string | undefined;
}

interface Auth0User extends Record<string, unknown> {
  sub: string;
  email: string;
  'https://pacerpic.com/roles'?: string[];
}

export function useAuthSync() {
  const { user, isLoading } = useUser();
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function syncUser() {
      if (!isLoading && user) {
        const auth0User = user as Auth0User;
        const role = auth0User['https://pacerpic.com/roles']?.[0]?.toLowerCase() || 'photographer';

        console.log('Auth0 User Data:', {
          sub: auth0User.sub,
          email: auth0User.email,
          roles: auth0User['https://pacerpic.com/roles'],
          assigned_role: role,
          raw: auth0User
        });

        try {
          const { data: existingUser, error: selectError } = await supabase
            .from('users')
            .select('*')
            .eq('auth0_id', auth0User.sub)
            .single();

          // Log del usuario en Supabase
          console.log('Supabase User Data:', {
            existingUser,
            error: selectError
          });

          console.log('Role from Auth0:', role);

          if (selectError && selectError.code === 'PGRST116') {
            const { error: upsertError } = await supabase
              .from('users')
              .upsert({
                auth0_id: auth0User.sub,
                role: role,
                email: auth0User.email,
                name: auth0User.name
              }, {
                onConflict: 'auth0_id'
              });

            if (upsertError) {
              console.error('Error creando usuario:', upsertError);
              return;
            }
          } else if (selectError) {
            console.error('Error verificando usuario:', selectError);
            return;
          }

          const response = await fetch('/api/auth/session');
          const session = await response.json();
          
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: session.accessToken,
            refresh_token: ''
          });

          if (sessionError) {
            console.error('Error sincronizando sesión:', sessionError);
          }
        } catch (error) {
          console.error('Error en sincronización:', error);
        }
      }
    }

    syncUser();
  }, [user, isLoading, supabase.auth, supabase]);
} 