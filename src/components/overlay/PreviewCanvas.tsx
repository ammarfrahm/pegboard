import { useRef, useState, useEffect, useCallback } from 'react';
import type { TextLayer } from '../../hooks/useTextLayers';
import { TextOverlayElement } from './TextOverlayElement';

interface PreviewCanvasProps {
  image: HTMLImageElement | null;
  layers: TextLayer[];
  selectedLayerId: string | null;
  hoveredLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onUpdateLayer: (id: string, updates: Partial<TextLayer>) => void;
  onHoverLayer: (id: string | null) => void;
}

interface SnapGuides {
  horizontal: boolean;
  vertical: boolean;
}

interface CursorPosition {
  x: number;
  y: number;
  naturalX: number;
  naturalY: number;
}

function Ruler({
  orientation,
  length,
  naturalLength
}: {
  orientation: 'horizontal' | 'vertical';
  length: number;
  naturalLength: number;
}) {
  const interval = naturalLength > 1000 ? 100 : 50;
  const scale = length / naturalLength;
  const ticks: { pos: number; label?: number }[] = [];

  for (let i = 0; i <= naturalLength; i += interval) {
    ticks.push({
      pos: i * scale,
      label: i % (interval * 2) === 0 ? i : undefined
    });
  }

  if (orientation === 'horizontal') {
    return (
      <div
        className="absolute top-0 left-6 h-6 overflow-hidden"
        style={{
          width: length,
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {ticks.map((tick, i) => (
          <div key={i}>
            <div
              className="absolute bottom-0"
              style={{
                left: tick.pos,
                width: 1,
                height: tick.label !== undefined ? 10 : 5,
                backgroundColor: 'var(--muted)',
              }}
            />
            {tick.label !== undefined && (
              <span
                className="absolute font-mono text-[10px]"
                style={{
                  left: tick.pos,
                  bottom: 12,
                  transform: 'translateX(-50%)',
                  color: 'var(--muted)',
                }}
              >
                {tick.label}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="absolute top-6 left-0 w-6 overflow-hidden"
      style={{
        height: length,
        backgroundColor: 'var(--surface)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {ticks.map((tick, i) => (
        <div key={i}>
          <div
            className="absolute right-0"
            style={{
              top: tick.pos,
              height: 1,
              width: tick.label !== undefined ? 10 : 5,
              backgroundColor: 'var(--muted)',
            }}
          />
          {tick.label !== undefined && (
            <span
              className="absolute font-mono text-[10px]"
              style={{
                top: tick.pos,
                right: 12,
                transform: 'translateY(-50%) rotate(-90deg)',
                transformOrigin: 'right center',
                color: 'var(--muted)',
              }}
            >
              {tick.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export function PreviewCanvas({
  image,
  layers,
  selectedLayerId,
  hoveredLayerId,
  onSelectLayer,
  onUpdateLayer,
  onHoverLayer,
}: PreviewCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [cursorPos, setCursorPos] = useState<CursorPosition | null>(null);
  const [snapGuides, setSnapGuides] = useState<SnapGuides>({ horizontal: false, vertical: false });

  useEffect(() => {
    if (!containerRef.current || !image) return;

    const updateSize = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerWidth = container.clientWidth - 24; // Account for ruler
      const containerHeight = container.clientHeight - 24;

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

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!imageContainerRef.current || !image) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x >= 0 && x <= containerSize.width && y >= 0 && y <= containerSize.height) {
      const scale = image.naturalWidth / containerSize.width;
      setCursorPos({
        x,
        y,
        naturalX: Math.round(x * scale),
        naturalY: Math.round(y * scale),
      });
    } else {
      setCursorPos(null);
    }
  }, [image, containerSize]);

  const handleMouseLeave = useCallback(() => {
    setCursorPos(null);
  }, []);

  const handleSnapGuidesChange = useCallback((guides: SnapGuides) => {
    setSnapGuides(guides);
  }, []);

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
        backgroundColor: 'var(--surface)',
        maxHeight: '70vh',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Ruler corner */}
      <div
        className="absolute top-0 left-0 w-6 h-6"
        style={{ backgroundColor: 'var(--background)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
      />

      {/* Rulers */}
      <Ruler
        orientation="horizontal"
        length={containerSize.width}
        naturalLength={image.naturalWidth}
      />
      <Ruler
        orientation="vertical"
        length={containerSize.height}
        naturalLength={image.naturalHeight}
      />

      {/* Cursor guides */}
      {cursorPos && (
        <>
          <div
            className="absolute pointer-events-none"
            style={{
              left: cursorPos.x + 24,
              top: 0,
              bottom: 0,
              width: 1,
              backgroundColor: 'var(--accent)',
              opacity: 0.5,
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              top: cursorPos.y + 24,
              left: 0,
              right: 0,
              height: 1,
              backgroundColor: 'var(--accent)',
              opacity: 0.5,
            }}
          />
        </>
      )}

      {/* Image container with offset for rulers */}
      <div
        ref={imageContainerRef}
        className="absolute"
        style={{
          top: 24,
          left: 24,
          width: containerSize.width,
          height: containerSize.height,
        }}
        onClick={() => onSelectLayer(null)}
      >
        {/* Image */}
        <img
          src={image.src}
          alt="Preview"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />

        {/* Snap Guide Lines */}
        {snapGuides.vertical && (
          <div
            className="absolute top-0 bottom-0 pointer-events-none"
            style={{
              left: '50%',
              width: 1,
              backgroundColor: 'var(--danger)',
              transform: 'translateX(-50%)',
            }}
          />
        )}
        {snapGuides.horizontal && (
          <div
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              top: '50%',
              height: 1,
              backgroundColor: 'var(--danger)',
              transform: 'translateY(-50%)',
            }}
          />
        )}

        {/* Text Overlay Container */}
        <div className="absolute inset-0">
          {layers.map((layer) => (
            <TextOverlayElement
              key={layer.id}
              layer={layer}
              isSelected={layer.id === selectedLayerId}
              isHovered={layer.id === hoveredLayerId}
              containerWidth={containerSize.width}
              containerHeight={containerSize.height}
              onSelect={() => onSelectLayer(layer.id)}
              onPositionChange={(x, y) => onUpdateLayer(layer.id, { x, y })}
              onSnapGuidesChange={handleSnapGuidesChange}
              onHover={(hovered) => onHoverLayer(hovered ? layer.id : null)}
            />
          ))}
        </div>
      </div>

      {/* Coordinates Display */}
      <div
        className="absolute bottom-2 right-2 px-2 py-1 font-mono text-xs flex gap-4"
        style={{
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'var(--muted)',
        }}
      >
        {cursorPos && (
          <span style={{ color: 'var(--accent)' }}>
            X:{cursorPos.naturalX} Y:{cursorPos.naturalY}
          </span>
        )}
        <span>{image.naturalWidth} × {image.naturalHeight}</span>
      </div>
    </div>
  );
}
