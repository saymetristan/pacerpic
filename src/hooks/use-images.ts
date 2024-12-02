import { useState } from 'react';
import axios from 'axios';
import { useUser } from '@auth0/nextjs-auth0/client';

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'processing' | 'processed' | 'error';
}

export function useImages() {
  const { user } = useUser();
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});

  const uploadEventImage = async (file: File, eventId: string) => {
    const fileName = file.name;
    
    if (!user?.sub) {
      console.error('Usuario no autenticado');
      return;
    }

    setUploadProgress(prev => ({
      ...prev,
      [fileName]: { fileName, progress: 0, status: 'pending' }
    }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('eventId', eventId);
      formData.append('photographerId', user.sub);

      const response = await axios.post('/api/images/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
          setUploadProgress(prev => ({
            ...prev,
            [fileName]: { ...prev[fileName], progress, status: 'processing' }
          }));
        }
      });

      setUploadProgress(prev => ({
        ...prev,
        [fileName]: { ...prev[fileName], progress: 100, status: 'processed' }
      }));

      return response.data;
    } catch (error) {
      setUploadProgress(prev => ({
        ...prev,
        [fileName]: { ...prev[fileName], status: 'error' }
      }));
      throw error;
    }
  };

  return {
    uploadEventImage,
    uploadProgress
  };
} 