import { useRef, useEffect, useCallback } from 'react';
import type { TextLayer } from '../../hooks/useTextLayers';

interface TextOverlayElementProps {
  layer: TextLayer;
  isSelected: boolean;
  containerWidth: number;
  containerHeight: number;
  onSelect: () => void;
  onPositionChange: (x: number, y: number) => void;
}

export function TextOverlayElement({
  layer,
  isSelected,
  containerWidth,
  containerHeight,
  onSelect,
  onPositionChange,
}: TextOverlayElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, layerX: 0, layerY: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect();

    isDragging.current = true;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      layerX: layer.x,
      layerY: layer.y,
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;

      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;

      // Convert pixel delta to percentage
      const dxPercent = (dx / containerWidth) * 100;
      const dyPercent = (dy / containerHeight) * 100;

      const newX = Math.max(0, Math.min(100, dragStart.current.layerX + dxPercent));
      const newY = Math.max(0, Math.min(100, dragStart.current.layerY + dyPercent));

      onPositionChange(newX, newY);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [layer.x, layer.y, containerWidth, containerHeight, onSelect, onPositionChange]);

  // Touch support
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    onSelect();

    const touch = e.touches[0];
    isDragging.current = true;
    dragStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      layerX: layer.x,
      layerY: layer.y,
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();

      const touch = e.touches[0];
      const dx = touch.clientX - dragStart.current.x;
      const dy = touch.clientY - dragStart.current.y;

      const dxPercent = (dx / containerWidth) * 100;
      const dyPercent = (dy / containerHeight) * 100;

      const newX = Math.max(0, Math.min(100, dragStart.current.layerX + dxPercent));
      const newY = Math.max(0, Math.min(100, dragStart.current.layerY + dyPercent));

      onPositionChange(newX, newY);
    };

    const handleTouchEnd = () => {
      isDragging.current = false;
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  }, [layer.x, layer.y, containerWidth, containerHeight, onSelect, onPositionChange]);

  // Calculate scale factor for preview
  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.style.setProperty('--scale', String(containerWidth / 1000));
    }
  }, [containerWidth]);

  const scaledFontSize = layer.fontSize * (containerWidth / 1000);

  return (
    <div
      ref={elementRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className="absolute cursor-move select-none"
      style={{
        left: `${layer.x}%`,
        top: `${layer.y}%`,
        transform: `rotate(${layer.rotation}deg)`,
        transformOrigin: layer.textAlign === 'center' ? 'center top' : layer.textAlign === 'right' ? 'right top' : 'left top',
        fontFamily: layer.fontFamily,
        fontWeight: layer.fontWeight,
        fontSize: `${scaledFontSize}px`,
        color: layer.color,
        opacity: layer.opacity,
        textAlign: layer.textAlign,
        textShadow: layer.shadowEnabled
          ? `${layer.shadowOffsetX * (containerWidth / 1000)}px ${layer.shadowOffsetY * (containerWidth / 1000)}px ${layer.shadowBlur * (containerWidth / 1000)}px ${layer.shadowColor}`
          : 'none',
        whiteSpace: 'pre-wrap',
        outline: isSelected ? '2px dashed var(--accent)' : 'none',
        outlineOffset: '4px',
        padding: '4px',
      }}
    >
      {layer.text}
      {isSelected && (
        <div
          className="absolute -top-2 -left-2 w-3 h-3"
          style={{ backgroundColor: 'var(--accent)' }}
        />
      )}
    </div>
  );
}
