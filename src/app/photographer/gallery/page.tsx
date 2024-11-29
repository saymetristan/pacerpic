import { GalleryHeader } from "@/components/gallery/gallery-header";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { GalleryFilters } from "@/components/gallery/gallery-filters";

export default function GalleryPage() {
  return (
    <div className="p-8 space-y-8">
      <GalleryHeader />
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-64 flex-none">
          <GalleryFilters />
        </div>
        <div className="flex-1">
          <GalleryGrid />
        </div>
      </div>
    </div>
  );
}