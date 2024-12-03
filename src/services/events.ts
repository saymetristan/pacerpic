import { supabase } from '@/lib/supabase';

export const eventsService = {
  async create(data: { name: string; date: string; location: string; organizer_id: string }) {
    return supabase.from('events').insert(data).select().single();
  },

  async getAll() {
    return supabase.from('events').select('*');
  },

  async getById(id: string) {
    return supabase.from('events').select('*').eq('id', id).single();
  },

  async update(id: string, data: Partial<{ name: string; date: string; location: string }>) {
    return supabase.from('events').update(data).eq('id', id);
  },

  async delete(id: string) {
    return supabase.from('events').delete().eq('id', id);
  }
}; 