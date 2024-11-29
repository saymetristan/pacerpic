"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function UploadZone() {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    }
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 transition-colors duration-200 ease-in-out",
          "flex flex-col items-center justify-center space-y-4 h-[400px]",
          isDragActive ? "border-primary bg-primary/5" : "border-muted"
        )}
      >
        <input {...getInputProps()} />
        <div className="p-4 rounded-full bg-primary/10">
          <Upload className="h-8 w-8 text-primary" />
        </div>
        <div className="text-center">
          <p className="text-lg font-medium">
            Arrastra tus imágenes aquí o haz clic para seleccionarlas
          </p>
          <p className="text-sm text-muted-foreground">
            Soporta JPG y PNG hasta 10MB por imagen
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {files.map((file, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg border bg-muted"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-white truncate rounded-b-lg">
                {file.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}