"use client";

import { HeroSection } from "@/components/sections/HeroSection";
import { MainNav } from "@/components/navigation/MainNav";
import { ArrowRight, Camera, Medal, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { MagicCard } from "@/components/ui/magic-card";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";

export default function Home() {
  return (
    <main className="min-h-screen">
      <MainNav />
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <MagicCard 
          className="w-full h-full"
          gradientColor="#EC6533"
          gradientOpacity={0.3}
        >
          <HeroSection />
        </MagicCard>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-[#1A3068] mb-16">
            Una plataforma para todos
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Runners Card */}
            <MagicCard 
              className="p-6 hover:shadow-lg transition-shadow"
              gradientColor="#EC6533"
              gradientSize={150}
            >
              <div className="mb-4">
                <Medal className="h-12 w-12 text-[#EC6533]" />
              </div>
              <h3 className="text-2xl font-semibold text-[#1A3068] mb-4">
                Corredores
              </h3>
              <p className="text-gray-600 mb-4">
                Encuentra tus fotos al instante usando tu número de dorsal. Sin necesidad de registro.
              </p>
              <Button variant="link" className="text-[#EC6533] p-0">
                Buscar fotos <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </MagicCard>

            {/* Photographers Card */}
            <MagicCard 
              className="p-6 hover:shadow-lg transition-shadow"
              gradientColor="#EC6533"
              gradientSize={150}
            >
              <div className="mb-4">
                <Camera className="h-12 w-12 text-[#EC6533]" />
              </div>
              <h3 className="text-2xl font-semibold text-[#1A3068] mb-4">
                Fotógrafos
              </h3>
              <p className="text-gray-600 mb-4">
                Sube y vende tus fotos con nuestro proceso automatizado de etiquetado y procesamiento.
              </p>
              <Button variant="link" className="text-[#EC6533] p-0">
                Comenzar ahora <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </MagicCard>

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
                Organizadores
              </h3>
              <p className="text-gray-600 mb-4">
                Gestiona tus eventos y obtén análisis detallados del rendimiento fotográfico.
              </p>
              <Button variant="link" className="text-[#EC6533] p-0">
                Descubre más <ArrowRight className="ml-2 h-4 w-4" />
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
                "Encontré mis fotos del maratón en minutos. ¡El proceso de compra fue súper sencillo!"
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
                  <p className="text-sm text-gray-500">Corredora</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <p className="text-gray-600 mb-4">
                "Como fotógrafo, el sistema automatizado me ahorra horas de trabajo manual."
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
                  <p className="text-sm text-gray-500">Fotógrafo deportivo</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#1A3068] text-white">
        <div className="container mx-auto px-4 text-center">
          <AnimatedGradientText className="text-5xl md:text-7xl font-bold mb-6">
            Captura tu momento de gloria
          </AnimatedGradientText>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            No pierdas más tiempo buscando. Encuentra tus fotos al instante.
          </p>
          <ShimmerButton
            className="text-lg font-semibold"
            shimmerColor="#EC6533"
            background="#1A3068"
          >
            Comenzar ahora <ArrowRight className="ml-2 h-4 w-4" />
          </ShimmerButton>
        </div>
      </section>
    </main>
  );
}