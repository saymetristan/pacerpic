"use client";

import { useState } from "react";
import { PhotographerSidebar } from "./photographer-sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function PhotographerLayoutContent({
  children
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="h-screen flex">
      <PhotographerSidebar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed(!collapsed)} 
      />
      <main className="flex-1 overflow-y-auto">
        <div className="border-b">
          <div className="container">
            <Tabs value={pathname} className="relative">
              <TabsList>
                <Link href="/photographer">
                  <TabsTrigger value="/photographer">Subir Fotos</TabsTrigger>
                </Link>
                <Link href="/photographer/process">
                  <TabsTrigger value="/photographer/process">Procesar Fotos</TabsTrigger>
                </Link>
              </TabsList>
            </Tabs>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
} 