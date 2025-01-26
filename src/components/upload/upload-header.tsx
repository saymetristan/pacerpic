"use client";

import { useEvents } from "@/hooks/use-events";
import { useUser } from '@auth0/nextjs-auth0/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UploadHeaderProps {
  onEventChange: (eventId: string) => void;
}

export function UploadHeader({ onEventChange }: UploadHeaderProps) {
  const { user } = useUser();
  const { events, singleEvent, loading } = useEvents(user?.sub);

  if (loading) return null;
  if (singleEvent) return null;

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subir Imágenes</h1>
        <p className="text-muted-foreground">
          Sube y procesa las imágenes de tu evento
        </p>
      </div>

      <Select onValueChange={onEventChange}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Selecciona un evento" />
        </SelectTrigger>
        <SelectContent>
          {events.map((event) => (
            <SelectItem key={event.id} value={event.id}>
              {event.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}