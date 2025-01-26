"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, ChevronLeft, ChevronRight, Download, Share, Maximize2, Copy, FacebookIcon, TwitterIcon } from "lucide-react";
import { MagicCard } from "@/components/ui/magic-card";
import { useTheme } from "next-themes";
import { NoResults } from "@/components/search/NoResults";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import Masonry from 'react-masonry-css';

const ITEMS_PER_PAGE = 9;

interface Image {
  id: string;
  original_url: string;
  // otros campos que pueda tener la imagen
}

const WhatsAppIcon = () => (
  <svg
    className="mr-2 h-4 w-4"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

function SearchContent() {
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get("dorsal") || "");
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [page, setPage] = useState(1);
  const [event, setEvent] = useState<{ name: string } | null>(null);
  const eventId = searchParams.get("eventId");
  const dorsal = searchParams.get("dorsal");
  const { toast } = useToast();

  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) return;
      
      try {
        const response = await fetch(`/api/events/${eventId}`);
        const data = await response.json();
        setEvent(data);
      } catch (error) {
        console.error('Error al obtener evento:', error);
      }
    };

    fetchEventData();
  }, [eventId]);

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

  const breakpointColumns = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full transition-all duration-300 bg-white/95 dark:bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-auto relative">
              <Image 
                src={theme === 'dark' ? '/images/logo-light.png' : '/images/logo-dark.png'} 
                alt="Pacerpic" 
                width={120} 
                height={32}
                className="object-contain"
                priority
              />
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="flex items-center space-x-4">
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

            <Button
              type="button"
              variant="outline"
              onClick={() => eventId && router.push(`/event/${eventId}`)}
              className="border-[#1A3068] text-[#1A3068] hover:bg-[#1A3068]/10"
              disabled={!eventId}
            >
              Ver todas las fotos
            </Button>
          </div>
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
                <Masonry
                  breakpointCols={breakpointColumns}
                  className="flex w-auto -ml-6"
                  columnClassName="pl-6 bg-clip-padding"
                >
                  {paginatedImages.map((image) => (
                    <div 
                      key={image.id}
                      className="mb-6 cursor-pointer relative group"
                      onClick={() => setSelectedImage(image)}
                    >
                      <MagicCard
                        className="relative overflow-hidden rounded-lg"
                        gradientColor="#EC6533"
                      >
                        <div className="relative w-full">
                          <Image
                            src={image.original_url}
                            alt={`Dorsal ${searchParams.get("dorsal")}`}
                            width={500}
                            height={500}
                            className="w-full h-auto"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                              variant="secondary"
                              size="icon"
                              className="bg-white/20 hover:bg-white/40"
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  const response = await fetch(image.original_url);
                                  const blob = await response.blob();
                                  const url = window.URL.createObjectURL(blob);
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.download = `dorsal-${searchParams.get("dorsal")}-${image.id}.jpg`;
                                  document.body.appendChild(link);
                                  link.click();
                                  link.remove();
                                  window.URL.revokeObjectURL(url);
                                } catch (error) {
                                  console.error('Error al descargar:', error);
                                }
                              }}
                            >
                              <Download className="h-4 w-4 text-white" />
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  className="bg-white/20 hover:bg-white/40"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (navigator.share) {
                                      navigator.share({
                                        title: `Dorsal ${searchParams.get("dorsal")}`,
                                        text: `Mira esta foto del dorsal ${searchParams.get("dorsal")} en ${event?.name}`,
                                        url: image.original_url
                                      });
                                    }
                                  }}
                                >
                                  <Share className="h-4 w-4 text-white" />
                                </Button>
                              </DropdownMenuTrigger>
                              {!navigator.share && (
                                <DropdownMenuContent align="end" className="w-56">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      navigator.clipboard.writeText(image.original_url);
                                      toast({
                                        description: "URL copiada al portapapeles",
                                      });
                                    }}
                                  >
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copiar enlace
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(image.original_url)}`, '_blank');
                                    }}
                                  >
                                    <FacebookIcon className="mr-2 h-4 w-4" />
                                    Compartir en Facebook
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(image.original_url)}&text=${encodeURIComponent(`Mira esta foto del dorsal ${searchParams.get("dorsal")} en ${event?.name}`)}`, '_blank');
                                    }}
                                  >
                                    <TwitterIcon className="mr-2 h-4 w-4" />
                                    Compartir en Twitter
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      window.open(`https://wa.me/?text=${encodeURIComponent(`Mira esta foto del dorsal ${searchParams.get("dorsal")} en ${event?.name}: ${image.original_url}`)}`, '_blank');
                                    }}
                                  >
                                    <WhatsAppIcon />
                                    Compartir en WhatsApp
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              )}
                            </DropdownMenu>

                            <Button
                              variant="secondary"
                              size="icon"
                              className="bg-white/20 hover:bg-white/40"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(image);
                              }}
                            >
                              <Maximize2 className="h-4 w-4 text-white" />
                            </Button>
                          </div>
                        </div>
                      </MagicCard>
                    </div>
                  ))}
                </Masonry>

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
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  const response = await fetch(selectedImage.original_url);
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `dorsal-${searchParams.get("dorsal")}-${selectedImage.id}.jpg`;
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                  window.URL.revokeObjectURL(url);
                } catch (error) {
                  console.error('Error al descargar:', error);
                }
              }}
            >
              <Download className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-black/50 hover:bg-black/70 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (navigator.share) {
                      navigator.share({
                        title: `Dorsal ${searchParams.get("dorsal")}`,
                        text: `Mira esta foto del dorsal ${searchParams.get("dorsal")} en ${event?.name}`,
                        url: selectedImage.original_url
                      });
                    }
                  }}
                >
                  <Share className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              {!navigator.share && (
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    onClick={() => {
                      navigator.clipboard.writeText(selectedImage.original_url);
                      toast({
                        description: "URL copiada al portapapeles",
                      });
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar enlace
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(selectedImage.original_url)}`, '_blank');
                    }}
                  >
                    <FacebookIcon className="mr-2 h-4 w-4" />
                    Compartir en Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(selectedImage.original_url)}&text=${encodeURIComponent(`Mira esta foto del dorsal ${searchParams.get("dorsal")} en ${event?.name}`)}`, '_blank');
                    }}
                  >
                    <TwitterIcon className="mr-2 h-4 w-4" />
                    Compartir en Twitter
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      window.open(`https://wa.me/?text=${encodeURIComponent(`Mira esta foto del dorsal ${searchParams.get("dorsal")} en ${event?.name}: ${selectedImage.original_url}`)}`, '_blank');
                    }}
                  >
                    <WhatsAppIcon />
                    Compartir en WhatsApp
                  </DropdownMenuItem>
                </DropdownMenuContent>
              )}
            </DropdownMenu>

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
            <div className="relative w-full max-w-[90vw] h-[90vh]">
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

export default function SearchResults() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <SearchContent />
    </Suspense>
  );
} 