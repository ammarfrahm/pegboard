import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import type { Accept } from 'react-dropzone';
import { Plus, ImagePlus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface DropZoneProps {
  onFilesAccepted: (files: File[]) => void;
  compact?: boolean;
  multiple?: boolean;
  accept?: Accept;
  icon?: LucideIcon;
  label?: string;
  compactLabel?: string;
  hint?: string;
}

const defaultAccept: Accept = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

export function DropZone({
  onFilesAccepted,
  compact = false,
  multiple = true,
  accept = defaultAccept,
  icon: Icon = ImagePlus,
  label = 'DROP IMAGES HERE',
  compactLabel = 'ADD MORE',
  hint,
}: DropZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesAccepted(acceptedFiles);
    },
    [onFilesAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
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
          {compactLabel}
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

      {/* Corner markers */}
      <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: isDragActive ? 'var(--accent)' : 'var(--border)' }} />
      <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: isDragActive ? 'var(--accent)' : 'var(--border)' }} />
      <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: isDragActive ? 'var(--accent)' : 'var(--border)' }} />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: isDragActive ? 'var(--accent)' : 'var(--border)' }} />

      <div className="relative flex flex-col items-center gap-6">
        <Icon
          className="w-12 h-12 transition-colors"
          style={{
            color: isDragActive ? 'var(--accent)' : 'var(--muted)',
          }}
          strokeWidth={1.5}
        />

        <div className="text-center space-y-2">
          <p className="font-display text-lg tracking-wide">
            {isDragActive ? 'DROP HERE' : label}
          </p>
          <p className="font-mono text-sm" style={{ color: 'var(--muted)' }}>
            OR CLICK TO BROWSE
          </p>
          {hint && (
            <p className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
              {hint}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
