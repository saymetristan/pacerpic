"use client";

import { motion } from "framer-motion";
import { SearchForm } from "@/components/search/SearchForm";

export function HeroSection() {
  return (
    <div className="container mx-auto px-4 text-center text-white">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl md:text-7xl font-bold mb-6"
      >
        Vive Cada Paso,<br />Captura Cada Logro
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto"
      >
        Tus momentos deportivos al alcance de un clic. Encuentra y comparte tus fotos sin complicaciones ni registros.
      </motion.p>
      
      <SearchForm />
    </div>
  );
}