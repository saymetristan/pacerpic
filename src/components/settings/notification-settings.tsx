"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function NotificationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferencias de Notificaciones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Notificaciones por Email</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="sales">Ventas de imágenes</Label>
              <Switch id="sales" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="new-events">Nuevos eventos disponibles</Label>
              <Switch id="new-events" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="marketing">Noticias y actualizaciones</Label>
              <Switch id="marketing" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Notificaciones Push</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="push-sales">Ventas de imágenes</Label>
              <Switch id="push-sales" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-events">Recordatorios de eventos</Label>
              <Switch id="push-events" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-messages">Mensajes de organizadores</Label>
              <Switch id="push-messages" defaultChecked />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}