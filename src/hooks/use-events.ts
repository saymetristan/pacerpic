import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data: eventsData, error } = await supabase
        .from('events')
        .select(`
          id,
          name,
          date,
          images (
            compressed_url
          )
        `)
        .order('date', { ascending: true });

      if (!error && eventsData) {
        const eventsWithFullUrls = eventsData.map(event => ({
          ...event,
          images: event.images?.map(img => ({
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