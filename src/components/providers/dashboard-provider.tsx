"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { PhotographerSidebar } from "@/components/layout/photographer-sidebar";

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isAdmin = pathname?.includes("/admin");
  const isPhotographer = pathname?.includes("/photographer");

  return (
    <div className="h-screen flex dark:bg-gray-950">
      {isAdmin ? (
        <AdminSidebar 
          collapsed={collapsed} 
          onToggle={() => setCollapsed(!collapsed)} 
        />
      ) : isPhotographer ? (
        <PhotographerSidebar 
          collapsed={collapsed} 
          onToggle={() => setCollapsed(!collapsed)} 
        />
      ) : (
        <Sidebar 
          collapsed={collapsed} 
          onToggle={() => setCollapsed(!collapsed)} 
        />
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-100/40 dark:bg-gray-800/40">
          {children}
        </main>
      </div>
    </div>
  );
} 