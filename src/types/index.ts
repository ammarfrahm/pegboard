export interface CompressionOptions {
  quality: number; // 0-1
  maxWidth?: number;
  maxHeight?: number;
  outputFormat: 'image/jpeg' | 'image/png' | 'image/webp';
  preserveExif: boolean;
}

export interface ImageFile {
  id: string;
  file: File;
  originalUrl: string;
  compressedUrl?: string;
  compressedBlob?: Blob;
  status: 'pending' | 'compressing' | 'completed' | 'error';
  progress: number;
  originalSize: number;
  compressedSize?: number;
  compressionTime?: number;
  error?: string;
}

export interface CompressionPreset {
  name: string;
  description: string;
  options: Partial<CompressionOptions>;
}

export type Theme = 'light' | 'dark' | 'system';
