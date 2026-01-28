import type { CompressionPreset } from '../types';

export const compressionPresets: CompressionPreset[] = [
  {
    name: 'Web Optimized',
    description: '80% quality, max 1920px — Full HD display width, ideal for most websites',
    options: {
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1920,
      outputFormat: 'image/webp',
    },
  },
  {
    name: 'Email',
    description: '60% quality, max 1200px — Fits email clients with retina support',
    options: {
      quality: 0.6,
      maxWidth: 1200,
      maxHeight: 1200,
      outputFormat: 'image/jpeg',
    },
  },
  {
    name: 'Maximum Compression',
    description: '40% quality, max 800px — Thumbnails, previews, social media cards',
    options: {
      quality: 0.4,
      maxWidth: 800,
      maxHeight: 800,
      outputFormat: 'image/webp',
    },
  },
  {
    name: 'High Quality',
    description: '90% quality, original size — Minimal compression for archival or print',
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
