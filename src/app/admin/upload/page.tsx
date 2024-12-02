"use client";

import { useState } from "react";
import { UploadHeader } from "@/components/upload/upload-header";
import { UploadZone } from "@/components/upload/upload-zone";
import { UploadProgress } from "@/components/upload/upload-progress";
import { useImages } from "@/hooks/use-images";

export default function UploadPage() {
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const { uploadEventImage, uploadProgress } = useImages();
  const files = Object.values(uploadProgress);

  const handleUpload = async (acceptedFiles: File[]) => {
    try {
      await Promise.all(
        acceptedFiles.map(file => uploadEventImage(file, selectedEventId))
      );
    } catch (err) {
      console.error("Error al subir las imágenes:", err);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col p-8">
      <UploadHeader onEventChange={setSelectedEventId} />
      
      {selectedEventId && (
        <div className="flex-1 grid gap-6 lg:grid-cols-[1fr,400px] mt-8 h-[calc(100%-5rem)]">
          <UploadZone 
            onUpload={handleUpload}
            isUploading={files.some(f => f.status === 'pending' || f.status === 'processing')}
          />
          <UploadProgress files={files} />
        </div>
      )}
    </div>
  );
}