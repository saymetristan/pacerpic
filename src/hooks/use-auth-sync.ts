"use client";

import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function useAuthSync() {
  const { user, isLoading } = useUser();
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function syncUser() {
      if (!isLoading && user) {
        try {
          // Primero verificar si el usuario ya existe
          const { data: existingUser, error: selectError } = await supabase
            .from('users')
            .select('*')
            .eq('auth0_id', user.sub)
            .single();

          if (selectError && selectError.code !== 'PGRST116') {
            console.error('Error verificando usuario:', selectError);
            return;
          }

          if (!existingUser) {
            console.log('Creando nuevo usuario en Supabase...');
            const { error: upsertError } = await supabase
              .from('users')
              .upsert({
                auth0_id: user.sub,
                role: 'admin',
                email: user.email,
                name: user.name
              }, {
                onConflict: 'auth0_id'
              });

            if (upsertError) {
              console.error('Error creando usuario:', upsertError);
              return;
            }
          }

          const { error: sessionError } = await supabase.auth.setSession({
            access_token: user.accessToken as string,
            refresh_token: user.refreshToken || '',
            provider_token: user.sub,
            expires_in: 3600
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
  }, [user, isLoading]);

  return { user, isLoading };
} 