"use client";

import { useGallery } from "@/hooks/use-gallery";
import { Input } from "@/components/ui/input";

export function GalleryHeader({ eventName }: { eventName?: string }) {
  const { searchQuery, setSearchQuery } = useGallery();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {eventName || 'Galería'}
        </h2>
        <p className="text-muted-foreground">
          Gestiona y organiza todas tus fotografías
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Input
          placeholder="Buscar imágenes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>
    </div>
  );
}