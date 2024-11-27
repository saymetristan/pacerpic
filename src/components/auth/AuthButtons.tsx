"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";

export function AuthButtons() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        className="text-white hover:bg-white/20 transition-colors"
        onClick={() => {/* Implementar lógica de inicio de sesión */}}
      >
        Iniciar Sesión
      </Button>
      
      <Button
        className="bg-[#EC6533] hover:bg-[#d55a2d] text-white transition-colors"
        onClick={() => setIsModalOpen(true)}
      >
        Registrarse
      </Button>

      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}