// src/components/search/SearchForm.tsx

"use client";

import { useState } from "react";
import { ArrowRight, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useEvents } from "@/hooks/use-events";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Si tienes la interfaz Event en un archivo separado, impórtala aquí
// import { Event } from "@/hooks/use-events";

export function SearchForm() {
  const router = useRouter();
  const { events, loading } = useEvents();
  const [selectedRace, setSelectedRace] = useState<string>("");
  const [dorsal, setDorsal] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleDorsalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setDorsal(value);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRace || !dorsal) return;
    
    if (!/^\d+$/.test(dorsal)) {
      alert('Por favor, ingresa un número de dorsal válido');
      return;
    }
    
    setIsLoading(true);
    router.push(`/search?eventId=${selectedRace}&dorsal=${dorsal}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="flex flex-col gap-4 w-full max-w-md mx-auto"
    >
      <form onSubmit={handleSearch} className="flex flex-col gap-4 w-full max-w-md mx-auto">
        <Select onValueChange={setSelectedRace} disabled={loading}>
          <SelectTrigger className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <SelectValue placeholder={loading ? "Cargando eventos..." : "Selecciona tu carrera"}>
              {selectedRace ? events.find(event => event.id === selectedRace)?.name : ""}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {events.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                <div className="flex flex-col space-y-1">
                  <span className="font-medium">{event.name}</span>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {event.date ? format(new Date(event.date + 'T00:00:00'), "d MMM yyyy", { locale: es }) : ''}
                    </span>
                    {event.images_count > 0 && (
                      <div className="flex items-center gap-1 text-[#EC6533]">
                        <Camera className="h-3 w-3" />
                        <span>{event.images_count.toLocaleString()} fotos</span>
                      </div>
                    )}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            type="text"
            value={dorsal}
            onChange={handleDorsalChange}
            placeholder="Ingresa tu número de dorsal"
            className="bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-white/70"
            maxLength={5}
          />
          <Button
            type="submit"
            disabled={!selectedRace || !dorsal || isLoading}
            className="bg-[#EC6533] hover:bg-[#d55a2d] text-white w-full sm:w-auto disabled:opacity-50"
          >
            {isLoading ? (
              "Buscando..."
            ) : (
              <>
                Buscar fotos <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
