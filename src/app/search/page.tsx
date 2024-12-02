"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { MagicCard } from "@/components/ui/magic-card";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { NoResults } from "@/components/search/NoResults";

const ITEMS_PER_PAGE = 9;

interface Image {
  id: string;
  original_url: string;
  // otros campos que pueda tener la imagen
}

export default function SearchResults() {
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get("dorsal") || "");
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [page, setPage] = useState(1);
  const eventId = searchParams.get("eventId");

  const handleDorsalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo permitir números
    const value = e.target.value.replace(/[^0-9]/g, '');
    setSearchInput(value);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput) return;

    setLoading(true);
    router.push(`/search?eventId=${eventId}&dorsal=${searchInput}`);
  };

  useEffect(() => {
    const fetchImages = async () => {
      const dorsal = searchParams.get("dorsal");
      if (!eventId || !dorsal) {
        setImages([]);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/search?eventId=${eventId}&dorsal=${dorsal}`
        );
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error('Error en la búsqueda');
        }
        
        setImages(data);
      } catch (error) {
        console.error('Error:', error);
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [searchParams]); // Solo se ejecuta cuando cambian los parámetros de búsqueda

  const paginatedImages = images.slice(0, page * ITEMS_PER_PAGE);
  const hasMore = images.length > paginatedImages.length;

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full transition-all duration-300 bg-white/95 dark:bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-auto relative">
              <Image 
                src={theme === 'dark' ? '/images/logo-light.png' : '/images/logo-dark.png'} 
                alt="PacerPic" 
                width={120} 
                height={32}
                className="object-contain"
                priority
              />
            </div>
          </Link>

          <form onSubmit={handleSearch} className="flex items-center space-x-4 flex-1 justify-end max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar dorsal..."
                value={searchInput}
                onChange={handleDorsalChange}
                className="pl-9 border-input"
                maxLength={5}
              />
            </div>
            <Button 
              type="submit"
              className="bg-[#EC6533] hover:bg-[#EC6533]/90 text-white"
              disabled={!searchInput}
            >
              Buscar
            </Button>
          </form>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <MagicCard 
                key={i} 
                className="aspect-[4/3] rounded-lg bg-muted animate-pulse"
                gradientColor="#EC6533"
              />
            ))}
          </div>
        ) : (
          <>
            {images.length > 0 ? (
              <>
                <h1 className="text-3xl font-bold mb-8 text-[#1A3068] dark:text-white">
                  Resultados para dorsal: {searchParams.get("dorsal")}
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedImages.map((image) => (
                    <div 
                      key={image.id} 
                      className="cursor-pointer"
                      onClick={() => setSelectedImage(image)}
                    >
                      <MagicCard
                        className="relative group overflow-hidden rounded-lg"
                        gradientColor="#EC6533"
                      >
                        <Image
                          src={image.original_url}
                          alt={`Dorsal ${searchParams.get("dorsal")}`}
                          width={400}
                          height={300}
                          className="rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.src = '/placeholder-image.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </MagicCard>
                    </div>
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-8 text-center">
                    <Button
                      onClick={() => setPage(p => p + 1)}
                      className="bg-[#1A3068] hover:bg-[#1A3068]/90 text-white"
                    >
                      Cargar más fotos
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <NoResults dorsal={searchParams.get("dorsal") || ""} />
            )}
          </>
        )}
      </main>

      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={() => setSelectedImage(null)}
        >
          <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-black/50 hover:bg-black/70 text-white"
              onClick={(e) => {
                e.stopPropagation();
                const currentIndex = paginatedImages.findIndex(img => img.id === selectedImage.id);
                const prevImage = paginatedImages[currentIndex - 1];
                if (prevImage) setSelectedImage(prevImage);
              }}
              disabled={paginatedImages.findIndex(img => img.id === selectedImage.id) === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-black/50 hover:bg-black/70 text-white"
              onClick={(e) => {
                e.stopPropagation();
                const currentIndex = paginatedImages.findIndex(img => img.id === selectedImage.id);
                const nextImage = paginatedImages[currentIndex + 1];
                if (nextImage) setSelectedImage(nextImage);
              }}
              disabled={paginatedImages.findIndex(img => img.id === selectedImage.id) === paginatedImages.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-black/50 hover:bg-black/70 text-white ml-2"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div
            className="relative w-full h-full flex items-center justify-center p-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative w-full max-w-6xl aspect-[4/3]">
              <Image
                src={selectedImage.original_url}
                alt={`Dorsal ${searchParams.get("dorsal")}`}
                fill
                className="object-contain"
                quality={100}
                priority
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 