import { useState } from 'react';
import { ComparisonSlider } from './ComparisonSlider';
import type { ImageFile } from '../types';

interface ImagePreviewProps {
  image: ImageFile;
}

export function ImagePreview({ image }: ImagePreviewProps) {
  const [viewMode, setViewMode] = useState<'comparison' | 'before' | 'after'>('comparison');

  const hasCompressed = image.status === 'completed' && image.compressedUrl;

  return (
    <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] overflow-hidden">
      {/* View Mode Tabs */}
      {hasCompressed && (
        <div className="flex border-b border-[hsl(var(--border))]">
          <button
            onClick={() => setViewMode('comparison')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === 'comparison'
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
            }`}
          >
            Comparison
          </button>
          <button
            onClick={() => setViewMode('before')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === 'before'
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
            }`}
          >
            Before
          </button>
          <button
            onClick={() => setViewMode('after')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === 'after'
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
            }`}
          >
            After
          </button>
        </div>
      )}

      {/* Image Display */}
      <div className="relative aspect-video bg-[hsl(var(--muted))]">
        {image.status === 'compressing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Compressing... {image.progress}%
            </p>
            <div className="w-48 h-2 bg-[hsl(var(--background))] rounded-full overflow-hidden">
              <div
                className="h-full bg-[hsl(var(--primary))] transition-all"
                style={{ width: `${image.progress}%` }}
              />
            </div>
          </div>
        )}

        {image.status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[hsl(var(--destructive))]">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-sm">{image.error || 'Compression failed'}</p>
          </div>
        )}

        {(image.status === 'pending' || !hasCompressed) && image.status !== 'compressing' && image.status !== 'error' && (
          <img
            src={image.originalUrl}
            alt="Original"
            className="absolute inset-0 w-full h-full object-contain"
          />
        )}

        {hasCompressed && viewMode === 'comparison' && (
          <ComparisonSlider
            beforeUrl={image.originalUrl}
            afterUrl={image.compressedUrl!}
          />
        )}

        {hasCompressed && viewMode === 'before' && (
          <img
            src={image.originalUrl}
            alt="Before compression"
            className="absolute inset-0 w-full h-full object-contain"
          />
        )}

        {hasCompressed && viewMode === 'after' && (
          <img
            src={image.compressedUrl}
            alt="After compression"
            className="absolute inset-0 w-full h-full object-contain"
          />
        )}
      </div>

      {/* File Name */}
      <div className="px-4 py-2 border-t border-[hsl(var(--border))]">
        <p className="text-sm font-medium truncate">{image.file.name}</p>
      </div>
    </div>
  );
}
