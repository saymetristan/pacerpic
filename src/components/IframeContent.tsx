import { HeroSection } from "./sections/HeroSection";
import { SearchForm } from "./search/SearchForm";
import { MagicCard } from "./ui/magic-card";
import Image from "next/image";
import { sendIframeMessage } from "@/lib/iframe-messages";
import { useState } from "react";

export function IframeContent() {
  const [dorsal, setDorsal] = useState('');
  const eventId = 'default-event-id'; // Idealmente esto vendría como prop

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dorsal) return;
    
    sendIframeMessage({
      type: 'SEARCH',
      payload: { dorsal, eventId }
    });
  };

  return (
    <div className="w-full h-full bg-[#1B1863]">
      <section className="relative h-screen">
        <MagicCard 
          className="w-full h-full relative overflow-hidden"
          gradientColor="#C9384E"
          gradientOpacity={0.3}
        >
          <div className="absolute inset-0 w-full h-full">
            <Image
              src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5"
              alt="Runner crossing finish line"
              fill
              className="object-cover brightness-50"
              sizes="100vw"
              priority
              quality={90}
            />
          </div>
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="container mx-auto px-4 text-center text-white">
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                Vive Cada Paso,<br />Captura Cada Logro
              </h1>
              
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <input
                  type="text"
                  value={dorsal}
                  placeholder="Buscar por dorsal..."
                  className="w-full sm:w-64 px-4 py-2 rounded-lg border-2 border-white/20 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:border-[#C9384E]"
                  onChange={(e) => setDorsal(e.target.value.replace(/[^0-9]/g, ''))}
                  maxLength={5}
                />
                
                <button 
                  type="submit"
                  className="w-full sm:w-auto px-8 py-2 rounded-lg bg-[#C9384E] hover:bg-[#C9384E]/90 text-white font-semibold transition-colors"
                >
                  Buscar
                </button>
                
                <button 
                  type="button"
                  onClick={() => sendIframeMessage({
                    type: 'VIEW_ALL',
                    payload: { eventId }
                  })}
                  className="w-full sm:w-auto px-8 py-2 rounded-lg bg-[#C9384E] hover:bg-[#C9384E]/90 text-white font-semibold transition-colors"
                >
                  Ver todas las fotos
                </button>
              </form>
            </div>
          </div>
        </MagicCard>
      </section>
    </div>
  );
} 