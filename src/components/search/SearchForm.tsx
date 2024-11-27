"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const races = [
  { id: "1", name: "Maratón CDMX 2024", date: "21 Abril 2024" },
  { id: "2", name: "Medio Maratón Guadalajara", date: "15 Mayo 2024" },
  { id: "3", name: "Carrera San Silvestre", date: "31 Diciembre 2024" },
];

export function SearchForm() {
  const [selectedRace, setSelectedRace] = useState("");
  const [dorsal, setDorsal] = useState("");

  const handleSearch = () => {
    if (!selectedRace || !dorsal) return;
    // Implementar lógica de búsqueda
    console.log("Searching:", { race: selectedRace, dorsal });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="flex flex-col gap-4 w-full max-w-md mx-auto"
    >
      <Select onValueChange={setSelectedRace}>
        <SelectTrigger className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <SelectValue placeholder="Selecciona tu carrera" />
        </SelectTrigger>
        <SelectContent>
          {races.map((race) => (
            <SelectItem key={race.id} value={race.id}>
              <div className="flex flex-col">
                <span>{race.name}</span>
                <span className="text-sm text-muted-foreground">{race.date}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          type="text"
          value={dorsal}
          onChange={(e) => setDorsal(e.target.value)}
          placeholder="Ingresa tu número de dorsal"
          className="bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-white/70"
        />
        <Button
          onClick={handleSearch}
          disabled={!selectedRace || !dorsal}
          className="bg-[#EC6533] hover:bg-[#d55a2d] text-white w-full sm:w-auto disabled:opacity-50"
        >
          Buscar fotos <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}