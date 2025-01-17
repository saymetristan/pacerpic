"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

export interface GalleryImage {
  id: string;
  event_id: string | null;
  photographer_id: string | null;
  original_url: string;
  compressed_url: string;
  status: string | null;
  created_at: string;
  tags: string[] | null;
  event: {
    name: string;
    date: string;
    location: string | null;
  } | null;
  image_dorsals: {
    dorsal_number: string;
    confidence: number;
  }[];
  sales_count?: number;
}

interface SupabaseImage {
  id: string;
  event_id: string | null;
  photographer_id: string | null;
  original_url: string;
  compressed_url: string;
  status: string | null;
  created_at: string;
  tags: string[] | null;
  event: {
    name: string;
    date: string;
    location: string | null;
  } | null;
  image_dorsals: {
    dorsal_number: string;
    confidence: number;
  }[] | null;
}

export function useGallery(userId?: string) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      if (!userId) return;
      
      const { data, error } = await supabase
        .from('images')
        .select(`
          id,
          event_id,
          photographer_id,
          original_url,
          compressed_url,
          status,
          created_at,
          tags,
          event:events(name, date, location),
          image_dorsals!images_image_dorsals_fkey(dorsal_number, confidence)
        `)
        .eq('photographer_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching images:', error);
        return;
      }

      const mappedImages: GalleryImage[] = ((data || []) as SupabaseImage[]).map(img => ({
        ...img,
        tags: img.tags || [],
        image_dorsals: Array.isArray(img.image_dorsals) ? img.image_dorsals : [],
        event: img.event ? { ...img.event, location: img.event.location || null } : null
      }));

      setImages(mappedImages);
      setLoading(false);
    };

    fetchImages();
  }, [userId]);

  return { images, loading };
} 