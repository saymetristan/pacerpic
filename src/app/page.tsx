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
                Gestión de Eventos
              </h3>
              <p className="text-gray-600 mb-4">
                Crea y administra tus eventos deportivos de manera eficiente.
              </p>
              <Button variant="link" className="text-[#EC6533] p-0">
                Administrar eventos <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
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
                Subida de Imágenes
              </h3>
              <p className="text-gray-600 mb-4">
                Carga y etiqueta automáticamente las fotos de tus eventos con los dorsales de los participantes.
              </p>
              <Button variant="link" className="text-[#EC6533] p-0">
                Subir imágenes <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
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
                Visualización y Descarga
              </h3>
              <p className="text-gray-600 mb-4">
                Accede rápidamente a las fotos etiquetadas y permite a los participantes descargarlas sin complicaciones.
              </p>
              <Button variant="link" className="text-[#EC6533] p-0">
                Ver y Descargar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </MagicCard>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
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
      </section>

      {/* CTA Section */}
      <section className="relative bg-white py-20">
        <div className="container relative mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <ScrollBasedVelocity
              text="Optimiza la gestión de tus eventos"
              className="text-5xl md:text-7xl font-bold mb-6 text-[#1A3068]"
              default_velocity={2}
            />
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-xl mb-8 text-[#4A4A4A]"
            >
              Simplifica la administración de tus eventos deportivos con nuestra plataforma intuitiva.
            </motion.p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                className="text-base font-semibold px-6 py-3 w-full sm:w-auto bg-[#EC6533] hover:bg-[#EC6533]/90 text-white"
              >
                Empezar ahora <ArrowRight className="ml-2 h-4 w-4 inline-block" />
              </Button>
              
              <Button 
                variant="outline" 
                className="text-[#1A3068] hover:text-[#1A3068]/90 border-[#1A3068] hover:bg-[#1A3068]/10 w-full sm:w-auto"
              >
                Contactar Ventas
              </Button>
            </div>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
              <div>
                <h3 className="text-white font-semibold mb-6">Navegación</h3>
                <nav className="flex flex-col space-y-3">
                  <Button variant="link" className="text-white/70 hover:text-white justify-start p-0 h-auto font-normal">
                    Inicio
                  </Button>
                  <Button variant="link" className="text-white/70 hover:text-white justify-start p-0 h-auto font-normal">
                    Subir imágenes
                  </Button>
                  <Button variant="link" className="text-white/70 hover:text-white justify-start p-0 h-auto font-normal">
                    Panel de Organizadores
                  </Button>
                </nav>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-6">Legal</h3>
                <nav className="flex flex-col space-y-3">
                  <Button variant="link" className="text-white/70 hover:text-white justify-start p-0 h-auto font-normal">
                    Términos y condiciones
                  </Button>
                  <Button variant="link" className="text-white/70 hover:text-white justify-start p-0 h-auto font-normal">
                    Política de privacidad
                  </Button>
                </nav>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-6">Contacto</h3>
                <p className="text-white/70 mb-4">contacto@pacerpic.com</p>
                <div className="flex gap-4">
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-white/70 hover:text-white">
                    <Twitter className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-white/70 hover:text-white">
                    <Instagram className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8">
              <p className="text-white/50 text-sm text-center">
                © {new Date().getFullYear()} PacerPic. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </MagicCard>
      </footer>
    </main>
  );
}