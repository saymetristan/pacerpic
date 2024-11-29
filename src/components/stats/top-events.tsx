"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const topEvents = [
  {
    name: "Maratón de Madrid 2024",
    revenue: 6570,
    conversion: 35.04,
  },
  {
    name: "San Silvestre Vallecana",
    revenue: 13380,
    conversion: 42.48,
  },
  {
    name: "Trail Sierra Norte",
    revenue: 4860,
    conversion: 38.12,
  },
  {
    name: "10K Valencia",
    revenue: 4245,
    conversion: 37.73,
  },
  {
    name: "Trail Guadarrama",
    revenue: 2970,
    conversion: 30.46,
  },
].sort((a, b) => b.revenue - a.revenue);

export function TopEvents() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Eventos más Rentables</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {topEvents.map((event) => (
            <div key={event.name} className="flex items-center">
              <div className="space-y-1 flex-1">
                <p className="text-sm font-medium leading-none">{event.name}</p>
                <p className="text-sm text-muted-foreground">
                  {event.conversion}% de conversión
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{formatCurrency(event.revenue)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}