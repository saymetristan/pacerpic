"use client";

import { GalleryHeader } from "@/components/gallery/gallery-header";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { GalleryFilters } from "@/components/gallery/gallery-filters";
import { useState } from "react";

export default function AdminGalleryPage() {
  const [filters, setFilters] = useState({
    status: "all",
    events: [] as string[],
    tags: [] as string[]
  });

  return (
    <div className="p-8 space-y-8">
      <GalleryHeader />
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-64 flex-none">
          <GalleryFilters onFilterChange={setFilters} />
        </div>
        <div className="flex-1">
          <GalleryGrid filters={filters} />
        </div>
      </div>
    </div>
  );
} 