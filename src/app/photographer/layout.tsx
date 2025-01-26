import '@/app/globals.css';
import { Inter } from 'next/font/google';
import { PhotographerLayoutClient } from './layout-client';

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
      <PhotographerLayoutClient className={inter.className}>
        {children}
      </PhotographerLayoutClient>
    </html>
  );
} 