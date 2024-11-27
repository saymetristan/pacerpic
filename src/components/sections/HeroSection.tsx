"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { SearchForm } from "@/components/search/SearchForm";

export function HeroSection() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5"
          alt="Runner crossing finish line"
          fill
          className="object-cover brightness-50"
          priority
        />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
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
    </section>
  );
}