"use client";

import { useState } from 'react';
import axios from 'axios';
import { useUser } from '@auth0/nextjs-auth0/client';
import imageCompression from 'browser-image-compression';
import { UploadProgress } from '@/types/upload';

export function useImages() {
  const { user } = useUser();
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});
  const [isUploading, setIsUploading] = useState(false);

  const uploadEventImage = async (file: File, eventId: string) => {
    if (!user?.sub) throw new Error('Usuario no autenticado');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('eventId', eventId);
    formData.append('photographerId', user.sub);

    try {
      const response = await axios.post('/api/images/queue', formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: { fileName: file.name, progress, status: 'queued' }
          }));
        }
      });

      return response.data;
    } catch (error) {
      setUploadProgress(prev => ({
        ...prev,
        [file.name]: { fileName: file.name, progress: 0, status: 'error' }
      }));
      throw error;
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