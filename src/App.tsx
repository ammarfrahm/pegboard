import { useState, useCallback } from 'react';
import { DropZone } from './components/DropZone';
import { OptionsPanel } from './components/OptionsPanel';
import { BatchQueue } from './components/BatchQueue';
import { ImagePreview } from './components/ImagePreview';
import { ResultsPanel } from './components/ResultsPanel';
import { ThemeToggle } from './components/ThemeToggle';
import { useTheme } from './hooks/useTheme';
import { useBatchProcessor } from './hooks/useBatchProcessor';
import { defaultOptions } from './utils/presets';
import type { CompressionOptions, ImageFile } from './types';

function App() {
  useTheme();
  const [options, setOptions] = useState<CompressionOptions>(defaultOptions);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);

  const {
    images,
    addImages,
    removeImage,
    clearAll,
    compressAll,
    isProcessing,
  } = useBatchProcessor(options);

  const handleFilesAccepted = useCallback((files: File[]) => {
    const newImages = addImages(files);
    if (newImages.length > 0 && !selectedImage) {
      setSelectedImage(newImages[0]);
    }
  }, [addImages, selectedImage]);

  const handleImageSelect = useCallback((image: ImageFile) => {
    setSelectedImage(image);
  }, []);

  const handleImageRemove = useCallback((id: string) => {
    removeImage(id);
    if (selectedImage?.id === id) {
      const remaining = images.filter(img => img.id !== id);
      setSelectedImage(remaining[0] || null);
    }
  }, [removeImage, selectedImage, images]);

  const handleClearAll = useCallback(() => {
    clearAll();
    setSelectedImage(null);
  }, [clearAll]);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <header className="border-b border-[hsl(var(--border))] px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <h1 className="text-2xl font-bold">Image Compressor</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {images.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <DropZone onFilesAccepted={handleFilesAccepted} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <DropZone
                  onFilesAccepted={handleFilesAccepted}
                  compact
                />
                <div className="flex gap-2">
                  <button
                    onClick={compressAll}
                    disabled={isProcessing || images.every(img => img.status === 'completed')}
                    className="px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  >
                    {isProcessing ? 'Compressing...' : 'Compress All'}
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="px-4 py-2 bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {selectedImage && (
                <ImagePreview image={selectedImage} />
              )}

              <BatchQueue
                images={images}
                selectedId={selectedImage?.id}
                onSelect={handleImageSelect}
                onRemove={handleImageRemove}
              />
            </div>

            <div className="space-y-6">
              <OptionsPanel
                options={options}
                onOptionsChange={setOptions}
                disabled={isProcessing}
              />

              {selectedImage && selectedImage.status === 'completed' && (
                <ResultsPanel
                  image={selectedImage}
                  images={images}
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
