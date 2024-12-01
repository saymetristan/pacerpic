"use client";

import { useImages } from '@/hooks/use-images';
import { useDropzone } from 'react-dropzone';
import { Progress } from '@/components/ui/progress';

export function UploadForm({ eventId }: { eventId: string }) {
  const { uploadEventImage, isUploading, progress } = useImages();

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    disabled: isUploading,
    onDrop: async (files) => {
      for (const file of files) {
        await uploadEventImage(file, eventId);
      }
    }
  });

  return (
    <div>
      <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-8 text-center">
        <input {...getInputProps()} />
        <p>Arrastra tus imágenes aquí o haz clic para seleccionarlas</p>
      </div>
      
      {isUploading && (
        <div className="mt-4">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-center mt-2">Subiendo imágenes...</p>
        </div>
      )}
    </div>
  );
} 