import streamSaver from 'streamsaver';
import { Button } from '@/components/ui/button';

interface DownloadButtonProps {
  eventId: string;
}

const DownloadButton = ({ eventId }: DownloadButtonProps) => {
  const handleDownload = async () => {
    const response = await fetch(`/api/events/${eventId}/download`);
    const fileStream = streamSaver.createWriteStream(`event-${eventId}-photos.zip`);
    const readableStream = response.body;
    
    if (readableStream) {
      await readableStream.pipeTo(fileStream);
    }
  };

  return (
    <Button onClick={handleDownload}>
      Descargar todas
    </Button>
  );
};

export default DownloadButton; 