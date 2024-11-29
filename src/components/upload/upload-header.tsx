"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function UploadHeader() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Subir Imágenes</h2>
        <p className="text-muted-foreground">
          Sube y organiza las fotografías de tus eventos
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Select>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Selecciona un evento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="madrid2024">Maratón de Madrid 2024</SelectItem>
            <SelectItem value="trail2024">Trail Sierra Norte</SelectItem>
            <SelectItem value="sansilv2023">San Silvestre Vallecana</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}