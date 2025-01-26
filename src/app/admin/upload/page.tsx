"use client";

import { useState, useEffect } from "react";
import { UploadHeader } from "@/components/upload/upload-header";
import { UploadZone } from "@/components/upload/upload-zone";
import { UploadProgress } from "@/components/upload/upload-progress";
import { useImages } from "@/hooks/use-images";
import { useEvents } from "@/hooks/use-events";
import { useUser } from '@auth0/nextjs-auth0/client';
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Image from "next/image";

export default function UploadPage() {
  const { user } = useUser();
  const { singleEvent, loading: eventsLoading } = useEvents(user?.sub);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const { uploadEventImage, uploadProgress } = useImages();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const files = Object.values(uploadProgress);

  // Establecer automáticamente el evento único si existe
  useEffect(() => {
    if (singleEvent) {
      setSelectedEventId(singleEvent.id);
    }
  }, [singleEvent]);

  const handleFileSelection = (acceptedFiles: File[]) => {
    setSelectedFiles(prev => [...prev, ...acceptedFiles]);
  };

  const handleProcess = async () => {
    try {
      await Promise.all(
        selectedFiles.map(file => uploadEventImage(file, selectedEventId))
      );
      setSelectedFiles([]);
    } catch (err) {
      console.error("Error al subir las imágenes:", err);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  if (eventsLoading) {
    return <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EC6533]" />
    </div>;
  }

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
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto p-4 bg-muted rounded-lg">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square relative rounded-lg overflow-hidden">
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          fill
                          className="object-cover"
                        />
                        <button
                          onClick={() => removeFile(index)}
                          className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs mt-1 truncate">{file.name}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
                  <span>{selectedFiles.length} archivos seleccionados</span>
                  <Button 
                    onClick={handleProcess}
                    className="bg-[#EC6533] hover:bg-[#EC6533]/90 text-white"
                  >
                    Procesar {selectedFiles.length} imágenes
                  </Button>
                </div>
              </>
            )}
          </div>
          
          <UploadProgress files={files} />
        </div>
      )}
    </div>
  );
}