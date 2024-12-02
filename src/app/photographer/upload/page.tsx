"use client";

import { useState } from "react";
import { UploadHeader } from "@/components/upload/upload-header";
import { UploadZone } from "@/components/upload/upload-zone";
import { UploadProgress } from "@/components/upload/upload-progress";

export default function UploadPage() {
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  return (
    <div className="flex-1 flex-col md:flex">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <UploadHeader onEventChange={setSelectedEventId} />
        
        {selectedEventId && (
          <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
            <UploadZone eventId={selectedEventId} />
            <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-10rem)] overflow-auto">
              <UploadProgress files={[]} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}