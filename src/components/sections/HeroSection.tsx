"use client";

import { motion } from "framer-motion";
import Image from "next/image";
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
        Captura tu momento de gloria
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto"
      >
        Encuentra y compra tus fotos deportivas al instante. Sin registro, sin complicaciones.
      </motion.p>
      
      <SearchForm />
    </div>
  );
}