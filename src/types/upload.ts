export type UploadStatus = 'pending' | 'processing' | 'processed' | 'error' | 'queued';

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: UploadStatus;
}