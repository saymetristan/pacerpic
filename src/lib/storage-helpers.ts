import { supabase } from './supabase';

export async function uploadImage(file: File, path: string) {
  const { data, error } = await supabase.storage
    .from('originals')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw error;
  }

  return data;
}

export async function getImageUrl(bucket: 'originals' | 'compressed', path: string) {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
} 