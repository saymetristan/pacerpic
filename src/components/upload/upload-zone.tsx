"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useImages } from "@/hooks/use-images";
import { UploadProgress } from "./upload-progress";

export function UploadZone({ eventId }: { eventId: string }) {
  const [uploadingFiles, setUploadingFiles] = useState<{
    name: string;
    progress: number;
    status: 'pending' | 'processing' | 'processed' | 'error';
  }[]>([]);

  const { uploadEventImage } = useImages();

  // Validar que eventId sea un UUID válido antes de permitir subidas
  if (!eventId || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(eventId)) {
    return <div>ID de evento inválido</div>;
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      name: file.name,
      progress: 0,
      status: 'pending' as const
    }));

    setUploadingFiles(prev => [...prev, ...newFiles]);

    // Subir archivos en paralelo
    await Promise.all(
      acceptedFiles.map(async (file, index) => {
        try {
          // Actualizar estado a procesando
          setUploadingFiles(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], status: 'processing' };
            return updated;
          });

          const result = await uploadEventImage(file, eventId);

          // Actualizar estado a completado
          setUploadingFiles(prev => {
            const updated = [...prev];
            updated[index] = { 
              ...updated[index], 
              status: 'processed',
              progress: 100 
            };
            return updated;
          });

        } catch (error) {
          // Actualizar estado a error
          setUploadingFiles(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], status: 'error' };
            return updated;
          });
        }
      })
    );
  }, [eventId, uploadEventImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer",
          isDragActive && "border-primary bg-primary/10"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          Arrastra tus imágenes aquí o haz clic para seleccionarlas
        </p>
      </div>

      {uploadingFiles.length > 0 && (
        <UploadProgress files={uploadingFiles} />
      )}
    </div>
  );
}