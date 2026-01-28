import { useState, useCallback } from 'react';
import { DropZone } from '../components/DropZone';
import { OptionsPanel } from '../components/OptionsPanel';
import { BatchQueue } from '../components/BatchQueue';
import { ImagePreview } from '../components/ImagePreview';
import { ResultsPanel } from '../components/ResultsPanel';
import { useBatchProcessor } from '../hooks/useBatchProcessor';
import { defaultOptions } from '../utils/presets';
import type { CompressionOptions, ImageFile } from '../types';

export function CompressPage() {
  const [options, setOptions] = useState<CompressionOptions>(defaultOptions);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const {
    images,
    addImages,
    removeImage,
    clearAll,
    compressAll,
    isProcessing,
  } = useBatchProcessor(options);

  const selectedImage = selectedImageId
    ? images.find(img => img.id === selectedImageId) || null
    : null;

  const handleFilesAccepted = useCallback((files: File[]) => {
    const newImages = addImages(files);
    if (newImages.length > 0 && !selectedImageId) {
      setSelectedImageId(newImages[0].id);
    }
  }, [addImages, selectedImageId]);

  const handleImageSelect = useCallback((image: ImageFile) => {
    setSelectedImageId(image.id);
  }, []);

  const handleImageRemove = useCallback((id: string) => {
    removeImage(id);
    if (selectedImageId === id) {
      const remaining = images.filter(img => img.id !== id);
      setSelectedImageId(remaining[0]?.id || null);
    }
  }, [removeImage, selectedImageId, images]);

  const handleClearAll = useCallback(() => {
    clearAll();
    setSelectedImageId(null);
  }, [clearAll]);

  return (
    <>
      {images.length === 0 ? (
        <div className="max-w-2xl mx-auto animate-fade-up">
          <DropZone onFilesAccepted={handleFilesAccepted} hint="JPEG / PNG / WEBP" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Top bar */}
            <div className="flex items-center justify-between gap-4 animate-fade-up">
              <DropZone
                onFilesAccepted={handleFilesAccepted}
                compact
              />
              <div className="flex gap-2">
                <button
                  onClick={compressAll}
                  disabled={isProcessing || images.every(img => img.status === 'completed')}
                  className="btn-primary px-4 py-2 text-sm"
                >
                  {isProcessing ? 'PROCESSING...' : 'COMPRESS ALL'}
                </button>
                <button
                  onClick={handleClearAll}
                  className="btn-secondary px-4 py-2 text-sm"
                >
                  CLEAR
                </button>
              </div>
            </div>

            {/* Image preview */}
            {selectedImage && (
              <div className="animate-fade-up delay-100">
                <ImagePreview image={selectedImage} />
              </div>
            )}

            {/* Batch queue */}
            <div className="animate-fade-up delay-200">
              <BatchQueue
                images={images}
                selectedId={selectedImage?.id}
                onSelect={handleImageSelect}
                onRemove={handleImageRemove}
              />
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <div className="animate-fade-up delay-100">
              <OptionsPanel
                options={options}
                onOptionsChange={setOptions}
                disabled={isProcessing}
              />
            </div>

            {selectedImage && selectedImage.status === 'completed' && (
              <div className="animate-fade-up delay-200">
                <ResultsPanel
                  image={selectedImage}
                  images={images}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
