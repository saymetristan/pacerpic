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
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Variables de entorno faltantes:', {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      });
      throw new Error('Configuración incompleta');
    }

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${tag.replace(/\s+/g, '_')}/${fileName}`;
    
    console.log('Iniciando subida:', { fileName, filePath, fileSize: file.size, fileType: file.type });

    try {
      validateFile(file);
      console.log('Archivo validado correctamente');
      
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
          console.log('Progreso compresión:', progress);
          setUploadProgress(prev => ({
            ...prev,
            [fileName]: { 
              ...prev[fileName],
              progress: Math.round(progress * 0.5)
            }
          }));
        }
      );
      
      console.log('Archivo comprimido:', { 
        originalSize: file.size, 
        compressedSize: compressedFile.size 
      });

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/juntos/${filePath}`;
        console.log('URL de subida:', url);

        xhr.open('POST', url);
        xhr.setRequestHeader('Authorization', `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`);
        xhr.setRequestHeader('x-upsert', 'true');
        xhr.setRequestHeader('Content-Type', 'image/jpeg');

        xhr.onreadystatechange = () => {
          console.log('Estado XHR:', { 
            readyState: xhr.readyState,
            status: xhr.status,
            response: xhr.responseText
          });
        };

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

        xhr.onerror = (event) => {
          console.error('Error XHR:', {
            event,
            status: xhr.status,
            response: xhr.responseText,
            headers: xhr.getAllResponseHeaders()
          });
          
          clearTimeout(timeout);
          if (retryCount < MAX_RETRIES) {
            console.log(`Reintentando subida (${retryCount + 1}/${MAX_RETRIES})`);
            setTimeout(() => {
              uploadSingle(file, tag, retryCount + 1)
                .then(resolve)
                .catch(reject);
            }, Math.pow(2, retryCount) * 1000);
          } else {
            const error = new Error('Máximo de reintentos alcanzado');
            console.error('Error final:', error);
            setUploadProgress(prev => ({
              ...prev,
              [fileName]: { 
                fileName, 
                progress: 0, 
                status: 'error',
                error: 'Error de conexión después de varios intentos' 
              }
            }));
            reject(error);
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