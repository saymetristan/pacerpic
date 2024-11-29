"use client";

import { Button } from "@/components/ui/button";
import { EventDialog } from "@/components/events/event-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function EventsHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Mis Eventos</h2>
        <p className="text-muted-foreground">
          Gestiona tus eventos y sus fotografías
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los eventos</SelectItem>
            <SelectItem value="active">Eventos activos</SelectItem>
            <SelectItem value="completed">Eventos completados</SelectItem>
          </SelectContent>
        </Select>
        <EventDialog />
      </div>
    </div>
  );
}