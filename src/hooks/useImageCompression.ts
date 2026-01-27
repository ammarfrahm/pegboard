import { useCallback, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import type { CompressionOptions } from '../types';

interface CompressionResult {
  blob: Blob;
  url: string;
  time: number;
}

export function useImageCompression() {
  const abortControllerRef = useRef<AbortController | null>(null);

  const compress = useCallback(
    async (
      file: File,
      options: CompressionOptions,
      onProgress?: (progress: number) => void
    ): Promise<CompressionResult> => {
      abortControllerRef.current = new AbortController();

      const startTime = performance.now();

      const compressionOptions = {
        maxSizeMB: 10,
        maxWidthOrHeight: options.maxWidth || options.maxHeight
          ? Math.max(options.maxWidth || 0, options.maxHeight || 0)
          : undefined,
        useWebWorker: true,
        fileType: options.outputFormat,
        initialQuality: options.quality,
        preserveExif: options.preserveExif,
        signal: abortControllerRef.current.signal,
        onProgress: (progress: number) => {
          onProgress?.(Math.round(progress));
        },
      };

      const compressedBlob = await imageCompression(file, compressionOptions);
      const endTime = performance.now();

      const url = URL.createObjectURL(compressedBlob);

      return {
        blob: compressedBlob,
        url,
        time: Math.round(endTime - startTime),
      };
    },
    []
  );

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return { compress, abort };
}
