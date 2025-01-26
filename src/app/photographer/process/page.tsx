"use client";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { usePhotographerTutorial } from "@/hooks/use-photographer-tutorial";

const tagsByUser: Record<string, string[]> = {
  "rodrigo.foto@pacerpic.com": ["Salida Meta", "Centro de Convenciones"],
  "yoshi.foto@pacerpic.com": ["Convivencia Centro de Convenciones", "Laberinto Nido"],
  "memo.foto@pacerpic.com": ["Entrada Lago", "Rifa Ganadores"],
  "lalo.foto@pacerpic.com": ["Salida Lago", "Patrocinadores"],
  "tutiempoatiempo@pacerpic.com": [
    "Rampa Centro de Convenciones",
    "Photo Opportunity 10k",
    "Entrada Laberinto",
    "Laberinto Juan Escumbia",
    "Generales",
    "Photo Opportunity 3k, 5k y 10k"
  ]
};

export default function ProcessPage() {
  const { user } = useUser();
  const [processing, setProcessing] = useState<string | null>(null);
  const [processingTags, setProcessingTags] = useState<Set<string>>(new Set());

  const allTags = Object.values(tagsByUser).flat();

  const processTag = async (tag: string) => {
    setProcessing(tag);
    setProcessingTags(prev => new Set(Array.from(prev).concat(tag)));
    
    try {
      const response = await fetch('/api/process-tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tag,
          eventId: 'juntos-2024',
          photographerId: user?.sub
        })
      });

      if (!response.ok) throw new Error('Error al procesar imágenes');
      
      const data = await response.json();
      toast.success(`Procesadas ${data.processed} imágenes del tag ${tag}`);
    } catch (error) {
      toast.error(`Error procesando tag ${tag}`);
    } finally {
      setProcessing(null);
      setProcessingTags(prev => {
        const newSet = new Set(prev);
        newSet.delete(tag);
        return newSet;
      });
    }
  };

  usePhotographerTutorial('process');

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A3068]">Procesar Imágenes</h1>
        <p className="text-muted-foreground">
          Selecciona un tag para procesar sus imágenes
        </p>
        <p className="text-red-500 mt-2 font-semibold">
          ⚠️ Atención: El procesamiento de imágenes es una operación crítica. Asegúrate de seleccionar el tag correcto.
        </p>
      </div>

      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        data-tour="process-buttons"
      >
        {allTags.map((tag) => (
          <Button
            key={tag}
            variant="outline"
            className="h-24 text-lg"
            disabled={processingTags.has(tag)}
            onClick={() => processTag(tag)}
          >
            {processingTags.has(tag) ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary" />
                Procesando...
              </div>
            ) : (
              tag
            )}
          </Button>
        ))}
      </div>
    </div>
  );
} 