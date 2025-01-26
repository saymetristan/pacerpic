"use client";

import { HeroSection } from "@/components/sections/HeroSection";
import { MainNav } from "@/components/navigation/MainNav";
import { ArrowRight, Camera, Medal, Users, Twitter, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { MagicCard } from "@/components/ui/magic-card";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { motion } from "framer-motion";
import { ScrollBasedVelocity } from "@/components/ui/scroll-based-velocity";

export default function Home() {
  return (
    <main className="min-h-screen">
      <MainNav />
      <section className="relative h-screen">
        <MagicCard 
          className="w-full h-full relative overflow-hidden"
          gradientColor="#EC6533"
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
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
            />
          </div>
          <div className="relative z-10 h-full flex items-center justify-center">
            <HeroSection />
          </div>
        </MagicCard>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-[#1A3068] mb-16">
            Herramientas para Organizadores
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Organizers Card */}
            <MagicCard 
              className="p-6 hover:shadow-lg transition-shadow"
              gradientColor="#EC6533"
              gradientSize={150}
            >
              <div className="mb-4">
                <Users className="h-12 w-12 text-[#EC6533]" />
              </div>
              <h3 className="text-2xl font-semibold text-[#1A3068] mb-4">
              Potencia tu Evento con Pacerpic
              </h3>
              <p className="text-gray-600 mb-4">
              Transforma la manera en que gestionas y presentas tus eventos deportivos. Pacerpic ofrece soluciones intuitivas para que tanto organizadores como participantes disfruten de una experiencia inigualable.
              </p>
            </MagicCard>

            {/* Image Upload Card */}
            <MagicCard 
              className="p-6 hover:shadow-lg transition-shadow"
              gradientColor="#EC6533"
              gradientSize={150}
            >
              <div className="mb-4">
                <Camera className="h-12 w-12 text-[#EC6533]" />
              </div>
              <h3 className="text-2xl font-semibold text-[#1A3068] mb-4">
                Subida de Imágenes Automatizada
              </h3>
              <p className="text-gray-600 mb-4">
                Carga y etiqueta automáticamente las fotos de tu evento utilizando los dorsales de los participantes. Ahorra tiempo y reduce el esfuerzo manual con nuestra tecnología avanzada.
              </p>
            </MagicCard>

            {/* Photo Management Card */}
            <MagicCard 
              className="p-6 hover:shadow-lg transition-shadow"
              gradientColor="#EC6533"
              gradientSize={150}
            >
              <div className="mb-4">
                <Medal className="h-12 w-12 text-[#EC6533]" />
              </div>
              <h3 className="text-2xl font-semibold text-[#1A3068] mb-4">
                Visualización y Descarga Eficiente
              </h3>
              <p className="text-gray-600 mb-4">
                Accede y comparte rápidamente todas las fotos etiquetadas, permitiendo que los corredores descarguen sus momentos favoritos sin demoras.
              </p>
            </MagicCard>
          </div>
        </div>
      </section>

      {/*
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-[#1A3068] mb-16">
            Lo que dicen nuestros usuarios
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-6">
              <p className="text-gray-600 mb-4">
                &ldquo;La plataforma facilitó la gestión de mi evento y la descarga rápida de las fotos fue excelente.&rdquo;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
                    alt="Ana García"
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div>
                  <AnimatedGradientText className="font-semibold">
                    Ana García
                  </AnimatedGradientText>
                  <p className="text-sm text-gray-500">Organizadora de Eventos</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <p className="text-gray-600 mb-4">
                &ldquo;La automatización en la subida y etiquetado de imágenes ahorró mucho tiempo y esfuerzo.&rdquo;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
                    alt="Carlos Ruiz"
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div>
                  <AnimatedGradientText className="font-semibold">
                    Carlos Ruiz
                  </AnimatedGradientText>
                  <p className="text-sm text-gray-500">Fotógrafo Deportivo</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>*/}

      {/* CTA Section */}
      <section className="relative bg-white py-20">
        <div className="container relative mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <ScrollBasedVelocity
              text="Eleva la Experiencia de tus Corredores"
              className="text-5xl md:text-7xl font-bold mb-6 text-[#1A3068]"
              default_velocity={3}
            />
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-xl mb-8 text-[#4A4A4A]"
            >
              Simplifica la administración de tus eventos deportivos y enriquece la experiencia de tus participantes con nuestra plataforma intuitiva. Pacerpic no solo mejora la gestión, sino que también añade valor a cada carrera, creando recuerdos duraderos para todos.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="relative bg-[#1A3068]">
        <MagicCard 
          className="w-full py-16 bg-transparent"
          gradientColor="#EC6533"
          gradientOpacity={0.15}
          gradientSize={300}
        >
          <div className="container mx-auto px-4">
            <div className="border-t border-white/10 pt-8">
              <p className="text-white/50 text-sm text-center">
                Hecho con 💙 y mucho ☕ desde 🇲🇽 | Pacerpic © {new Date().getFullYear()}. | Todos los derechos reservados.
              </p>
            </div>
          </div>
        </MagicCard>
      </footer>
    </main>
  );
}