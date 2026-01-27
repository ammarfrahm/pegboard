import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface DropZoneProps {
  onFilesAccepted: (files: File[]) => void;
  compact?: boolean;
}

export function DropZone({ onFilesAccepted, compact = false }: DropZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesAccepted(acceptedFiles);
    },
    [onFilesAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    multiple: true,
  });

  if (compact) {
    return (
      <div
        {...getRootProps()}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors
          border-2 border-dashed
          ${
            isDragActive
              ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10'
              : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]'
          }
        `}
      >
        <input {...getInputProps()} />
        <svg
          className="w-5 h-5 text-[hsl(var(--muted-foreground))]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span className="text-sm text-[hsl(var(--muted-foreground))]">
          Add more images
        </span>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`
        flex flex-col items-center justify-center p-12 rounded-xl cursor-pointer transition-all
        border-2 border-dashed
        ${
          isDragActive
            ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 scale-[1.02]'
            : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--muted))]/50'
        }
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        <div
          className={`
            p-4 rounded-full transition-colors
            ${isDragActive ? 'bg-[hsl(var(--primary))]/20' : 'bg-[hsl(var(--muted))]'}
          `}
        >
          <svg
            className={`w-12 h-12 transition-colors ${
              isDragActive
                ? 'text-[hsl(var(--primary))]'
                : 'text-[hsl(var(--muted-foreground))]'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-lg font-medium">
            {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
          </p>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            or click to browse (JPEG, PNG, WebP)
          </p>
        </div>
      </div>
    </div>
  );
}
