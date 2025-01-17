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
    id: string;
    original_url: string;
    compressed_url: string;
    event?: {
      name: string;
      date: string;
    } | null;
    image_dorsals: {
      dorsal_number: string;
      confidence: number;
    }[];
  };
  onClose: () => void;
}

export function ImageDialog({ image, onClose }: ImageDialogProps) {
  return (
    <div 
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="relative max-w-5xl w-full h-full flex items-center justify-center p-4">
        <Image
          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/original/${image.original_url}`}
          alt={image.event?.name || ""}
          width={1200}
          height={800}
          className="max-h-[90vh] w-auto object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}