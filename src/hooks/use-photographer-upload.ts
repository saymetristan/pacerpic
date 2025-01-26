import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useUser } from '@auth0/nextjs-auth0/client';
import { compressImage, compressImageWithProgress } from '../lib/image-compression';
import { UploadError } from '../types/errors';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error' | 'compressing';
  error?: string;
  retries?: number;
}

const VALID_TYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/avif',
  'image/tiff'
];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const MAX_RETRIES = 3;

export function usePhotographerUpload() {
  const { user } = useUser();
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});

  const validateFile = (file: File) => {
    if (!VALID_TYPES.includes(file.type)) {
      throw new Error('Tipo de archivo no válido');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('Archivo demasiado grande (máx 25MB)');
    }
  };

  const uploadSingle = async (file: File, tag: string, retryCount = 0): Promise<void> => {
    const fileName = `${Date.now()}-${file.name}`;
    
    try {
      validateFile(file);
      
      // Estado inicial de compresión
      setUploadProgress(prev => ({
        ...prev,
        [fileName]: { 
          fileName, 
          progress: 0,
          status: 'compressing',
          retries: retryCount 
        }
      }));

      const compressedFile = await compressImageWithProgress(
        file,
        (progress) => {
          setUploadProgress(prev => ({
            ...prev,
            [fileName]: { 
              ...prev[fileName],
              progress: Math.round(progress * 0.5) // La compresión es 50% del progreso
            }
          }));
        }
      );
      
      console.log('Archivo comprimido:', { 
        originalSize: file.size, 
        compressedSize: compressedFile.size 
      });

      // Preparar y enviar al endpoint
      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('tag', tag);
      
      const response = await fetch('/api/upload/photographer', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }

      // Actualizar estado a completado
      setUploadProgress(prev => ({
        ...prev,
        [fileName]: { fileName, progress: 100, status: 'completed' }
      }));
    } catch (error: unknown) {
      const uploadError = error as UploadError;
      setUploadProgress(prev => ({
        ...prev,
        [fileName]: { 
          fileName, 
          progress: 0, 
          status: 'error',
          error: uploadError.message 
        }
      }));
      throw uploadError;
    }
  };

  const uploadImages = async (files: File[], tag: string) => {
    const updates = files.map(file => uploadSingle(file, tag));
    
    try {
      await Promise.all(updates);
      return true;
    } catch (error) {
      console.error('Error en la subida:', error);
      return false;
    }
  };

  return {
    uploadImages,
    uploadProgress,
    clearProgress: () => setUploadProgress({})
  };
}