"use client";

import { useState } from "react";
import { UploadHeader } from "@/components/upload/upload-header";
import { UploadZone } from "@/components/upload/upload-zone";

export default function UploadPage() {
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  return (
    <div className="space-y-8">
      <UploadHeader onEventChange={setSelectedEventId} />
      {selectedEventId && <UploadZone eventId={selectedEventId} />}
    </div>
  );
} 