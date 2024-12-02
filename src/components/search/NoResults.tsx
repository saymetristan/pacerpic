"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Link from "next/link";

export function NoResults({ dorsal }: { dorsal: string }) {
  return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <Card className="w-full max-w-md p-8 text-center bg-white shadow-lg rounded-2xl">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-[#F5F5F5] p-4">
            <Search className="h-8 w-8 text-[#1A3068]" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-[#1A3068] mb-4">
          No encontramos fotos
        </h2>
        
        <p className="text-[#4A4A4A] mb-6">
          No hemos encontrado fotos para el dorsal <span className="font-semibold">{dorsal}</span> en este evento. 
          Esto puede deberse a que:
        </p>

        <ul className="text-[#4A4A4A] text-sm mb-8 space-y-3">
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#EC6533]" />
            El número de dorsal ingresado no es correcto
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#EC6533]" />
            Las fotos aún están siendo procesadas
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#EC6533]" />
            No hay fotos disponibles para este dorsal
          </li>
        </ul>

        <Link href="/" className="block">
          <Button 
            className="w-full bg-[#1A3068] hover:bg-[#1A3068]/90 text-white font-medium py-2.5"
          >
            Realizar nueva búsqueda
          </Button>
        </Link>
      </Card>
    </div>
  );
} 