import { useState, useCallback, useRef } from 'react';
import { useImageCompression } from './useImageCompression';
import { generateId, isValidImageType } from '../utils/fileHelpers';
import type { CompressionOptions, ImageFile } from '../types';

export function useBatchProcessor(options: CompressionOptions) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const { compress } = useImageCompression();

  const addImages = useCallback((files: File[]): ImageFile[] => {
    const validFiles = files.filter(isValidImageType);
    const newImages: ImageFile[] = validFiles.map((file) => ({
      id: generateId(),
      file,
      originalUrl: URL.createObjectURL(file),
      status: 'pending' as const,
      progress: 0,
      originalSize: file.size,
    }));

    setImages((prev) => [...prev, ...newImages]);
    return newImages;
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.originalUrl);
        if (image.compressedUrl) {
          URL.revokeObjectURL(image.compressedUrl);
        }
      }
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    setImages((prev) => {
      prev.forEach((image) => {
        URL.revokeObjectURL(image.originalUrl);
        if (image.compressedUrl) {
          URL.revokeObjectURL(image.compressedUrl);
        }
      });
      return [];
    });
  }, []);

  const compressImage = useCallback(
    async (id: string) => {
      setImages((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, status: 'compressing' as const, progress: 0 } : img
        )
      );

      const image = images.find((img) => img.id === id);
      if (!image) return;

      try {
        const result = await compress(image.file, optionsRef.current, (progress) => {
          setImages((prev) =>
            prev.map((img) => (img.id === id ? { ...img, progress } : img))
          );
        });

        setImages((prev) =>
          prev.map((img) =>
            img.id === id
              ? {
                  ...img,
                  status: 'completed' as const,
                  progress: 100,
                  compressedUrl: result.url,
                  compressedBlob: result.blob,
                  compressedSize: result.blob.size,
                  compressionTime: result.time,
                }
              : img
          )
        );
      } catch (error) {
        setImages((prev) =>
          prev.map((img) =>
            img.id === id
              ? {
                  ...img,
                  status: 'error' as const,
                  error: error instanceof Error ? error.message : 'Compression failed',
                }
              : img
          )
        );
      }
    },
    [images, compress]
  );

  const compressAll = useCallback(async () => {
    setIsProcessing(true);
    const pendingImages = images.filter(
      (img) => img.status === 'pending' || img.status === 'error'
    );

    for (const image of pendingImages) {
      await compressImage(image.id);
    }

    setIsProcessing(false);
  }, [images, compressImage]);

  return {
    images,
    addImages,
    removeImage,
    clearAll,
    compressImage,
    compressAll,
    isProcessing,
  };
}
