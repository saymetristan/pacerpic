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
  const BATCH_SIZE = 15;
  const DELAY_BETWEEN_BATCHES = 500;

  const validateFile = (file: File) => {
    if (!VALID_TYPES.includes(file.type)) {
      throw new Error('Tipo de archivo no válido');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('Archivo demasiado grande (máx 25MB)');
    }
  };

  const uploadSingle = async (file: File, tag: string): Promise<void> => {
    const fileName = `${Date.now()}-${file.name}`;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tag', tag);
      
      setUploadProgress(prev => ({
        ...prev,
        [fileName]: { fileName, progress: 0, status: 'uploading' }
      }));

      const response = await fetch('/api/upload/photographer', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error(`Error ${response.status}: ${await response.text()}`);
      
      setUploadProgress(prev => ({
        ...prev,
        [fileName]: { fileName, progress: 100, status: 'completed' }
      }));
    } catch (error: unknown) {
      const uploadError = error as UploadError;
      setUploadProgress(prev => ({
        ...prev,
        [fileName]: { fileName, progress: 0, status: 'error', error: uploadError.message }
      }));
      throw uploadError;
    }
  };

  const uploadImages = async (files: File[], tag: string) => {
    const totalFiles = files.length;
    const batches = Math.ceil(totalFiles / BATCH_SIZE);
    let successCount = 0;
    
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE);
      const updates = batch.map(file => uploadSingle(file, tag));
      
      try {
        await Promise.all(updates);
        successCount += batch.length;
        console.log(`Progreso: ${successCount}/${totalFiles} (${Math.round(successCount/totalFiles*100)}%)`);
        
        if (i + BATCH_SIZE < files.length) {
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
        }
      } catch (error) {
        console.error(`Error en lote ${Math.floor(i/BATCH_SIZE) + 1}/${batches}:`, error);
        // Continuar con siguiente lote
      }
    }

    return successCount > 0;
  };

  return {
    uploadImages,
    uploadProgress,
    clearProgress: () => setUploadProgress({})
  };
}