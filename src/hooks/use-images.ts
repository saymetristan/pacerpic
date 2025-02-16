"use client";

import { useState } from 'react';
import axios from 'axios';
import { useUser } from '@auth0/nextjs-auth0/client';
import imageCompression from 'browser-image-compression';

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'processing' | 'processed' | 'error';
}

export function useImages() {
  const { user } = useUser();
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});
  const [isUploading, setIsUploading] = useState(false);

  const uploadEventImage = async (file: File, eventId: string, tag: string) => {
    setIsUploading(true);
    const fileName = `${Date.now()}-${file.name}`;
    
    if (!user?.sub) {
      console.error('Usuario no autenticado');
      setIsUploading(false);
      return;
    }

    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 5,
        maxWidthOrHeight: 4096,
        useWebWorker: true,
        fileType: 'image/jpeg'
      });

      const processedFile = new File([compressedFile], fileName, {
        type: 'image/jpeg'
      });

      const formData = new FormData();
      formData.append('file', processedFile);
      formData.append('eventId', eventId);
      formData.append('photographerId', user.sub);
      formData.append('tag', tag);

      const response = await axios.post('/api/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
          setUploadProgress(prev => ({
            ...prev,
            [fileName]: { fileName, progress, status: 'processing' }
          }));
        }
      });

      setUploadProgress(prev => ({
        ...prev,
        [fileName]: { fileName, progress: 100, status: 'processed' }
      }));

      return response.data;
    } catch (error) {
      setUploadProgress(prev => ({
        ...prev,
        [fileName]: { fileName, progress: 0, status: 'error' }
      }));
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const progress = Object.values(uploadProgress)[0]?.progress || 0;

  return {
    uploadEventImage,
    uploadProgress,
    isUploading,
    progress
  };
} 