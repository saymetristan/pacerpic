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

  const handleDownload = async () => {
    setDownloading(true);
    setProgress(0);
    
    try {
      const response = await fetch(`/api/events/${eventId}/download${tag ? `?tag=${tag}` : ''}`);
      let offset = 0;
      const chunks: Blob[] = [];
      
      while (true) {
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
      console.error('Error:', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleDownload}
      disabled={downloading}
    >
      {downloading ? (
        <Progress value={progress} className="w-full" />
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Descargar
        </>
      )}
    </Button>
  );
} 