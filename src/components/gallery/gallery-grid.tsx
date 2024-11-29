"use client";

import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageDialog } from "@/components/gallery/image-dialog";
import { formatDate } from "@/lib/utils";
import { Eye, Download, MoreVertical, Tag } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const images = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1513593771513-7b58b6c4af38",
    event: "Maratón de Madrid 2024",
    date: "2024-04-15",
    tags: ["Llegada", "Individual"],
    sales: 5,
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5",
    event: "Trail Sierra Norte",
    date: "2024-03-20",
    tags: ["Paisaje", "Grupo"],
    sales: 3,
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211",
    event: "San Silvestre Vallecana",
    date: "2023-12-31",
    tags: ["Salida", "Grupo"],
    sales: 8,
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8",
    event: "10K Valencia",
    date: "2024-02-15",
    tags: ["Avituallamiento"],
    sales: 2,
  },
];

export function GalleryGrid() {
  const [selectedImage, setSelectedImage] = useState<typeof images[0] | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <Card key={image.id} className="overflow-hidden">
            <div className="relative aspect-[4/3]">
              <Image
                src={image.url}
                alt={image.event}
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
                  <h3 className="font-medium">{image.event}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(image.date)}
                  </p>
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
              <div className="mt-2 flex flex-wrap gap-1">
                {image.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {image.sales} ventas
              </p>
            </div>
          </Card>
        ))}
      </div>

      <ImageDialog
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </>
  );
}