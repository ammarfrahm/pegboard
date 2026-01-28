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
    <div className="border-2 overflow-hidden" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
      {/* View Mode Tabs */}
      {hasCompressed && (
        <div className="flex border-b-2" style={{ borderColor: 'var(--border)' }}>
          {(['comparison', 'before', 'after'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className="flex-1 px-4 py-2 font-mono text-xs tracking-wider uppercase transition-all relative"
              style={{
                color: viewMode === mode ? 'var(--accent)' : 'var(--muted)',
                backgroundColor: viewMode === mode ? 'var(--background)' : 'transparent',
              }}
            >
              {mode}
              {viewMode === mode && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: 'var(--accent)' }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Image Display */}
      <div className="relative aspect-video scanlines" style={{ backgroundColor: 'var(--background)' }}>
        {image.status === 'compressing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            {/* Industrial spinner */}
            <div className="relative w-16 h-16">
              <div
                className="absolute inset-0 border-4 animate-spin"
                style={{
                  borderColor: 'var(--border)',
                  borderTopColor: 'var(--accent)',
                }}
              />
              <div className="absolute inset-2 border-2" style={{ borderColor: 'var(--border)' }} />
            </div>
            <p className="font-mono text-sm tracking-wider" style={{ color: 'var(--muted)' }}>
              PROCESSING... {image.progress}%
            </p>
            {/* Segmented progress bar */}
            <div className="flex gap-0.5 w-48">
              {Array.from({ length: 10 }).map((_, i) => {
                const threshold = (i + 1) * 10;
                const filled = (image.progress || 0) >= threshold;
                return (
                  <div
                    key={i}
                    className="h-2 flex-1 transition-colors"
                    style={{ backgroundColor: filled ? 'var(--accent)' : 'var(--border)' }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {image.status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center" style={{ backgroundColor: 'var(--danger)' }}>
              <svg className="w-6 h-6" style={{ color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="font-mono text-sm" style={{ color: 'var(--danger)' }}>
              {image.error || 'COMPRESSION FAILED'}
            </p>
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

        {/* Corner frame markers */}
        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 pointer-events-none" style={{ borderColor: 'var(--accent)' }} />
        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 pointer-events-none" style={{ borderColor: 'var(--accent)' }} />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 pointer-events-none" style={{ borderColor: 'var(--accent)' }} />
        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 pointer-events-none" style={{ borderColor: 'var(--accent)' }} />
      </div>

      {/* File Name */}
      <div className="px-4 py-2 border-t-2" style={{ borderColor: 'var(--border)' }}>
        <p className="font-mono text-sm truncate">{image.file.name}</p>
      </div>
    </div>
  );
}
