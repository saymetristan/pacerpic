import imageCompression from 'browser-image-compression';
import { CompressionError } from '../types/errors';

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 15,
    maxWidthOrHeight: 4096,
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.7,
    alwaysKeepResolution: true,
    signal: undefined as AbortSignal | undefined
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    return new File([compressedBlob], file.name, {
      type: 'image/jpeg'
    });
  } catch (error) {
    console.error('Error comprimiendo imagen:', error);
    throw error;
  }
}

export async function compressImageWithProgress(
  file: File,
  onProgress?: (progress: number) => void
): Promise<File> {
  const controller = new AbortController();
  
  const options = {
    maxSizeMB: 15,
    maxWidthOrHeight: 4096,
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.7,
    alwaysKeepResolution: true,
    signal: controller.signal,
    onProgress: (progress: number) => {
      onProgress?.(progress);
    }
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    return new File([compressedBlob], file.name, { type: 'image/jpeg' });
  } catch (error: unknown) {
    const compressionError = error as CompressionError;
    if (compressionError.name === 'AbortError') {
      throw new Error('Compresión cancelada');
    }
    throw compressionError;
  }
} 