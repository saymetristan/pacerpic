import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Users, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import { getSession } from "@auth0/nextjs-auth0";

async function getDashboardStats() {
  const session = await getSession();
  const user = session?.user;

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('organizer_id', user?.sub)
    .order('created_at', { ascending: false })
    .limit(3);

  const { count: totalEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('organizer_id', user?.sub);

  const { count: totalPhotographers } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('organizer_id', user?.sub)
    .eq('role', 'photographer');

  const { count: totalImages } = await supabase
    .from('images')
    .select('*', { count: 'exact', head: true })
    .eq('photographer_id', user?.sub);

  // Eventos este mes
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  const { count: eventsThisMonth } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfMonth.toISOString());

  // Imágenes este mes
  const { count: imagesThisMonth } = await supabase
    .from('images')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfMonth.toISOString());

  return {
    events,
    totalEvents,
    totalPhotographers,
    totalImages,
    eventsThisMonth,
    imagesThisMonth
  };
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

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
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.eventsThisMonth} este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fotógrafos</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPhotographers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Imágenes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalImages}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.imagesThisMonth} este mes
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
              {stats.events?.map((event) => (
                <div key={event.id} className="flex items-center">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none">{event.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.location}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(event.date)}
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