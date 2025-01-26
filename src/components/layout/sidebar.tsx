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
    <div 
      className={cn(
        "relative h-full bg-slate-900 text-white transition-all duration-200",
        collapsed ? "w-[4.5rem]" : "w-64"
      )}
    >
      <div className="p-4 flex items-center justify-between">
        <Link 
          href="/dashboard/photographer" 
          className={cn(
            "flex items-center",
            collapsed ? "justify-center w-full" : "justify-start"
          )}
        >
          <Image 
            src={collapsed ? "/images/logo-white.png" : "/images/logo-light.png"}
            alt="Pacerpic"
            width={collapsed ? 28 : 120}
            height={collapsed ? 28 : 32}
            className="object-contain"
            priority
          />
        </Link>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggle}
          className={cn(
            "hidden lg:flex text-white transition-all duration-200",
            collapsed 
              ? "absolute -right-4 top-6 bg-[#1A3068] hover:bg-[#EC6533] rounded-full shadow-md z-50" 
              : "hover:bg-[#EC6533]/10"
          )}
        >
          <ChevronLeft className={cn(
            "h-4 w-4 transition-transform", 
            collapsed && "rotate-180"
          )} />
        </Button>
      </div>

      <div className="space-y-2 px-3">
        {routes.map((route) => (
          <Button
            key={route.href}
            variant={pathname === route.href ? "secondary" : "ghost"}
            className={cn(
              "w-full transition-colors duration-200",
              pathname === route.href 
                ? "bg-[#EC6533] text-white hover:bg-[#d55a2e]" 
                : "text-white/70 hover:bg-[#EC6533]/10 hover:text-white",
              collapsed ? "px-2 justify-center" : "px-4 justify-start"
            )}
            asChild
          >
            <Link href={route.href}>
              <route.icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
              {!collapsed && <span>{route.label}</span>}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}