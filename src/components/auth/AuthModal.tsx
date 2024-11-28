"use client";

import { motion } from "framer-motion";
import { Camera, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const handleOptionClick = (type: 'photographer' | 'organizer') => {
    console.log(`Selected ${type}`);
    // Implementar lógica de registro
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-[#1A3068]">
            Selecciona tu tipo de cuenta
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              className="w-full h-auto py-6 flex flex-col items-center gap-3 hover:border-[#EC6533] hover:bg-[#EC6533]/5 group"
              onClick={() => handleOptionClick('photographer')}
            >
              <Camera className="h-12 w-12 text-[#1A3068] group-hover:text-[#EC6533] transition-colors" />
              <span className="text-lg font-medium text-[#1A3068] group-hover:text-[#EC6533] transition-colors">
                Soy Fotógrafo
              </span>
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              className="w-full h-auto py-6 flex flex-col items-center gap-3 hover:border-[#EC6533] hover:bg-[#EC6533]/5 group"
              onClick={() => handleOptionClick('organizer')}
            >
              <Users className="h-12 w-12 text-[#1A3068] group-hover:text-[#EC6533] transition-colors" />
              <span className="text-lg font-medium text-[#1A3068] group-hover:text-[#EC6533] transition-colors">
                Soy Organizador
              </span>
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}