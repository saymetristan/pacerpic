"use client";

import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageDialog } from "@/components/gallery/image-dialog";
import { formatDate } from "@/lib/utils";
import { Eye, Download, MoreVertical, Tag } from "lucide-react";
import { useGallery, type GalleryImage } from "@/hooks/use-gallery";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GalleryGridProps {
  filters: {
    status: string;
    events: string[];
    tags: string[];
  };
}

export function GalleryGrid({ filters }: GalleryGridProps) {
  const { images, loading } = useGallery();
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const filteredImages = images.filter(image => {
    if (filters.status !== 'all' && image.status !== filters.status) return false;
    if (filters.events.length && !filters.events.includes(image.event_id || '')) return false;
    if (filters.tags.length && !filters.tags.includes(image.tag || '')) return false;
    return true;
  });

  if (loading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <div className="aspect-[4/3] bg-muted" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </Card>
      ))}
    </div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredImages.map((image) => (
          <Card key={image.id} className="overflow-hidden">
            <div className="relative aspect-[4/3]">
              <Image
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/originals/${image.original_url}`}
                alt={image.event?.name || ""}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => setSelectedImage(image)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="secondary">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{image.event?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(image.event?.date || '')}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {image.image_dorsals.map((dorsal, idx) => (
                      <Badge key={idx} variant="secondary">
                        #{dorsal.dorsal_number}
                      </Badge>
                    ))}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Tag className="mr-2 h-4 w-4" />
                      Editar etiquetas
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      Eliminar imagen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedImage && (
        <ImageDialog
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
}