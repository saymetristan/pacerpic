import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function useEvents() {
  const [events, setEvents] = useState<{ id: string; name: string }[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function loadEvents() {
      const { data } = await supabase
        .from('events')
        .select('id, name')
        .order('date', { ascending: false });
      
      if (data) setEvents(data);
    }

    loadEvents();
  }, []);

  return events;
} 