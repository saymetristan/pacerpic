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
  tags: string[];
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
          event:events(name, date, location),
          image_dorsals(dorsal_number, confidence)
        `)
        .order('created_at', { ascending: false }) as { data: SupabaseImage[] | null, error: any };

      if (error) throw error;
      
      // Transformar los datos para que coincidan con la interfaz
      const transformedData: GalleryImage[] = (data || []).map((img: SupabaseImage) => ({
        ...img,
        image_dorsals: Array.isArray(img.image_dorsals) ? img.image_dorsals : [],
        tags: img.tags || []
      }));
      
      setImages(transformedData);
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