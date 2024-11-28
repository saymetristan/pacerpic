"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";

interface AuthButtonsProps {
  isScrolled: boolean;
}

export function AuthButtons({ isScrolled }: AuthButtonsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        className={`transition-colors ${
          isScrolled 
            ? "text-[#1A3068] hover:bg-[#1A3068]/10" 
            : "text-white hover:bg-white/20"
        }`}
        onClick={() => {/* Implementar lógica de inicio de sesión */}}
      >
        Iniciar Sesión
      </Button>
      
      <Button
        className="bg-[#EC6533] hover:bg-[#EC6533]/90 text-white transition-colors"
        onClick={() => setIsModalOpen(true)}
      >
        Registrarse
      </Button>

      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}