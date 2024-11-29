import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'PacerPic - Dashboard de Administrador',
  description: 'Gestión de eventos y fotografías',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 