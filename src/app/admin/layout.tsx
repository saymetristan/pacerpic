"use client";

import { DashboardProvider } from "@/components/providers/dashboard-provider";
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-[#1A3068]">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardProvider>
      {children}
    </DashboardProvider>
  );
} 