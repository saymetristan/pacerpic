"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";

interface GalleryFiltersProps {
  onFilterChange: (filters: {
    status: string;
    events: string[];
    tags: string[];
  }) => void;
}

export function GalleryFilters({ onFilterChange }: GalleryFiltersProps) {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [events, setEvents] = useState<{id: string, name: string}[]>([]);

  const tags = [
    "Entrega de Kits Viernes",
    "Entrega de Kis Sabado",
    "Salida Meta",
    "Convivencia Centro de Convenciones",
    "Entrada Lago",
    "Salida Lago",
    "Patrocinadores",
    "Rampa Centro de Convenciones",
    "Photo Opportunity 10k",
    "Entrada Laberinto",
    "Laberinto Juan Escumbia",
    "Laberinto Nido",
    "Generales",
    "Photo Opportunity 3k, 5k y 10k",
    "Rifa Ganadores"
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from('events')
        .select('id, name')
        .order('date', { ascending: false });
      
      if (data) setEvents(data);
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    onFilterChange({
      status: selectedStatus,
      events: selectedEvents,
      tags: selectedTags
    });
  }, [selectedStatus, selectedEvents, selectedTags, onFilterChange]);

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>Estado</Label>
          <RadioGroup 
            value={selectedStatus} 
            onValueChange={setSelectedStatus}
          >
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
                <div key={event.id} className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id={event.id}
                    checked={selectedEvents.includes(event.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEvents([...selectedEvents, event.id]);
                      } else {
                        setSelectedEvents(selectedEvents.filter(id => id !== event.id));
                      }
                    }}
                    className="rounded" 
                  />
                  <Label htmlFor={event.id}>{event.name}</Label>
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
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => {
                  if (selectedTags.includes(tag)) {
                    setSelectedTags(selectedTags.filter(t => t !== tag));
                  } else {
                    setSelectedTags([...selectedTags, tag]);
                  }
                }}
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