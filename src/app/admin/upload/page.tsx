"use client";

import { useState } from "react";
import { UploadHeader } from "@/components/upload/upload-header";
import { UploadZone } from "@/components/upload/upload-zone";
import { UploadProgress } from "@/components/upload/upload-progress";
import { useImages } from "@/hooks/use-images";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useUser } from '@auth0/nextjs-auth0/client';

// Agrega este arreglo con los posibles tags
const possibleTags = [
  "Entrega de Kits Viernes",
  "Entrega de Kis Sabado",
  "Salida Meta",
  "Convivencia Centro de Convenciones",
  "Entrada Lago",
  "Salida Lago",
  "Patrocinadores",
  "Rampa Centro de Convenciones",
  "Photo Opportunity 10k",
  "Entrada Laberinto",
  "Laberinto Juan Escumbia",
  "Laberinto Nido",
  "Generales",
  "Photo Opportunity 3k, 5k y 10k",
  "Rifa Ganadores",
];

export default function UploadPage() {
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedTag, setSelectedTag] = useState(""); // Nuevo estado para el tag
  const { uploadEventImage, uploadProgress } = useImages();
  const files = Object.values(uploadProgress);
  const { toast } = useToast();
  const { user } = useUser();

  const handleFileSelection = (acceptedFiles: File[]) => {
    setSelectedFiles(prev => [...prev, ...acceptedFiles]);
  };

  const handleProcess = async () => {
    if (!selectedTag) {
      toast({
        title: "Error",
        description: "Debes seleccionar una zona/tag antes de procesar las imágenes",
        variant: "destructive"
      });
      return;
    }

    try {
      const formData = new FormData();
      
      // Agregar cada archivo al FormData
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      
      // Agregar los demás campos
      formData.append('eventId', selectedEventId);
      formData.append('photographerId', user?.sub || ''); // Asegúrate de tener acceso al user
      formData.append('tag', selectedTag);

      const response = await fetch('/api/fast-upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error al subir las imágenes');
      }

      const result = await response.json();
      
      toast({
        title: "Éxito",
        description: `${result.count} imágenes en proceso de subida`,
      });

      setSelectedFiles([]);
    } catch (err) {
      console.error("Error al subir las imágenes:", err);
      toast({
        title: "Error",
        description: "Hubo un error al procesar las imágenes",
        variant: "destructive"
      });
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col p-8">
      <UploadHeader onEventChange={setSelectedEventId} />
      
      {/* Dropdown para la selección del tag. Aplica a todas las imágenes seleccionadas. */}
      {selectedEventId && (
        <div className="mb-4 max-w-xs">
          <label className="block mb-1 font-semibold">Zona / Tag</label>
          <select
            className="border rounded p-2 w-full"
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
          >
            <option value="">Seleccionar...</option>
            {possibleTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      )}

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
                    disabled={!selectedTag}
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