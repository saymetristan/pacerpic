import '@/app/globals.css';
import { Inter } from 'next/font/google';
import { DashboardProvider } from '@/components/providers/dashboard-provider';
import { PhotographerSidebar } from '@/components/layout/photographer-sidebar';

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
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <DashboardProvider>
          <div className="h-screen flex">
            <PhotographerSidebar collapsed={false} onToggle={() => {}} />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </DashboardProvider>
      </body>
    </html>
  );
} 