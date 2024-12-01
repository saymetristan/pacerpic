"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, Image as ImageIcon, Upload, ChevronLeft, Home, LogOut, User, ChevronUp } from "lucide-react";
import { useUser } from '@auth0/nextjs-auth0/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "@/hooks/use-media-query";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "4rem";

const routes = [
  {
    label: "Panel Principal",
    icon: Home,
    href: "/admin",
  },
  {
    label: "Eventos",
    icon: Calendar,
    href: "/admin/events",
  },
  {
    label: "Galería",
    icon: ImageIcon,
    href: "/admin/gallery",
  },
  {
    label: "Subir Imágenes",
    icon: Upload,
    href: "/admin/upload",
  }
];

export function AdminSidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { user } = useUser();

  return (
    <div className={cn(
      "relative h-full bg-slate-900 text-white transition-all duration-200 flex flex-col",
      collapsed ? "w-[4.5rem]" : "w-64"
    )}>
      <div className="p-4 flex items-center justify-between">
        <Link 
          href="/admin" 
          className={cn(
            "flex items-center",
            collapsed ? "justify-center w-full" : "justify-start"
          )}
        >
          <Image 
            src={collapsed ? "/images/logo-white.png" : "/images/logo-light.png"}
            alt="PacerPic"
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
              ? "absolute -right-4 top-6 bg-[#1A3068] hover:bg-[#EC6533] rounded-full shadow-md" 
              : "hover:bg-[#EC6533]/10"
          )}
        >
          <ChevronLeft className={cn(
            "h-4 w-4 transition-transform", 
            collapsed && "rotate-180"
          )} />
        </Button>
      </div>

      <div className="space-y-2 px-3 mt-2">
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

      <div className="flex-1" />

      <div className="p-3 border-t border-white/10 mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full transition-colors duration-200",
                "text-white/70 hover:bg-[#EC6533]/10 hover:text-white",
                collapsed ? "px-2 justify-center" : "px-4 justify-between"
              )}
            >
              {!collapsed && (
                <span className="truncate">
                  {user?.name || user?.email}
                </span>
              )}
              <User className={cn("h-5 w-5", collapsed ? "" : "ml-2")} />
              {!collapsed && <ChevronUp className="h-4 w-4 ml-2" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align={collapsed ? "center" : "end"}
            className="w-56 bg-slate-900 text-white border-slate-800"
          >
            <DropdownMenuItem className="hover:bg-[#EC6533]/10 hover:text-white focus:bg-[#EC6533]/10 focus:text-white">
              <User className="mr-2 h-4 w-4" />
              <span>Mi Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="hover:bg-red-500/10 hover:text-red-500 focus:bg-red-500/10 focus:text-red-500"
              asChild
            >
              <a href="/api/auth/logout">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
} 