import { useCallback } from 'react';
import { DropZone } from '../DropZone';

interface ImageUploadProps {
  onImageLoad: (image: HTMLImageElement, file: File) => void;
  compact?: boolean;
}

const accept = {
  'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'],
};

export function ImageUpload({ onImageLoad, compact }: ImageUploadProps) {
  const handleFilesAccepted = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      onImageLoad(img, file);
    };
    img.src = URL.createObjectURL(file);
  }, [onImageLoad]);

  return (
    <DropZone
      onFilesAccepted={handleFilesAccepted}
      compact={compact}
      multiple={false}
      accept={accept}
      label="DROP IMAGE HERE"
      compactLabel="CHANGE IMAGE"
    />
  );
}
