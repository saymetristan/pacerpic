"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function EventsHeader() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
        <p className="text-muted-foreground">
          Gestiona los eventos asignados a tu cuenta
        </p>
      </div>
      <Button 
        onClick={() => router.push("/admin/events/new")}
        className="bg-[#EC6533] hover:bg-[#EC6533]/90"
      >
        <Plus className="mr-2 h-4 w-4" />
        Nuevo Evento
      </Button>
    </div>
  );
}