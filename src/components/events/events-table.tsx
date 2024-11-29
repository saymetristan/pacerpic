"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EventActions } from "@/components/events/event-actions";
import { formatDate, formatCurrency } from "@/lib/utils";

const events = [
  {
    id: 1,
    name: "Maratón de Madrid 2024",
    date: "2024-04-15",
    totalImages: 1250,
    soldImages: 438,
    revenue: 6570,
    status: "active",
  },
  {
    id: 2,
    name: "Trail Sierra Norte",
    date: "2024-03-20",
    totalImages: 850,
    soldImages: 324,
    revenue: 4860,
    status: "active",
  },
  {
    id: 3,
    name: "San Silvestre Vallecana",
    date: "2023-12-31",
    totalImages: 2100,
    soldImages: 892,
    revenue: 13380,
    status: "completed",
  },
];

export function EventsTable() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Evento</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Total Imágenes</TableHead>
            <TableHead className="text-right">Imágenes Vendidas</TableHead>
            <TableHead className="text-right">Ingresos</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="font-medium">{event.name}</TableCell>
              <TableCell>{formatDate(event.date)}</TableCell>
              <TableCell className="text-right">{event.totalImages}</TableCell>
              <TableCell className="text-right">{event.soldImages}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(event.revenue)}
              </TableCell>
              <TableCell className="text-right">
                <EventActions event={event} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}