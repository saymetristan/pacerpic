'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface DownloadButtonProps {
  eventId: string;
}

const DownloadButton = ({ eventId }: DownloadButtonProps) => {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      let offset = 0;
      const chunks: Blob[] = [];
      
      while (true) {
        const response = await fetch(`/api/events/${eventId}/download?offset=${offset}`);
        const contentType = response.headers.get('Content-Type');
        
        if (contentType === 'application/json') {
          const data = await response.json();
          if (data.done) break;
        }

        const totalCount = parseInt(response.headers.get('X-Total-Count') || '0');
        const blob = await response.blob();
        chunks.push(blob);
        
        offset += 50;
        const currentProgress = Math.min((offset / totalCount) * 100, 100);
        setProgress(currentProgress);
        
        if (offset >= totalCount) break;
      }

      const finalBlob = new Blob(chunks, { type: 'application/zip' });
      const url = window.URL.createObjectURL(finalBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `event-${eventId}-photos.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error al descargar:', error);
    } finally {
      setDownloading(false);
      setProgress(0);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button onClick={handleDownload} disabled={downloading}>
        <Download className="h-4 w-4 mr-2" />
        {downloading ? 'Descargando...' : 'Descargar todas'}
      </Button>
      {downloading && (
        <Progress value={progress} className="w-[100px]" />
      )}
    </div>
  );
};

export default DownloadButton; 