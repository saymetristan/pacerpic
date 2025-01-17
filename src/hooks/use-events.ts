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

export function useEvents(userId?: string) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!userId) return;
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('organizer_id', userId)
          .order('date', { ascending: false });

        if (error) throw error;

        setEvents(data || []);
      } catch (err) {
        console.error('Error al obtener eventos:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [userId]);

  return { events, loading, error };
}
