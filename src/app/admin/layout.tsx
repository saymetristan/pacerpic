import { DashboardProvider } from "@/components/providers/dashboard-provider";

export const metadata = {
  title: 'PacerPic - Dashboard de Administrador',
  description: 'Gestión de eventos y fotografías',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      {children}
    </DashboardProvider>
  );
} 