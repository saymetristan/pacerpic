"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { AuthButtons } from "@/components/auth/AuthButtons";

export function MainNav() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? "bg-white shadow-md" : "bg-transparent"
    }`}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="h-8 w-auto relative">
          <Image
            src={isScrolled ? "/images/logo-dark.png" : "/images/logo-light.png"}
            alt="PacerPic"
            width={120}
            height={32}
            className="object-contain"
            priority
          />
        </div>
        <AuthButtons isScrolled={isScrolled} />
      </div>
    </nav>
  );
}