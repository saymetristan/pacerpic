"use client";

import { useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface Event {
  id: string;
  name: string;
  date: string;
  location: string | null;
  status?: 'active' | 'completed' | 'cancelled';
  organizer_id: string | null;
  created_at: string;
  image_count: number;
  images: { count: number; }[];
}

export function EventsTable() {
  const { user } = useUser();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (!user?.sub) return;

        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            images:images(count)
          `)
          .eq('organizer_id', user.sub)
          .order('date', { ascending: false });

        if (error) throw error;

        const eventsWithCount = data.map(event => ({
          ...event,
          status: 'active' as const,
          photographer_id: user?.sub || null,
          image_count: event.images?.[0]?.count || 0
        }));

        setEvents(eventsWithCount);
      } catch (err) {
        console.error('Error al cargar eventos:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.sub) {
      fetchEvents();
    }
  }, [user?.sub]);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Ubicación</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Fotos</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="font-medium">{event.name}</TableCell>
              <TableCell>{formatDate(event.date)}</TableCell>
              <TableCell>{event.location}</TableCell>
              <TableCell>
                <Badge variant={
                  event.status === 'active' ? 'default' :
                  event.status === 'completed' ? 'secondary' : 'destructive'
                }>
                  {event.status === 'active' ? 'Activo' :
                   event.status === 'completed' ? 'Completado' : 'Cancelado'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{event.image_count}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/events/${event.id}/download`);
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `${event.name}-fotos.zip`;
                      document.body.appendChild(link);
                      link.click();
                      link.remove();
                      window.URL.revokeObjectURL(url);
                    } catch (error) {
                      console.error('Error al descargar:', error);
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar todas
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}