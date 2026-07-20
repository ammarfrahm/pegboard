import { useCallback, useEffect, useState } from 'react';
import JSZip from 'jszip';
import { Download, ArrowDown } from 'lucide-react';
import { formatFileSize, calculateSavings, getFileExtension } from '../utils/fileHelpers';
import type { ImageFile } from '../types';

interface ResultsPanelProps {
  image: ImageFile;
  images: ImageFile[];
}

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 500;
    const steps = 20;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(increment * step, value);
      setDisplayValue(current);

      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="animate-count-up">
      {displayValue.toFixed(suffix === '%' ? 0 : 2)}{suffix}
    </span>
  );
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

  const savingsNum = calculateSavings(image.originalSize, image.compressedSize || 0);
  const totalOriginalSize = completedImages.reduce((sum, img) => sum + img.originalSize, 0);
  const totalCompressedSize = completedImages.reduce(
    (sum, img) => sum + (img.compressedSize || 0),
    0
  );
  const totalSavingsNum = calculateSavings(totalOriginalSize, totalCompressedSize);

  // Parse file sizes for animation
  const originalSizeNum = image.originalSize / 1024;
  const compressedSizeNum = (image.compressedSize || 0) / 1024;

  return (
    <div className="panel space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-ok" />
        <h2 className="tape-label">Results</h2>
      </div>

      {/* Stats */}
      <div className="rounded-xl border border-line bg-well p-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="tape-label mb-1">Original</p>
            <p className="font-mono text-2xl font-bold">
              <AnimatedNumber value={originalSizeNum} />
              <span className="ml-1 text-sm font-normal text-subtle">KB</span>
            </p>
          </div>
          <div>
            <p className="tape-label mb-1">Compressed</p>
            <p className="font-mono text-2xl font-bold text-accent">
              <AnimatedNumber value={compressedSizeNum} />
              <span className="ml-1 text-sm font-normal text-subtle">KB</span>
            </p>
          </div>
        </div>

        {/* Arrow indicator */}
        <div className="my-4 flex items-center justify-center">
          <div className="h-px flex-1 bg-line" />
          <ArrowDown className="mx-2 h-5 w-5 text-accent" />
          <div className="h-px flex-1 bg-line" />
        </div>

        {/* Savings */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="tape-label">Saved</span>
            <span className="font-mono text-xl font-bold text-ok">
              <AnimatedNumber value={savingsNum} suffix="%" />
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-ok transition-all duration-500"
              style={{ width: `${Math.max(0, Math.min(100, savingsNum))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Compression time */}
      {image.compressionTime && (
        <p className="font-mono text-xs text-subtle">
          Processed in {image.compressionTime}ms
        </p>
      )}

      {/* Download button */}
      <button
        onClick={handleDownloadSingle}
        className="btn-primary flex w-full items-center justify-center gap-2 px-4 py-3"
      >
        <Download className="h-4 w-4" />
        Download
      </button>

      {/* Batch Stats */}
      {completedImages.length > 1 && (
        <div className="space-y-4 border-t border-line pt-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-accent" />
            <h3 className="tape-label">All images · {completedImages.length}</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-xl border border-line bg-well p-4 text-center">
            <div>
              <p className="tape-label mb-1">Total original</p>
              <p className="font-mono text-lg font-bold">{formatFileSize(totalOriginalSize)}</p>
            </div>
            <div>
              <p className="tape-label mb-1">Total compressed</p>
              <p className="font-mono text-lg font-bold text-accent">
                {formatFileSize(totalCompressedSize)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-ok/10 p-3">
            <span className="text-sm font-medium text-ok">Total saved</span>
            <span className="font-mono text-xl font-bold text-ok">
              <AnimatedNumber value={totalSavingsNum} suffix="%" />
            </span>
          </div>

          <button
            onClick={handleDownloadAll}
            className="btn-secondary flex w-full items-center justify-center gap-2 px-4 py-3"
          >
            <Download className="h-4 w-4" />
            Download all (ZIP)
          </button>
        </div>
      )}
    </div>
  );
}
