"use client";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface UploadProgressProps {
  files: {
    name: string;
    progress: number;
    status: 'pending' | 'processing' | 'processed' | 'error';
  }[];
}

export function UploadProgress({ files }: UploadProgressProps) {
  const totalFiles = files.length;
  const completed = files.filter(f => f.status === 'processed').length;
  const processing = files.filter(f => f.status === 'processing').length;
  const pending = files.filter(f => f.status === 'pending').length;
  const failed = files.filter(f => f.status === 'error').length;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4">
        <h3 className="font-semibold mb-4">Progreso de Subida</h3>
        <div className="space-y-4">
          {files.map((file, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{file.name}</span>
                <span>{file.progress}%</span>
              </div>
              <Progress value={file.progress} />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="font-semibold mb-4">Resumen</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Total de imágenes</span>
            <span>{totalFiles}</span>
          </div>
          <div className="flex justify-between">
            <span>Subidas completadas</span>
            <span>{completed}</span>
          </div>
          <div className="flex justify-between">
            <span>En progreso</span>
            <span>{processing}</span>
          </div>
          <div className="flex justify-between">
            <span>Pendientes</span>
            <span>{pending}</span>
          </div>
          {failed > 0 && (
            <div className="flex justify-between text-red-500">
              <span>Fallidas</span>
              <span>{failed}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <Button className="w-full">
          <Upload className="mr-2 h-4 w-4" />
          Iniciar Subida
        </Button>
        <Button variant="outline" size="icon">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}