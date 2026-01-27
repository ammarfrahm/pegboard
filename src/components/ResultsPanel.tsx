import { useCallback } from 'react';
import JSZip from 'jszip';
import { formatFileSize, calculateSavings, getFileExtension } from '../utils/fileHelpers';
import type { ImageFile } from '../types';

interface ResultsPanelProps {
  image: ImageFile;
  images: ImageFile[];
}

export function ResultsPanel({ image, images }: ResultsPanelProps) {
  const completedImages = images.filter(
    (img) => img.status === 'completed' && img.compressedBlob
  );

  const handleDownloadSingle = useCallback(() => {
    if (!image.compressedUrl || !image.compressedBlob) return;

    const extension = getFileExtension(image.compressedBlob.type);
    const originalName = image.file.name.replace(/\.[^.]+$/, '');
    const fileName = `${originalName}-compressed.${extension}`;

    const link = document.createElement('a');
    link.href = image.compressedUrl;
    link.download = fileName;
    link.click();
  }, [image]);

  const handleDownloadAll = useCallback(async () => {
    if (completedImages.length === 0) return;

    if (completedImages.length === 1) {
      handleDownloadSingle();
      return;
    }

    const zip = new JSZip();

    completedImages.forEach((img) => {
      if (!img.compressedBlob) return;
      const extension = getFileExtension(img.compressedBlob.type);
      const originalName = img.file.name.replace(/\.[^.]+$/, '');
      const fileName = `${originalName}-compressed.${extension}`;
      zip.file(fileName, img.compressedBlob);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'compressed-images.zip';
    link.click();

    URL.revokeObjectURL(url);
  }, [completedImages, handleDownloadSingle]);

  const savings = calculateSavings(image.originalSize, image.compressedSize || 0);
  const totalOriginalSize = completedImages.reduce((sum, img) => sum + img.originalSize, 0);
  const totalCompressedSize = completedImages.reduce(
    (sum, img) => sum + (img.compressedSize || 0),
    0
  );
  const totalSavings = calculateSavings(totalOriginalSize, totalCompressedSize);

  return (
    <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6 space-y-6">
      <h2 className="font-semibold text-lg">Results</h2>

      {/* Current Image Stats */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
          Selected Image
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Original</p>
            <p className="text-lg font-semibold">{formatFileSize(image.originalSize)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Compressed</p>
            <p className="text-lg font-semibold">
              {formatFileSize(image.compressedSize || 0)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
          <span className="text-sm text-green-600 dark:text-green-400">Saved</span>
          <span className="text-lg font-bold text-green-600 dark:text-green-400">
            {savings}%
          </span>
        </div>

        {image.compressionTime && (
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Compressed in {image.compressionTime}ms
          </p>
        )}

        <button
          onClick={handleDownloadSingle}
          className="w-full px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download
        </button>
      </div>

      {/* Batch Stats */}
      {completedImages.length > 1 && (
        <div className="space-y-4 pt-4 border-t border-[hsl(var(--border))]">
          <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
            All Images ({completedImages.length})
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Total Original</p>
              <p className="text-lg font-semibold">{formatFileSize(totalOriginalSize)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Total Compressed</p>
              <p className="text-lg font-semibold">{formatFileSize(totalCompressedSize)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
            <span className="text-sm text-green-600 dark:text-green-400">Total Saved</span>
            <span className="text-lg font-bold text-green-600 dark:text-green-400">
              {totalSavings}%
            </span>
          </div>

          <button
            onClick={handleDownloadAll}
            className="w-full px-4 py-2 bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download All (ZIP)
          </button>
        </div>
      )}
    </div>
  );
}
