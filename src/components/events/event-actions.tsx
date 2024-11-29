"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Upload, BarChart2, Trash } from "lucide-react";
import { EventDialog } from "@/components/events/event-dialog";
import { DeleteEventDialog } from "@/components/events/delete-event-dialog";
import { useToast } from "@/hooks/use-toast";

interface EventActionsProps {
  event: {
    id: number;
    name: string;
    date: string;
    location: string;
    organizerContact: string;
    status: string;
  };
}

export function EventActions({ event }: EventActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  const handleDelete = () => {
    // Here you would typically make an API call to delete the event
    console.log(`Deleting event: ${event.id}`);
    
    toast({
      title: "Evento eliminado",
      description: `El evento "${event.name}" ha sido eliminado correctamente.`,
    });
    
    setShowDeleteDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            Subir Imágenes
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <BarChart2 className="mr-2 h-4 w-4" />
            Ver Estadísticas
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <EventDialog event={event} />
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-red-600"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash className="mr-2 h-4 w-4" />
            Eliminar Evento
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteEventDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        eventName={event.name}
      />
    </>
  );
}