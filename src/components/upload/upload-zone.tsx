"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useImages } from "@/hooks/use-images";
import { UploadProgress } from "./upload-progress";

export function UploadZone({ eventId }: { eventId: string }) {
  const { uploadEventImage, uploadProgress } = useImages();
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
    
    await Promise.all(
      acceptedFiles.map(file => uploadEventImage(file, eventId))
    );
  }, [eventId, uploadEventImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // Convertir el objeto de progreso a array para UploadProgress
  const progressFiles = Object.values(uploadProgress);

  return (
    <div className="space-y-6">
      <div {...getRootProps()} className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer",
        isDragActive && "border-primary bg-primary/10"
      )}>
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          Arrastra tus imágenes aquí o haz clic para seleccionarlas
        </p>
      </div>

      {progressFiles.length > 0 && (
        <UploadProgress files={progressFiles} />
      )}
    </div>
  );
}