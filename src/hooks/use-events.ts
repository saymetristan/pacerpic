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

export function useEvents(userId?: string | null) {
  const [events, setEvents] = useState<Event[]>([]);
  const [singleEvent, setSingleEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            images:images(count)
          `)
          .order('date', { ascending: false });

        if (error) throw error;

        const filteredData = userId 
          ? data.filter(event => event.organizer_id === userId)
          : data;

        setEvents(filteredData || []);
        
        // Si solo hay un evento, lo guardamos en singleEvent
        if (filteredData.length === 1) {
          setSingleEvent(filteredData[0]);
        } else {
          setSingleEvent(null);
        }
      } catch (err) {
        console.error('Error al obtener eventos:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [userId]);

  return { events, singleEvent, loading, error };
}
