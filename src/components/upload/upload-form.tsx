"use client";

import React, { useState } from 'react';
import { useImages } from '@/hooks/use-images';
import { useDropzone } from 'react-dropzone';
import { Progress } from '@/components/ui/progress';

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

export function UploadForm() {
  const eventId = 'e0c77c6d-6f34-4c8c-a532-f9946baa1820';
  const { uploadEventImage, isUploading, progress } = useImages();
  const [selectedTag, setSelectedTag] = useState("");

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    disabled: isUploading,
    onDrop: async (files) => {
      for (const file of files) {
        await uploadEventImage(file, eventId, selectedTag);
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Maratón de Madrid 2024</h3>
        <p className="text-sm text-muted-foreground">15 de Abril, 2024</p>
      </div>

      <div className="max-w-xs mb-4">
        <label className="block mb-1 font-semibold">Zona / Tag</label>
        <select
          className="border rounded p-2 w-full"
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
        >
          <option value="">Seleccionar...</option>
          {possibleTags.map(tag => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
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