"use client";

import { useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function useAuthSync() {
  const { user, isLoading } = useUser();
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function syncUser() {
      if (!isLoading && user) {
        try {
          const { data: existingUser, error: selectError } = await supabase
            .from('users')
            .select('*')
            .eq('auth0_id', user.sub)
            .single();

          if (selectError && selectError.code === 'PGRST116') {
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