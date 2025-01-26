import { DashboardProvider } from '@/components/providers/dashboard-provider';
import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect } from 'react';
import Intercom from '@intercom/messenger-js-sdk';

export function PhotographerLayoutClient({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
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
    <body className={className}>
      <DashboardProvider>
        {children}
      </DashboardProvider>
    </body>
  );
} 