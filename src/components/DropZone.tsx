import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Plus, ImagePlus } from 'lucide-react';

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
        className="flex items-center gap-2 px-4 py-2 cursor-pointer transition-all border-2 border-dashed"
        style={{
          borderColor: isDragActive ? 'var(--accent)' : 'var(--border)',
          backgroundColor: isDragActive ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
        }}
      >
        <input {...getInputProps()} />
        <Plus
          className="w-5 h-5"
          style={{ color: isDragActive ? 'var(--accent)' : 'var(--muted)' }}
        />
        <span className="font-mono text-sm" style={{ color: 'var(--muted)' }}>
          ADD MORE
        </span>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className="relative flex flex-col items-center justify-center p-16 cursor-pointer transition-all border-2 border-dashed overflow-hidden"
      style={{
        borderColor: isDragActive ? 'var(--accent)' : 'var(--border)',
        backgroundColor: isDragActive ? 'rgba(6, 182, 212, 0.05)' : 'var(--surface)',
        transform: isDragActive ? 'scale(1.01)' : 'scale(1)',
      }}
    >
      <input {...getInputProps()} />

      {/* Grid pattern overlay on hover */}
      <div
        className="absolute inset-0 transition-opacity pointer-events-none"
        style={{
          opacity: isDragActive ? 1 : 0,
          backgroundImage:
            'linear-gradient(var(--accent) 1px, transparent 1px), linear-gradient(90deg, var(--accent) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative flex flex-col items-center gap-6">
        {/* Industrial icon */}
        <div
          className="w-20 h-20 flex items-center justify-center transition-all"
          style={{
            backgroundColor: isDragActive ? 'var(--accent)' : 'var(--border)',
          }}
        >
          <ImagePlus
            className="w-10 h-10 transition-colors"
            style={{
              color: isDragActive ? 'var(--accent-foreground)' : 'var(--muted)',
            }}
            strokeWidth={1.5}
          />
        </div>

        <div className="text-center space-y-2">
          <p className="font-display text-lg tracking-wide">
            {isDragActive ? 'DROP FILES HERE' : 'DROP IMAGES HERE'}
          </p>
          <p className="font-mono text-sm" style={{ color: 'var(--muted)' }}>
            OR CLICK TO BROWSE
          </p>
          <p className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
            JPEG / PNG / WEBP
          </p>
        </div>

        {/* Corner markers */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: isDragActive ? 'var(--accent)' : 'var(--border)' }} />
        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: isDragActive ? 'var(--accent)' : 'var(--border)' }} />
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: isDragActive ? 'var(--accent)' : 'var(--border)' }} />
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: isDragActive ? 'var(--accent)' : 'var(--border)' }} />
      </div>
    </div>
  );
}
