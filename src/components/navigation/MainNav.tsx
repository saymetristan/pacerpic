"use client";

import { AuthButtons } from "@/components/auth/AuthButtons";

export function MainNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-white">
          PacerPic
        </div>
        <AuthButtons />
      </div>
    </nav>
  );
}