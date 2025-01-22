"use client";

import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface UploadZoneProps {
  onUpload: (files: File[]) => void;
  isUploading: boolean;
}

export function UploadZone({ onUpload, isUploading }: UploadZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onUpload,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png']
    },
    disabled: isUploading
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <div
          {...getRootProps()}
          className={cn(
            "relative border-2 border-dashed rounded-lg transition-all duration-200 p-8",
            isDragActive ? "border-primary bg-primary/5" : "border-muted",
            isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/50"
          )}
        >
          <input {...getInputProps()} disabled={isUploading} />
          <div className="flex flex-col items-center gap-4">
            <div className={cn(
              "p-4 rounded-full bg-muted",
              isDragActive && "bg-primary/10"
            )}>
              <ImageIcon className={cn(
                "h-8 w-8",
                isDragActive ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-semibold">
                {isDragActive ? "Suelta para seleccionar" : "Arrastra tus imágenes aquí"}
              </h3>
              <p className="text-sm text-muted-foreground">
                o haz clic para seleccionarlas
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}