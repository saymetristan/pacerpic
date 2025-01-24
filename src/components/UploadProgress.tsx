import { UploadProgress as UploadProgressType } from '@/types/upload';

interface Props {
  files: Array<{
    fileName: string;
    progress: number;
    status: 'pending' | 'processing' | 'processed' | 'error' | 'queued';
  }>;
}

export function UploadProgress({ files }: Props) {
  return (
    <div className="space-y-4 bg-muted p-4 rounded-lg">
      {files.map((file) => (
        <div key={file.fileName} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{file.fileName}</span>
            <span>
              {file.status === 'queued' ? 'En cola' :
               file.status === 'processing' ? 'Procesando' :
               file.status === 'processed' ? 'Completado' :
               file.status === 'error' ? 'Error' :
               `${file.progress}%`}
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                file.status === 'error' ? 'bg-destructive' :
                file.status === 'processed' ? 'bg-primary' :
                'bg-primary/60'
              }`}
              style={{ width: `${file.progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
} 