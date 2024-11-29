import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Users, Calendar } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-bold tracking-tight">Panel de Administración</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +3 este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fotógrafos</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              +12 este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Imágenes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45,231</div>
            <p className="text-xs text-muted-foreground">
              +2,345 este mes
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Eventos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {events.map((event) => (
                <div key={event.name} className="flex items-center">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none">{event.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.photographers} fotógrafos asignados
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {event.date}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const events = [
  {
    name: "Maratón de Madrid 2024",
    photographers: 12,
    date: "15 Abr 2024"
  },
  {
    name: "Trail Sierra Norte",
    photographers: 8,
    date: "20 Mar 2024"
  },
  {
    name: "10K Valencia",
    photographers: 6,
    date: "15 Feb 2024"
  }
];