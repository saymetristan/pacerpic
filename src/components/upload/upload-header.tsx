"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEvents } from "@/hooks/use-events";

export function UploadHeader({ onEventChange }: { onEventChange: (eventId: string) => void }) {
  const { user } = useUser();
  const { events, loading } = useEvents(user?.sub || undefined);

  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Subir Imágenes</h2>
        <p className="text-muted-foreground">
          Sube y organiza las fotografías de tus eventos
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Select onValueChange={onEventChange} disabled={loading}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder={loading ? "Cargando eventos..." : "Selecciona un evento"} />
          </SelectTrigger>
          <SelectContent>
            {events?.map(event => (
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