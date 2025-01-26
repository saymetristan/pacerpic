"use client";

import { useState } from "react";
import { PhotographerSidebar } from "./photographer-sidebar";

export function PhotographerLayoutContent({
  children
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-screen flex">
      <PhotographerSidebar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed(!collapsed)} 
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
} 