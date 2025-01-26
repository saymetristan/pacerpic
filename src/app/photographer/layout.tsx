import '@/app/globals.css';
import { Inter } from 'next/font/google';
import { DashboardProvider } from '@/components/providers/dashboard-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Pacerpic - Dashboard de Fotógrafo',
  description: 'Gestiona tus eventos y fotografías deportivas',
};

export default function PhotographerLayout({
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