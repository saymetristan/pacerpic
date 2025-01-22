"use client";

import { useState } from "react";
import { UploadHeader } from "@/components/upload/upload-header";
import { UploadZone } from "@/components/upload/upload-zone";
import { UploadProgress } from "@/components/upload/upload-progress";
import { useImages } from "@/hooks/use-images";
import { Button } from "@/components/ui/button";

export default function UploadPage() {
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const { uploadEventImage, uploadProgress } = useImages();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const files = Object.values(uploadProgress);

  const handleFileSelection = (acceptedFiles: File[]) => {
    setSelectedFiles(prev => [...prev, ...acceptedFiles]);
  };

  const handleProcess = async () => {
    try {
      await Promise.all(
        selectedFiles.map(file => uploadEventImage(file, selectedEventId))
      );
      setSelectedFiles([]); // Limpiar archivos después de procesar
    } catch (err) {
      console.error("Error al subir las imágenes:", err);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col p-8">
      <UploadHeader onEventChange={setSelectedEventId} />
      
      {selectedEventId && (
        <div className="flex-1 grid gap-6 lg:grid-cols-[1fr,400px] mt-8 h-[calc(100%-5rem)]">
          <div className="space-y-4">
            <UploadZone 
              onUpload={handleFileSelection}
              isUploading={files.some(f => f.status === 'pending' || f.status === 'processing')}
            />
            
            {selectedFiles.length > 0 && (
              <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
                <span>{selectedFiles.length} archivos seleccionados</span>
                <Button 
                  onClick={handleProcess}
                  className="bg-[#EC6533] hover:bg-[#EC6533]/90 text-white"
                >
                  Procesar {selectedFiles.length} imágenes
                </Button>
              </div>
            )}
          </div>
          
          <UploadProgress files={files} />
        </div>
      )}
    </div>
  );
}