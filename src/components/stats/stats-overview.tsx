"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, ImageDown, DollarSign, TrendingUp } from "lucide-react";

const stats = [
  {
    title: "Tasa de Conversión",
    value: "32.5%",
    description: "+2.5% respecto al periodo anterior",
    icon: TrendingUp,
  },
  {
    title: "Total Imágenes",
    value: "4,203",
    description: "+15% respecto al periodo anterior",
    icon: Camera,
  },
  {
    title: "Imágenes Vendidas",
    value: "1,367",
    description: "+20% respecto al periodo anterior",
    icon: ImageDown,
  },
  {
    title: "Ingresos Totales",
    value: "€20,515",
    description: "+25% respecto al periodo anterior",
    icon: DollarSign,
  },
];

export function StatsOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}