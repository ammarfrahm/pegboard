import { useCallback, useEffect, useState } from 'react';
import JSZip from 'jszip';
import { Download } from 'lucide-react';
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
    <div className="border-2 p-6 space-y-6" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2" style={{ backgroundColor: 'var(--success)' }} />
        <h2 className="font-mono text-sm font-semibold tracking-wider uppercase" style={{ color: 'var(--muted)' }}>
          RESULTS
        </h2>
      </div>

      {/* Gauge Stats Display */}
      <div className="border-2 p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="font-mono text-xs tracking-wider uppercase mb-1" style={{ color: 'var(--muted)' }}>
              ORIGINAL
            </p>
            <p className="font-mono text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              <AnimatedNumber value={originalSizeNum} />
              <span className="text-sm font-normal ml-1" style={{ color: 'var(--muted)' }}>KB</span>
            </p>
          </div>
          <div>
            <p className="font-mono text-xs tracking-wider uppercase mb-1" style={{ color: 'var(--muted)' }}>
              COMPRESSED
            </p>
            <p className="font-mono text-2xl font-bold" style={{ color: 'var(--accent)' }}>
              <AnimatedNumber value={compressedSizeNum} />
              <span className="text-sm font-normal ml-1" style={{ color: 'var(--muted)' }}>KB</span>
            </p>
          </div>
        </div>

        {/* Arrow indicator */}
        <div className="flex items-center justify-center my-4">
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
          <svg className="w-6 h-6 mx-2" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
        </div>

        {/* Savings Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-mono text-xs tracking-wider uppercase" style={{ color: 'var(--muted)' }}>
              SAVED
            </span>
            <span className="font-mono text-xl font-bold" style={{ color: 'var(--success)' }}>
              <AnimatedNumber value={savingsNum} suffix="%" />
            </span>
          </div>

          {/* Segmented progress bar */}
          <div className="flex gap-0.5">
            {Array.from({ length: 20 }).map((_, i) => {
              const threshold = (i + 1) * 5;
              const filled = savingsNum >= threshold;
              return (
                <div
                  key={i}
                  className="h-3 flex-1 transition-all duration-300"
                  style={{
                    backgroundColor: filled ? 'var(--success)' : 'var(--border)',
                    transitionDelay: `${i * 20}ms`
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Compression time */}
      {image.compressionTime && (
        <p className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
          PROCESSED IN {image.compressionTime}MS
        </p>
      )}

      {/* Download button */}
      <button
        onClick={handleDownloadSingle}
        className="w-full btn-primary px-4 py-3 flex items-center justify-center gap-2"
      >
        <Download className="w-4 h-4" />
        DOWNLOAD
      </button>

      {/* Batch Stats */}
      {completedImages.length > 1 && (
        <div className="space-y-4 pt-4 border-t-2" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2" style={{ backgroundColor: 'var(--accent)' }} />
            <h3 className="font-mono text-xs tracking-wider uppercase" style={{ color: 'var(--muted)' }}>
              ALL IMAGES ({completedImages.length})
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center border-2 p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
            <div>
              <p className="font-mono text-xs tracking-wider uppercase mb-1" style={{ color: 'var(--muted)' }}>
                TOTAL ORIGINAL
              </p>
              <p className="font-mono text-lg font-bold">{formatFileSize(totalOriginalSize)}</p>
            </div>
            <div>
              <p className="font-mono text-xs tracking-wider uppercase mb-1" style={{ color: 'var(--muted)' }}>
                TOTAL COMPRESSED
              </p>
              <p className="font-mono text-lg font-bold" style={{ color: 'var(--accent)' }}>
                {formatFileSize(totalCompressedSize)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border-2" style={{ borderColor: 'var(--success)', backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
            <span className="font-mono text-sm tracking-wider uppercase" style={{ color: 'var(--success)' }}>
              TOTAL SAVED
            </span>
            <span className="font-mono text-xl font-bold" style={{ color: 'var(--success)' }}>
              <AnimatedNumber value={totalSavingsNum} suffix="%" />
            </span>
          </div>

          <button
            onClick={handleDownloadAll}
            className="w-full btn-secondary px-4 py-3 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            DOWNLOAD ALL (ZIP)
          </button>
        </div>
      )}
    </div>
  );
}
