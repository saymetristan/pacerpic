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
    const filePath = `${tag}/${fileName}`;

    try {
      validateFile(file);
      
      // Comprimir antes de subir
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
              progress: Math.round(progress * 0.5) // La compresión es 50% del progreso total
            }
          }));
        }
      );

      // Continuar con la subida del archivo comprimido
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/photos/${filePath}`);
        
        xhr.setRequestHeader('Authorization', `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`);
        xhr.setRequestHeader('x-upsert', 'true');

        const timeout = setTimeout(() => {
          xhr.abort();
          reject(new Error('Tiempo de espera agotado'));
        }, 30000);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const uploadProgress = Math.round((event.loaded * 100) / event.total);
            // El progreso de subida es el otro 50%
            const totalProgress = 50 + Math.round(uploadProgress * 0.5);
            setUploadProgress(prev => ({
              ...prev,
              [fileName]: { 
                fileName, 
                progress: totalProgress,
                status: 'uploading',
                retries: retryCount 
              }
            }));
          }
        };

        xhr.onload = () => {
          clearTimeout(timeout);
          if (xhr.status === 200) {
            setUploadProgress(prev => ({
              ...prev,
              [fileName]: { fileName, progress: 100, status: 'completed' }
            }));
            resolve();
          } else {
            throw new Error(`Error ${xhr.status}: ${xhr.statusText}`);
          }
        };

        xhr.onerror = () => {
          clearTimeout(timeout);
          if (retryCount < MAX_RETRIES) {
            setTimeout(() => {
              uploadSingle(file, tag, retryCount + 1)
                .then(resolve)
                .catch(reject);
            }, Math.pow(2, retryCount) * 1000);
          } else {
            setUploadProgress(prev => ({
              ...prev,
              [fileName]: { 
                fileName, 
                progress: 0, 
                status: 'error',
                error: 'Error de conexión después de varios intentos' 
              }
            }));
            reject(new Error('Máximo de reintentos alcanzado'));
          }
        };

        xhr.send(compressedFile);
      });
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