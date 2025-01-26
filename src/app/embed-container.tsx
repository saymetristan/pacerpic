import { useEffect } from 'react';
import { IframeMessage } from '@/lib/iframe-messages';

const EmbedContainer: React.FC = () => {
  useEffect(() => {
    const handleIframeMessage = (event: MessageEvent<IframeMessage>) => {
      if (!event.data.type || !event.data.payload) return;

      switch (event.data.type) {
        case 'SEARCH':
          const { dorsal, eventId } = event.data.payload;
          if (dorsal && eventId) {
            window.location.href = `/search?eventId=${eventId}&dorsal=${dorsal}`;
          }
          break;
        
        case 'VIEW_ALL':
          const { eventId: eid } = event.data.payload;
          if (eid) {
            window.location.href = `/event/${eid}`;
          }
          break;
      }
    };

    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, []);

  return (
    <div>
      {/* Rest of the component content */}
    </div>
  );
};

export default EmbedContainer; 