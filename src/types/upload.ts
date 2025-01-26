export type UploadStatus = 'compressing' | 'uploading' | 'completed' | 'error';

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: UploadStatus;
  error?: string;
  retries?: number;
}