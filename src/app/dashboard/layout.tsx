import '../globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { DashboardProvider } from '@/components/providers/dashboard-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PacerPic - Dashboard de Fotógrafo',
  description: 'Gestiona tus eventos y fotografías deportivas con PacerPic',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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