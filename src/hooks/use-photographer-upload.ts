import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useUser } from '@auth0/nextjs-auth0/client';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

export function usePhotographerUpload() {
  const { user } = useUser();
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});

  const uploadImages = async (files: File[], tag: string) => {
    const updates: Promise<void>[] = [];

    for (const file of files) {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${tag}/${fileName}`;

      setUploadProgress(prev => ({
        ...prev,
        [fileName]: { fileName, progress: 0, status: 'uploading' }
      }));

      const update = new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/photos/${filePath}`);
        
        xhr.setRequestHeader('Authorization', `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`);
        xhr.setRequestHeader('x-upsert', 'true');

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded * 100) / event.total);
            setUploadProgress(prev => ({
              ...prev,
              [fileName]: { ...prev[fileName], progress }
            }));
          }
        };

        xhr.onload = async () => {
          if (xhr.status === 200) {
            setUploadProgress(prev => ({
              ...prev,
              [fileName]: { fileName, progress: 100, status: 'completed' }
            }));
            resolve();
          } else {
            setUploadProgress(prev => ({
              ...prev,
              [fileName]: { fileName, progress: 0, status: 'error' }
            }));
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => {
          setUploadProgress(prev => ({
            ...prev,
            [fileName]: { fileName, progress: 0, status: 'error' }
          }));
          reject(new Error('Upload failed'));
        };

        xhr.send(file);
      });

      updates.push(update);
    }

    try {
      await Promise.all(updates);
      return true;
    } catch (error) {
      console.error('Error uploading files:', error);
      return false;
    }
  };

  return {
    uploadImages,
    uploadProgress
  };
}