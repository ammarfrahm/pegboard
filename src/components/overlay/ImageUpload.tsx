import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImagePlus } from 'lucide-react';

interface ImageUploadProps {
  onImageLoad: (image: HTMLImageElement, file: File) => void;
  compact?: boolean;
}

export function ImageUpload({ onImageLoad, compact }: ImageUploadProps) {
  const handleDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      onImageLoad(img, file);
    };
    img.src = URL.createObjectURL(file);
  }, [onImageLoad]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'] },
    multiple: false,
  });

  if (compact) {
    return (
      <div
        {...getRootProps()}
        className="border-2 border-dashed px-4 py-2 cursor-pointer transition-colors"
        style={{
          borderColor: isDragActive ? 'var(--accent)' : 'var(--border)',
          backgroundColor: isDragActive ? 'var(--surface)' : 'transparent',
        }}
      >
        <input {...getInputProps()} />
        <span className="font-mono text-sm" style={{ color: 'var(--muted)' }}>
          {isDragActive ? 'DROP IMAGE' : '+ ADD IMAGE'}
        </span>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed p-12 cursor-pointer transition-all text-center"
      style={{
        borderColor: isDragActive ? 'var(--accent)' : 'var(--border)',
        backgroundColor: isDragActive ? 'var(--surface)' : 'transparent',
      }}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-16 h-16 flex items-center justify-center"
          style={{ backgroundColor: 'var(--surface)', border: '2px solid var(--border)' }}
        >
          <ImagePlus className="w-8 h-8" style={{ color: 'var(--muted)' }} />
        </div>
        <div>
          <p className="font-display text-lg mb-2">
            {isDragActive ? 'DROP IMAGE HERE' : 'DROP IMAGE TO START'}
          </p>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            or click to browse
          </p>
        </div>
      </div>
    </div>
  );
}
