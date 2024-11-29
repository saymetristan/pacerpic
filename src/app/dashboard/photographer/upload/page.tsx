import { UploadHeader } from "@/components/upload/upload-header";
import { UploadZone } from "@/components/upload/upload-zone";
import { UploadProgress } from "@/components/upload/upload-progress";

export default function UploadPage() {
  return (
    <div className="p-8 space-y-8">
      <UploadHeader />
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
        <UploadZone />
        <UploadProgress />
      </div>
    </div>
  );
}