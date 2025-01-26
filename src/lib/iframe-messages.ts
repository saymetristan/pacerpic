export type IframeMessage = {
  type: 'SEARCH' | 'VIEW_ALL';
  payload: {
    eventId: string;
    dorsal?: string;
  };
};

export const sendIframeMessage = (message: IframeMessage) => {
  window.parent.postMessage(message, '*');
}; 