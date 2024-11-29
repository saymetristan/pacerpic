"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Camera, BarChart3, Upload, Settings, Home, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const routes = [
  {
    label: "Panel Principal",
    icon: Home,
    href: "/dashboard/photographer",
  },
  {
    label: "Mis Eventos",
    icon: Camera,
    href: "/dashboard/photographer/events",
  },
  {
    label: "Galería",
    icon: ImageIcon,
    href: "/dashboard/photographer/gallery",
  },
  {
    label: "Subir Imágenes",
    icon: Upload,
    href: "/dashboard/photographer/upload",
  },
  {
    label: "Estadísticas",
    icon: BarChart3,
    href: "/dashboard/photographer/stats",
  },
  {
    label: "Configuración",
    icon: Settings,
    href: "/dashboard/photographer/settings",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard/photographer" className="flex items-center pl-3 mb-14">
          <Image 
            src="/images/logo-light.png"
            alt="PacerPic"
            width={120}
            height={32}
            className="object-contain"
            priority
          />
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Button
              key={route.href}
              variant={pathname === route.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                pathname === route.href ? "bg-white/10" : "hover:bg-white/10"
              )}
              asChild
            >
              <Link href={route.href}>
                <route.icon className="h-5 w-5 mr-3" />
                {route.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}