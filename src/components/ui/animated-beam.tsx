"use client";

import { useEffect, useRef } from "react";

export interface AnimatedBeamProps {
  className?: string;
}

export const AnimatedBeam: React.FC<AnimatedBeamProps> = ({
  className,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const resizeObserver = new ResizeObserver(() => {
      // Lógica para manejar el redimensionamiento
      if (container) {
        // Implementar lógica de resize aquí
      }
    });

    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      if (container) {
        resizeObserver.unobserve(container);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={`absolute inset-0 ${className}`}>
      {/* Contenido del beam */}
    </div>
  );
};
