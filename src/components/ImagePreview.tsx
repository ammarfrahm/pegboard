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
    <div className="panel overflow-hidden">
      {/* View Mode Tabs */}
      {hasCompressed && (
        <div className="flex border-b border-line">
          {(['comparison', 'before', 'after'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`relative flex-1 px-4 py-2 text-xs font-medium capitalize transition-colors ${
                viewMode === mode ? 'bg-well text-accent' : 'text-subtle hover:text-ink'
              }`}
            >
              {mode}
              {viewMode === mode && (
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-accent" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Image Display */}
      <div className="relative aspect-video bg-well">
        {image.status === 'compressing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-line border-t-accent" />
            <p className="font-mono text-sm text-subtle">
              Processing… {image.progress}%
            </p>
            <div className="h-1.5 w-48 overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${image.progress || 0}%` }}
              />
            </div>
          </div>
        )}

        {image.status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bad">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-sm text-bad">
              {image.error || 'Compression failed'}
            </p>
          </div>
        )}

        {(image.status === 'pending' || !hasCompressed) && image.status !== 'compressing' && image.status !== 'error' && (
          <img
            src={image.originalUrl}
            alt="Original"
            className="absolute inset-0 h-full w-full object-contain"
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
            className="absolute inset-0 h-full w-full object-contain"
          />
        )}

        {hasCompressed && viewMode === 'after' && (
          <img
            src={image.compressedUrl}
            alt="After compression"
            className="absolute inset-0 h-full w-full object-contain"
          />
        )}
      </div>

      {/* File Name */}
      <div className="border-t border-line px-4 py-2">
        <p className="truncate font-mono text-sm">{image.file.name}</p>
      </div>
    </div>
  );
}
