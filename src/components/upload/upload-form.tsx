"use client";

import { useImages } from '@/hooks/use-images';
import { useDropzone } from 'react-dropzone';
import { Progress } from '@/components/ui/progress';

export function UploadForm() {
  const eventId = 'e0c77c6d-6f34-4c8c-a532-f9946baa1820'; // ID del Maratón de Madrid 2024
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
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Maratón de Madrid 2024</h3>
        <p className="text-sm text-muted-foreground">15 de Abril, 2024</p>
      </div>

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