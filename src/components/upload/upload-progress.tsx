"use client";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

export function UploadProgress() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4">
        <h3 className="font-semibold mb-4">Progreso de Subida</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>imagen_001.jpg</span>
              <span>75%</span>
            </div>
            <Progress value={75} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>imagen_002.jpg</span>
              <span>45%</span>
            </div>
            <Progress value={45} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>imagen_003.jpg</span>
              <span>20%</span>
            </div>
            <Progress value={20} />
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="font-semibold mb-4">Resumen</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Total de imágenes</span>
            <span>15</span>
          </div>
          <div className="flex justify-between">
            <span>Subidas completadas</span>
            <span>8</span>
          </div>
          <div className="flex justify-between">
            <span>En progreso</span>
            <span>3</span>
          </div>
          <div className="flex justify-between">
            <span>Pendientes</span>
            <span>4</span>
          </div>
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