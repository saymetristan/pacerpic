import { useState } from 'react';
import { db } from '@/lib/db';
import { uploadImage, getImageUrl } from '@/lib/storage-helpers';

export function useImages() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadEventImage = async (file: File, eventId: string) => {
    try {
      setIsUploading(true);
      
      // Subir imagen original
      const path = `events/${eventId}/${file.name}`;
      const { data: uploadData } = await uploadImage(file, path);
      
      if (!uploadData?.path) throw new Error('Error al subir la imagen');

      // Guardar referencia en la base de datos
      const { data: imageData, error } = await db
        .from('images')
        .insert({
          event_id: eventId,
          original_url: uploadData.path,
          compressed_url: '', // Se actualizará cuando el trigger procese la imagen
          status: 'processing'
        })
        .select()
        .single();

      if (error) throw error;

      return imageData;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return {
    uploadEventImage,
    isUploading,
    progress
  };
} 