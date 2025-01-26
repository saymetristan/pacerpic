export interface UploadError extends Error {
  code?: string;
  message: string;
}

export interface CompressionError extends Error {
  code?: string;
  message: string;
} 