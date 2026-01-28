import { useState, useCallback } from 'react';
import { ImageUpload } from '../components/overlay/ImageUpload';
import { PreviewCanvas } from '../components/overlay/PreviewCanvas';
import { TextLayersPanel } from '../components/overlay/TextLayersPanel';
import { ExportPanel } from '../components/overlay/ExportPanel';
import { useTextLayers } from '../hooks/useTextLayers';

export function TextOverlay() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [filename, setFilename] = useState<string>();
  const [hoveredLayerId, setHoveredLayerId] = useState<string | null>(null);

  const {
    layers,
    selectedLayer,
    selectedLayerId,
    setSelectedLayerId,
    addLayer,
    updateLayer,
    removeLayer,
    duplicateLayer,
    moveLayerUp,
    moveLayerDown,
    clearLayers,
    setLayersFromYaml,
  } = useTextLayers();

  const handleImageLoad = useCallback((img: HTMLImageElement, file: File) => {
    setImage(img);
    setFilename(file.name);
  }, []);

  const handleClearImage = useCallback(() => {
    if (image) {
      URL.revokeObjectURL(image.src);
    }
    setImage(null);
    setFilename(undefined);
    clearLayers();
  }, [image, clearLayers]);

  if (!image) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-up">
        <ImageUpload onImageLoad={handleImageLoad} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Preview */}
      <div className="lg:col-span-2 space-y-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-4 animate-fade-up">
          <ImageUpload onImageLoad={handleImageLoad} compact />
          <div className="flex gap-2">
            <button
              onClick={() => addLayer()}
              className="btn-primary px-4 py-2 text-sm"
            >
              + ADD TEXT
            </button>
            <button
              onClick={handleClearImage}
              className="btn-secondary px-4 py-2 text-sm"
            >
              CLEAR
            </button>
          </div>
        </div>

        {/* Preview Canvas */}
        <div className="animate-fade-up delay-100">
          <PreviewCanvas
            image={image}
            layers={layers}
            selectedLayerId={selectedLayerId}
            hoveredLayerId={hoveredLayerId}
            onSelectLayer={setSelectedLayerId}
            onUpdateLayer={updateLayer}
            onHoverLayer={setHoveredLayerId}
          />
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div
          className="text-center font-mono text-xs animate-fade-up delay-200"
          style={{ color: 'var(--muted)' }}
        >
          Drag text to position • Click to select • Use panel to customize
        </div>
      </div>

      {/* Right Column - Controls */}
      <div className="space-y-4">
        <div className="animate-fade-up delay-100">
          <TextLayersPanel
            layers={layers}
            selectedLayer={selectedLayer}
            selectedLayerId={selectedLayerId}
            hoveredLayerId={hoveredLayerId}
            onSelectLayer={setSelectedLayerId}
            onHoverLayer={setHoveredLayerId}
            onAddLayer={addLayer}
            onUpdateLayer={updateLayer}
            onRemoveLayer={removeLayer}
            onDuplicateLayer={duplicateLayer}
            onMoveLayerUp={moveLayerUp}
            onMoveLayerDown={moveLayerDown}
            onClearLayers={clearLayers}
            onImportYaml={setLayersFromYaml}
          />
        </div>

        <div className="animate-fade-up delay-200">
          <ExportPanel
            image={image}
            layers={layers}
            originalFilename={filename}
          />
        </div>
      </div>
    </div>
  );
}
