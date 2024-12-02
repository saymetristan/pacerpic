"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEvents } from "@/hooks/use-events";

export function UploadHeader({ onEventChange }: { onEventChange: (eventId: string) => void }) {
  const events = useEvents();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Subir Imágenes</h2>
        <p className="text-muted-foreground">
          Sube y organiza las fotografías de tus eventos
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Select onValueChange={onEventChange}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Selecciona un evento" />
          </SelectTrigger>
          <SelectContent>
            {events.map(event => (
              <SelectItem key={event.id} value={event.id}>
                {event.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}