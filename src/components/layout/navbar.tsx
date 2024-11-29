"use client";

import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <div className="h-16 border-b border-slate-200 px-4 flex items-center justify-between bg-white">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onMenuClick} 
          className="lg:hidden hover:bg-[#EC6533]/10"
        >
          <Menu className="h-5 w-5 text-[#1A3068]" />
        </Button>
        
        <div className="relative hidden sm:block ml-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#4A4A4A]" />
          <Input
            placeholder="Buscar eventos, imágenes..."
            className="pl-8 w-[200px] md:w-[300px] focus-visible:ring-[#EC6533]"
          />
        </div>
      </div>

      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:bg-[#EC6533]/10 transition-colors duration-200 mr-2"
            >
              <Bell className="h-5 w-5 text-[#1A3068]" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-[#EC6533] rounded-full" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuItem className="py-3 cursor-pointer hover:bg-[#EC6533]/10">
              <div className="flex flex-col gap-1">
                <span className="font-medium text-[#1A3068]">
                  Nueva venta de imagen
                </span>
                <span className="text-sm text-[#4A4A4A]">
                  Evento: Maratón Madrid
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="py-3 cursor-pointer hover:bg-[#EC6533]/10">
              <div className="flex flex-col gap-1">
                <span className="font-medium text-[#1A3068]">
                  Recordatorio
                </span>
                <span className="text-sm text-[#4A4A4A]">
                  Asignar imágenes al evento
                </span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}