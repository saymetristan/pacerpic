"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const data = [
  { name: "Maratón Madrid", imagesUploaded: 1250, imagesSold: 438 },
  { name: "Trail Sierra", imagesUploaded: 850, imagesSold: 324 },
  { name: "San Silvestre", imagesUploaded: 2100, imagesSold: 892 },
  { name: "10K Valencia", imagesUploaded: 750, imagesSold: 283 },
  { name: "Trail Guadarrama", imagesUploaded: 650, imagesSold: 198 },
];

export function EventStats() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rendimiento por Evento</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis 
              dataKey="name" 
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip />
            <Bar 
              dataKey="imagesUploaded" 
              fill="hsl(var(--chart-1))" 
              radius={[4, 4, 0, 0]}
              name="Imágenes Subidas"
            />
            <Bar 
              dataKey="imagesSold" 
              fill="hsl(var(--chart-2))" 
              radius={[4, 4, 0, 0]}
              name="Imágenes Vendidas"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}