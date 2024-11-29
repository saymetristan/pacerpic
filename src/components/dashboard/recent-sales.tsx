"use client";

import { Avatar } from "@/components/ui/avatar";

export function RecentSales() {
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Avatar className="h-9 w-9" />
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Maratón Madrid</p>
          <p className="text-sm text-muted-foreground">
            3 imágenes vendidas
          </p>
        </div>
        <div className="ml-auto font-medium">+€45.00</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9" />
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Carrera San Silvestre</p>
          <p className="text-sm text-muted-foreground">
            5 imágenes vendidas
          </p>
        </div>
        <div className="ml-auto font-medium">+€75.00</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9" />
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Trail Sierra Norte</p>
          <p className="text-sm text-muted-foreground">
            2 imágenes vendidas
          </p>
        </div>
        <div className="ml-auto font-medium">+€30.00</div>
      </div>
    </div>
  );
}