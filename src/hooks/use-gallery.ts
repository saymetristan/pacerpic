"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface GalleryImage {
  id: string;
  event_id: string | null;
  photographer_id: string | null;
  original_url: string;
  compressed_url: string;
  status: string | null;
  created_at: string;
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

export function useGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('images')
        .select(`
          *,
          event:events(name, date),
          image_dorsals(dorsal_number)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const filteredImages = images.filter(image => 
    image.event?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    image.image_dorsals.some(dorsal => 
      dorsal.dorsal_number.includes(searchQuery)
    )
  );

  return {
    images: filteredImages,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    refreshImages: fetchImages
  };
} 