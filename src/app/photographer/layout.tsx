"use client";

import '@/app/globals.css';
import { Inter } from 'next/font/google';
import { DashboardProvider } from '@/components/providers/dashboard-provider';
import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect } from 'react';
import Intercom from '@intercom/messenger-js-sdk';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Pacerpic - Panel de Fotógrafo',
  description: 'Gestiona tus eventos y fotografías deportivas',
};

export default function PhotographerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      Intercom({
        app_id: 'ewqqo54g',
        name: user.name || '',
        email: user.email || '',
        created_at: Math.floor(new Date(user.updated_at || '').getTime() / 1000),
      });
    }
  }, [user]);

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <DashboardProvider>
          {children}
        </DashboardProvider>
      </body>
    </html>
  );
} 