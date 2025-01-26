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
import { Progress } from "@/components/ui/progress";
import DownloadButton from "@/components/DownloadButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Event {
  id: string;
  name: string;
  date: string;
  location: string | null;
  status?: 'active' | 'completed' | 'cancelled';
  organizer_id: string | null;
  created_at: string;
  image_count: number;
  images: Array<{ id: string; tag: string | null; }>;  // Permitir null aquí también
}

interface EventWithTags extends Event {
  tags: { tag: string; count: number }[];
}

export function EventsTable() {
  const { user } = useUser();
  const [events, setEvents] = useState<EventWithTags[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string>("all");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (!user?.sub) return;

        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            images (
              id,
              tag
            )
          `)
          .eq('organizer_id', user.sub)
          .order('date', { ascending: false });

        if (error) throw error;

        const eventsWithTags = data.map(event => {
          const tagCounts = event.images.reduce((acc: {[key: string]: number}, img) => {
            if (img.tag) {
              acc[img.tag] = (acc[img.tag] || 0) + 1;
            }
            return acc;
          }, {});

          const tags = Object.entries(tagCounts).map(([tag, count]) => ({
            tag,
            count
          }));

          return {
            ...event,
            status: 'active' as const,
            photographer_id: user?.sub || null,
            image_count: event.images?.length || 0,
            tags,
            images: event.images.map(img => ({
              id: img.id,
              tag: img.tag
            }))
          };
        });

        setEvents(eventsWithTags);
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
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select value={selectedTag} onValueChange={setSelectedTag}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por zona" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las zonas</SelectItem>
            {Array.from(new Set(events.flatMap(e => e.tags.map(t => t.tag)))).map(tag => (
              <SelectItem key={tag} value={tag}>{tag}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Fotos</TableHead>
              <TableHead>Zona</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              event.tags
                .filter(t => selectedTag === "all" || t.tag === selectedTag)
                .map(tagInfo => (
                  <TableRow key={`${event.id}-${tagInfo.tag}`}>
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
                    <TableCell className="text-right">{tagInfo.count}</TableCell>
                    <TableCell>{tagInfo.tag}</TableCell>
                    <TableCell>
                      <DownloadButton eventId={event.id} tag={tagInfo.tag} />
                    </TableCell>
                  </TableRow>
                ))
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}