import { StatsHeader } from "@/components/stats/stats-header";
import { StatsOverview } from "@/components/stats/stats-overview";
import { EventStats } from "@/components/stats/event-stats";
import { TopEvents } from "@/components/stats/top-events";

export default function StatsPage() {
  return (
    <div className="p-8 space-y-8">
      <StatsHeader />
      <StatsOverview />
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
        <EventStats />
        <TopEvents />
      </div>
    </div>
  );
}