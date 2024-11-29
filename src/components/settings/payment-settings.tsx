"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Plus } from "lucide-react";

export function PaymentSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información de Pago</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Método de Pago Actual</h3>
            <div className="flex items-center space-x-4 rounded-lg border p-4">
              <CreditCard className="h-6 w-6" />
              <div className="flex-1">
                <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">
                  Expira: 12/2024
                </p>
              </div>
              <Button variant="outline" size="sm">
                Editar
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Añadir Nuevo Método</h3>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Añadir
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Datos de Facturación</h3>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="tax-id">NIF/CIF</Label>
                <Input id="tax-id" placeholder="B12345678" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="business-name">Nombre Fiscal</Label>
                <Input id="business-name" placeholder="Tu Empresa S.L." />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Dirección</Label>
                <Input id="address" placeholder="Calle Ejemplo 123" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Pagos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Marzo 2024</p>
                <p className="text-sm text-muted-foreground">32 ventas</p>
              </div>
              <p className="text-sm font-medium">€480.00</p>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Febrero 2024</p>
                <p className="text-sm text-muted-foreground">28 ventas</p>
              </div>
              <p className="text-sm font-medium">€420.00</p>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Enero 2024</p>
                <p className="text-sm text-muted-foreground">45 ventas</p>
              </div>
              <p className="text-sm font-medium">€675.00</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}