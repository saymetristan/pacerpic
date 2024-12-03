"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { useUser } from '@auth0/nextjs-auth0/client';
import Link from "next/link";

interface AuthButtonsProps {
  isScrolled: boolean;
}

export function AuthButtons({ isScrolled }: AuthButtonsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, isLoading } = useUser();

  if (isLoading) return null;

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <>
          <Button
            className="bg-[#EC6533] hover:bg-[#EC6533]/90 text-white transition-colors"
          >
            <Link href="/admin">Dashboard</Link>
          </Button>
          <Button
            variant="ghost"
            className={`transition-colors ${
              isScrolled 
                ? "text-[#1A3068] hover:bg-[#1A3068]/10" 
                : "text-white hover:bg-white/20"
            }`}
            asChild
          >
            <a href={`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/logout`}>Cerrar Sesión</a>
          </Button>
        </>
      ) : (
        <>
          <Button
            variant="ghost"
            className={`transition-colors ${
              isScrolled 
                ? "text-[#1A3068] hover:bg-[#1A3068]/10" 
                : "text-white hover:bg-white/20"
            }`}
            asChild
          >
            <a href={`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/login`}>Iniciar Sesión</a>
          </Button>
          
          <Button
            className="bg-[#EC6533] hover:bg-[#EC6533]/90 text-white transition-colors"
            onClick={() => setIsModalOpen(true)}
          >
            Registrarse
          </Button>

          <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
      )}
    </div>
  );
}