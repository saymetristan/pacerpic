// src/hooks/use-events.ts

"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Inicializa el cliente de Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Definición de tipos
interface Image {
  compressed_url: string;
}

interface Event {
  id: string;
  name: string;
  date: string;
  images_count: number;
  images: Image[];
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data: eventsData, error } = await supabase
        .from('events')
        .select(`
          id,
          name,
          date,
          images_count,
          images (
            compressed_url
          )
        `)
        .order('date', { ascending: true });

      if (!error && eventsData) {
        const eventsWithFullUrls = eventsData.map((event: any) => ({
          ...event,
          images: event.images?.map((img: any) => ({
            ...img,
            compressed_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${img.compressed_url}`
          }))
        }));
        setEvents(eventsWithFullUrls);
      }
      setLoading(false);
    };

    fetchEvents();
  }, []);

  return { events, loading };
}
