'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface DownloadButtonProps {
  eventId: string;
  tag?: string;
}

export default function DownloadButton({ eventId, tag }: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const downloadImages = async () => {
    setDownloading(true);
    let offset = 0;
    const chunks: Blob[] = [];

    try {
      while (true) {
        const response = await fetch(`/api/events/${eventId}/download?offset=${offset}&tag=${tag}`);
        
        if (!response.ok) throw new Error('Error en la descarga');
        
        const contentType = response.headers.get('Content-Type');
        if (contentType === 'application/json') {
          const data = await response.json();
          if (data.done) break;
        }

        const blob = await response.blob();
        chunks.push(blob);
        
        const totalCount = parseInt(response.headers.get('X-Total-Count') || '0');
        offset += 20; // CHUNK_SIZE
        setProgress(Math.min((offset / totalCount) * 100, 100));
      }

      // Combinar todos los chunks y descargar
      const finalBlob = new Blob(chunks, { type: 'application/zip' });
      const url = URL.createObjectURL(finalBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fotos-${tag}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setDownloading(false);
      setProgress(0);
    }
  };

  return (
    <Button 
      onClick={downloadImages} 
      disabled={downloading}
      variant="outline"
      size="sm"
    >
      {downloading ? (
        <div className="flex items-center gap-2">
          <Progress value={progress} className="w-16" />
          {Math.round(progress)}%
        </div>
      ) : (
        <Download className="h-4 w-4" />
      )}
    </Button>
  );
} 