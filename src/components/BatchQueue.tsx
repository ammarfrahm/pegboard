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
    <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] overflow-hidden">
      <div className="px-4 py-3 border-b border-[hsl(var(--border))]">
        <h3 className="font-medium">
          Images ({images.length})
        </h3>
      </div>
      <div className="divide-y divide-[hsl(var(--border))] max-h-64 overflow-y-auto">
        {images.map((image) => (
          <div
            key={image.id}
            onClick={() => onSelect(image)}
            className={`
              flex items-center gap-3 p-3 cursor-pointer transition-colors
              ${selectedId === image.id ? 'bg-[hsl(var(--primary))]/10' : 'hover:bg-[hsl(var(--muted))]'}
            `}
          >
            {/* Thumbnail */}
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-[hsl(var(--muted))] flex-shrink-0">
              <img
                src={image.originalUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{image.file.name}</p>
              <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                <span>{formatFileSize(image.originalSize)}</span>
                {image.status === 'completed' && image.compressedSize && (
                  <>
                    <span>→</span>
                    <span>{formatFileSize(image.compressedSize)}</span>
                    <span className="text-green-500">
                      (-{calculateSavings(image.originalSize, image.compressedSize)}%)
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="flex-shrink-0">
              {image.status === 'pending' && (
                <span className="px-2 py-1 text-xs rounded bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
                  Pending
                </span>
              )}
              {image.status === 'compressing' && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">
                    {image.progress}%
                  </span>
                </div>
              )}
              {image.status === 'completed' && (
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              {image.status === 'error' && (
                <svg
                  className="w-5 h-5 text-[hsl(var(--destructive))]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </div>

            {/* Remove Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(image.id);
              }}
              className="flex-shrink-0 p-1 rounded hover:bg-[hsl(var(--destructive))]/10 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
