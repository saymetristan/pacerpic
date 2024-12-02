import { useState } from 'react';

export function useImages() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadEventImage = async (file: File, eventId: string) => {
    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('eventId', eventId);
      
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Error al subir imagen');
      
      const imageData = await response.json();
      return imageData;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return { uploadEventImage, isUploading, progress };
} 