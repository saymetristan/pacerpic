"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";

interface ImageDialogProps {
  image: {
    id: number;
    url: string;
    event: string;
    date: string;
    tags: string[];
    sales: number;
  } | null;
  onClose: () => void;
}

export function ImageDialog({ image, onClose }: ImageDialogProps) {
  if (!image) return null;

  return (
    <Dialog open={!!image} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{image.event}</DialogTitle>
        </DialogHeader>
        <div className="relative aspect-[4/3] mt-4">
          <Image
            src={image.url}
            alt={image.event}
            fill
            className="object-cover rounded-lg"
          />
        </div>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Detalles</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Fecha</p>
                <p className="text-sm font-medium">{formatDate(image.date)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ventas</p>
                <p className="text-sm font-medium">{image.sales}</p>
              </div>
            </div>
          </div>
          <Separator />
          <div>
            <h4 className="text-sm font-medium mb-2">Etiquetas</h4>
            <div className="flex flex-wrap gap-2">
              {image.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}