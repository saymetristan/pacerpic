import { db } from '@/lib/db';

export const eventsService = {
  async create(data: { name: string; date: string; location: string; organizer_id: string }) {
    return db.from('events').insert(data).select().single();
  },

  async getAll() {
    return db.from('events').select('*');
  },

  async getById(id: string) {
    return db.from('events').select('*').eq('id', id).single();
  },

  async update(id: string, data: Partial<{ name: string; date: string; location: string }>) {
    return db.from('events').update(data).eq('id', id);
  },

  async delete(id: string) {
    return db.from('events').delete().eq('id', id);
  }
}; 