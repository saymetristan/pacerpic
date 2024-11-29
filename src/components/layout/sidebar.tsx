"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Camera, BarChart3, Upload, Settings, Home, Image as ImageIcon, ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

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

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="relative h-full bg-slate-900 text-white">
      <div className="p-4 flex items-center justify-between">
        <Link href="/dashboard/photographer" className={cn("flex items-center", collapsed && "justify-center")}>
          <Image 
            src="/images/logo-light.png"
            alt="PacerPic"
            width={collapsed ? 32 : 120}
            height={32}
            className="object-contain"
            priority
          />
        </Link>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggle}
          className="hidden lg:flex text-white hover:bg-white/10"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      <div className="space-y-2 px-3">
        {routes.map((route) => (
          <Button
            key={route.href}
            variant={pathname === route.href ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              pathname === route.href ? "bg-white/10" : "hover:bg-white/10",
              collapsed && "justify-center px-2"
            )}
            asChild
          >
            <Link href={route.href}>
              <route.icon className="h-5 w-5" />
              {!collapsed && <span className="ml-3">{route.label}</span>}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}