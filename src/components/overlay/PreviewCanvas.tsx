import { useRef, useState, useEffect } from 'react';
import type { TextLayer } from '../../hooks/useTextLayers';
import { TextOverlayElement } from './TextOverlayElement';

interface PreviewCanvasProps {
  image: HTMLImageElement | null;
  layers: TextLayer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onUpdateLayer: (id: string, updates: Partial<TextLayer>) => void;
}

export function PreviewCanvas({
  image,
  layers,
  selectedLayerId,
  onSelectLayer,
  onUpdateLayer,
}: PreviewCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current || !image) return;

    const updateSize = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Calculate size maintaining aspect ratio
      const imageAspect = image.naturalWidth / image.naturalHeight;
      const containerAspect = containerWidth / containerHeight;

      let width: number, height: number;
      if (imageAspect > containerAspect) {
        width = containerWidth;
        height = containerWidth / imageAspect;
      } else {
        height = containerHeight;
        width = containerHeight * imageAspect;
      }

      setContainerSize({ width, height });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [image]);

  if (!image) {
    return (
      <div
        className="border-2 flex items-center justify-center"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--surface)',
          aspectRatio: '16/9',
        }}
      >
        <p className="font-mono text-sm" style={{ color: 'var(--muted)' }}>
          NO IMAGE LOADED
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="border-2 relative overflow-hidden"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: '#1a1a1a',
        aspectRatio: `${image.naturalWidth}/${image.naturalHeight}`,
        maxHeight: '70vh',
      }}
      onClick={() => onSelectLayer(null)}
    >
      {/* Image */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ pointerEvents: 'none' }}
      >
        <img
          src={image.src}
          alt="Preview"
          className="max-w-full max-h-full object-contain"
          style={{
            width: containerSize.width || 'auto',
            height: containerSize.height || 'auto',
          }}
        />
      </div>

      {/* Text Overlay Container */}
      <div
        className="absolute"
        style={{
          width: containerSize.width,
          height: containerSize.height,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {layers.map((layer) => (
          <TextOverlayElement
            key={layer.id}
            layer={layer}
            isSelected={layer.id === selectedLayerId}
            containerWidth={containerSize.width}
            containerHeight={containerSize.height}
            onSelect={() => onSelectLayer(layer.id)}
            onPositionChange={(x, y) => onUpdateLayer(layer.id, { x, y })}
          />
        ))}
      </div>

      {/* Dimensions Badge */}
      <div
        className="absolute bottom-2 right-2 px-2 py-1 font-mono text-xs"
        style={{
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'var(--muted)',
        }}
      >
        {image.naturalWidth} × {image.naturalHeight}
      </div>
    </div>
  );
}
