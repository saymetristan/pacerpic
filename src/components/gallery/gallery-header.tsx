"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function GalleryHeader() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Galería</h2>
        <p className="text-muted-foreground">
          Gestiona y organiza todas tus fotografías
        </p>
      </div>
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre de evento, fecha, etiquetas..."
          className="pl-8"
        />
      </div>
    </div>
  );
}