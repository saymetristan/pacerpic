"use client";

import { PhotographerUpload } from "@/components/upload/photographer-upload";

export default function PhotographerPage() {
  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A3068]">Panel de Fotógrafo</h1>
        <p className="text-muted-foreground">
          Sube y organiza las fotografías de los eventos
        </p>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <PhotographerUpload />
      </div>
    </div>
  );
}