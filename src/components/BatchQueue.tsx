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
    <div className="border-2 overflow-hidden" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
      {/* Header */}
      <div className="px-4 py-3 border-b-2 flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
        <div className="w-2 h-2" style={{ backgroundColor: 'var(--accent)' }} />
        <h3 className="font-mono text-sm font-semibold tracking-wider uppercase" style={{ color: 'var(--muted)' }}>
          QUEUE ({images.length})
        </h3>
      </div>

      {/* Table header */}
      <div
        className="grid grid-cols-[48px_1fr_auto_auto_32px] gap-3 px-4 py-2 border-b text-xs font-mono tracking-wider uppercase"
        style={{ borderColor: 'var(--border)', color: 'var(--muted)', backgroundColor: 'var(--background)' }}
      >
        <span></span>
        <span>FILE</span>
        <span>SIZE</span>
        <span>STATUS</span>
        <span></span>
      </div>

      {/* Table body */}
      <div className="max-h-64 overflow-y-auto">
        {images.map((image) => (
          <div
            key={image.id}
            onClick={() => onSelect(image)}
            className="grid grid-cols-[48px_1fr_auto_auto_32px] gap-3 px-4 py-3 cursor-pointer transition-all border-b items-center"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: selectedId === image.id ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
              borderLeftWidth: selectedId === image.id ? '3px' : '0',
              borderLeftColor: selectedId === image.id ? 'var(--accent)' : 'transparent',
            }}
          >
            {/* Thumbnail */}
            <div className="w-12 h-12 overflow-hidden flex-shrink-0 border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
              <img
                src={image.originalUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>

            {/* File name */}
            <div className="min-w-0">
              <p className="font-mono text-sm truncate">{image.file.name}</p>
            </div>

            {/* Size info */}
            <div className="text-right font-mono text-xs" style={{ color: 'var(--muted)' }}>
              <span>{formatFileSize(image.originalSize)}</span>
              {image.status === 'completed' && image.compressedSize && (
                <>
                  <span className="mx-1">→</span>
                  <span style={{ color: 'var(--accent)' }}>{formatFileSize(image.compressedSize)}</span>
                  <span className="ml-1" style={{ color: 'var(--success)' }}>
                    (-{calculateSavings(image.originalSize, image.compressedSize)}%)
                  </span>
                </>
              )}
            </div>

            {/* Status */}
            <div className="flex-shrink-0">
              {image.status === 'pending' && (
                <span
                  className="px-2 py-1 font-mono text-xs tracking-wider uppercase"
                  style={{ backgroundColor: 'var(--border)', color: 'var(--muted)' }}
                >
                  PENDING
                </span>
              )}
              {image.status === 'compressing' && (
                <div className="flex items-center gap-2">
                  {/* LED-style indicator */}
                  <div
                    className="w-2 h-2 animate-pulse"
                    style={{ backgroundColor: 'var(--accent)' }}
                  />
                  <span className="font-mono text-xs" style={{ color: 'var(--accent)' }}>
                    {image.progress}%
                  </span>
                </div>
              )}
              {image.status === 'completed' && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2" style={{ backgroundColor: 'var(--success)' }} />
                  <span className="font-mono text-xs tracking-wider uppercase" style={{ color: 'var(--success)' }}>
                    DONE
                  </span>
                </div>
              )}
              {image.status === 'error' && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2" style={{ backgroundColor: 'var(--danger)' }} />
                  <span className="font-mono text-xs tracking-wider uppercase" style={{ color: 'var(--danger)' }}>
                    ERROR
                  </span>
                </div>
              )}
            </div>

            {/* Remove Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(image.id);
              }}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center border transition-colors"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--muted)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--danger)';
                e.currentTarget.style.color = 'var(--danger)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--muted)';
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
