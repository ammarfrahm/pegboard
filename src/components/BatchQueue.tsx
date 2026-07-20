import { X } from 'lucide-react';
import { formatFileSize, calculateSavings } from '../utils/fileHelpers';
import type { ImageFile } from '../types';

interface BatchQueueProps {
  images: ImageFile[];
  selectedId?: string;
  onSelect: (image: ImageFile) => void;
  onRemove: (id: string) => void;
}

export function BatchQueue({ images, selectedId, onSelect, onRemove }: BatchQueueProps) {
  if (images.length === 0) return null;

  return (
    <div className="panel overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <div className="h-2 w-2 rounded-full bg-accent" />
        <h3 className="tape-label">Queue · {images.length}</h3>
      </div>

      {/* Table header */}
      <div className="tape-label grid grid-cols-[48px_1fr_auto_auto_32px] gap-3 border-b border-line bg-well px-4 py-2">
        <span></span>
        <span>File</span>
        <span>Size</span>
        <span>Status</span>
        <span></span>
      </div>

      {/* Table body */}
      <div className="max-h-64 overflow-y-auto">
        {images.map((image) => (
          <div
            key={image.id}
            onClick={() => onSelect(image)}
            className={`grid cursor-pointer grid-cols-[48px_1fr_auto_auto_32px] items-center gap-3 border-b border-line px-4 py-3 transition-colors ${
              selectedId === image.id
                ? 'bg-accent/10 shadow-[inset_3px_0_0_var(--accent)]'
                : 'hover:bg-well'
            }`}
          >
            {/* Thumbnail */}
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-line bg-well">
              <img
                src={image.originalUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>

            {/* File name */}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{image.file.name}</p>
            </div>

            {/* Size info */}
            <div className="text-right font-mono text-xs text-subtle">
              <span>{formatFileSize(image.originalSize)}</span>
              {image.status === 'completed' && image.compressedSize && (
                <>
                  <span className="mx-1">→</span>
                  <span className="text-accent">{formatFileSize(image.compressedSize)}</span>
                  <span className="ml-1 text-ok">
                    (-{calculateSavings(image.originalSize, image.compressedSize)}%)
                  </span>
                </>
              )}
            </div>

            {/* Status */}
            <div className="flex-shrink-0">
              {image.status === 'pending' && (
                <span className="rounded-md bg-well px-2 py-1 font-mono text-xs text-subtle">
                  Queued
                </span>
              )}
              {image.status === 'compressing' && (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-accent" />
                  <span className="font-mono text-xs text-accent">{image.progress}%</span>
                </div>
              )}
              {image.status === 'completed' && (
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-ok" />
                  <span className="font-mono text-xs text-ok">Done</span>
                </div>
              )}
              {image.status === 'error' && (
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-bad" />
                  <span className="font-mono text-xs text-bad">Failed</span>
                </div>
              )}
            </div>

            {/* Remove Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(image.id);
              }}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-line text-subtle transition-colors hover:border-bad hover:text-bad"
              title="Remove from queue"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
