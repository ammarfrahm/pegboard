import type { CompressionPreset } from '../types';

export const compressionPresets: CompressionPreset[] = [
  {
    name: 'Web Optimized',
    description: 'Balanced quality for web use (80% quality, max 1920px)',
    options: {
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1920,
      outputFormat: 'image/webp',
    },
  },
  {
    name: 'Email',
    description: 'Smaller files for email attachments (60% quality, max 1200px)',
    options: {
      quality: 0.6,
      maxWidth: 1200,
      maxHeight: 1200,
      outputFormat: 'image/jpeg',
    },
  },
  {
    name: 'Maximum Compression',
    description: 'Smallest file size (40% quality, max 800px)',
    options: {
      quality: 0.4,
      maxWidth: 800,
      maxHeight: 800,
      outputFormat: 'image/webp',
    },
  },
  {
    name: 'High Quality',
    description: 'Minimal compression for quality preservation (90% quality)',
    options: {
      quality: 0.9,
      maxWidth: undefined,
      maxHeight: undefined,
      outputFormat: 'image/webp',
    },
  },
];

export const defaultOptions = {
  quality: 0.8,
  maxWidth: undefined,
  maxHeight: undefined,
  outputFormat: 'image/webp' as const,
  preserveExif: false,
};
