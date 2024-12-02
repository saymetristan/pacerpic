"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadProgressProps {
  files: {
    fileName: string;
    progress: number;
    status: 'pending' | 'processing' | 'processed' | 'error';
  }[];
}

export function UploadProgress({ files }: UploadProgressProps) {
  const totalFiles = files.length;
  const completed = files.filter(f => f.status === 'processed').length;
  const processing = files.filter(f => f.status === 'processing').length;
  const failed = files.filter(f => f.status === 'error').length;

  return (
    <Card className="h-full">
      <CardHeader className="border-b py-4">
        <CardTitle className="text-lg font-medium">
          Progreso de Subida
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex flex-col h-[calc(100%-4rem)]">
        <div className="flex-1 overflow-auto px-4 py-2">
          <div className="space-y-3">
            {files.map((file, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 truncate max-w-[80%]">
                    <StatusIcon status={file.status} />
                    <span className="truncate">{file.fileName}</span>
                  </div>
                  <Badge variant={getVariantByStatus(file.status)}>
                    {file.progress}%
                  </Badge>
                </div>
                <Progress value={file.progress} className="h-1" />
              </div>
            ))}
          </div>
        </div>
        <div className="border-t p-4 mt-auto">
          <div className="grid grid-cols-2 gap-2">
            <StatCard label="Total" value={totalFiles} className="bg-secondary/50" />
            <StatCard label="Completadas" value={completed} className="bg-green-500/10 text-green-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'processed':
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case 'processing':
      return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
    case 'error':
      return <XCircle className="h-4 w-4 text-red-600" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

function StatCard({ label, value, className }: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg",
      className
    )}>
      <div>
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function getVariantByStatus(status: string) {
  switch (status) {
    case 'processed':
      return 'success';
    case 'processing':
      return 'secondary';
    case 'error':
      return 'destructive';
    default:
      return 'outline';
  }
}