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
  label = 'Drop images here',
  compactLabel = 'Add more',
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
        className={`flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-4 py-2 transition-colors ${
          isDragActive
            ? 'border-accent bg-accent/10 text-accent'
            : 'border-line text-subtle hover:border-accent hover:text-accent'
        }`}
      >
        <input {...getInputProps()} />
        <Plus className="h-5 w-5" />
        <span className="text-sm font-medium">{compactLabel}</span>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed p-16 transition-all ${
        isDragActive ? 'scale-[1.01] border-accent bg-accent/5' : 'border-line bg-surface'
      }`}
    >
      <input {...getInputProps()} />

      {/* Peg-hole grid glows through while dragging */}
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity ${
          isDragActive ? 'opacity-30' : 'opacity-0'
        }`}
        style={{
          backgroundImage: 'radial-gradient(circle, var(--accent) 1.5px, transparent 1.6px)',
          backgroundSize: '26px 26px',
        }}
      />

      <div className="relative flex flex-col items-center gap-5">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-xl transition-colors ${
            isDragActive ? 'bg-accent text-accent-ink' : 'bg-well text-subtle'
          }`}
        >
          <Icon className="h-7 w-7" strokeWidth={1.5} />
        </div>

        <div className="space-y-1.5 text-center">
          <p className="font-display text-lg tracking-tight">
            {isDragActive ? 'Drop it here' : label}
          </p>
          <p className="text-sm text-subtle">or click to browse</p>
          {hint && <p className="tape-label pt-1">{hint}</p>}
        </div>
      </div>
    </div>
  );
}
