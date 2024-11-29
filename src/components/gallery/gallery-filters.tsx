"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const events = [
  "Maratón de Madrid 2024",
  "Trail Sierra Norte",
  "San Silvestre Vallecana",
  "10K Valencia",
  "Trail Guadarrama",
];

const tags = [
  "Llegada",
  "Salida",
  "Avituallamiento",
  "Paisaje",
  "Grupo",
  "Individual",
  "Podio",
];

export function GalleryFilters() {
  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>Estado</Label>
          <RadioGroup defaultValue="all">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all">Todas</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="published" id="published" />
              <Label htmlFor="published">Publicadas</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="draft" id="draft" />
              <Label htmlFor="draft">Borrador</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sold" id="sold" />
              <Label htmlFor="sold">Vendidas</Label>
            </div>
          </RadioGroup>
        </div>

        <Separator />

        <div className="space-y-4">
          <Label>Eventos</Label>
          <ScrollArea className="h-[120px]">
            <div className="space-y-2">
              {events.map((event) => (
                <div key={event} className="flex items-center space-x-2">
                  <input type="checkbox" id={event} className="rounded" />
                  <Label htmlFor={event}>{event}</Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        <div className="space-y-4">
          <Label>Etiquetas</Label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}