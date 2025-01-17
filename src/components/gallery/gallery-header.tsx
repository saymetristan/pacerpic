"use client";

import { useGallery } from "@/hooks/use-gallery";

export function GalleryHeader() {
  const { searchQuery, setSearchQuery } = useGallery();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Galería</h2>
        <p className="text-muted-foreground">
          Gestiona y organiza todas tus fotografías
        </p>
      </div>
    </div>
  );
}