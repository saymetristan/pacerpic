import { EventsTable } from "@/components/events/events-table";
import { EventsHeader } from "@/components/events/events-header";

export default function EventsPage() {
  return (
    <div className="p-8 space-y-8">
      <EventsHeader />
      <EventsTable />
    </div>
  );
}