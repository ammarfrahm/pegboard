import { useRef, useEffect, useCallback } from 'react';
import type { TextLayer } from '../../stores/overlayStore';

interface SnapGuides {
  horizontal: boolean;
  vertical: boolean;
}

interface TextOverlayElementProps {
  layer: TextLayer;
  isSelected: boolean;
  isHovered: boolean;
  containerWidth: number;
  containerHeight: number;
  imageNaturalWidth: number;
  onSelect: () => void;
  onPositionChange: (x: number, y: number) => void;
  onSnapGuidesChange?: (guides: SnapGuides) => void;
  onHover?: (hovered: boolean) => void;
}

const SNAP_THRESHOLD = 2; // percentage threshold for snapping

export function TextOverlayElement({
  layer,
  isSelected,
  isHovered,
  containerWidth,
  containerHeight,
  imageNaturalWidth,
  onSelect,
  onPositionChange,
  onSnapGuidesChange,
  onHover,
}: TextOverlayElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, layerX: 0, layerY: 0 });

  const applySnap = useCallback((x: number, y: number): { x: number; y: number; snapH: boolean; snapV: boolean } => {
    let snapH = false;
    let snapV = false;
    let snappedX = x;
    let snappedY = y;

    // Snap to horizontal center (50%)
    if (Math.abs(x - 50) < SNAP_THRESHOLD) {
      snappedX = 50;
      snapV = true;
    }

    // Snap to vertical center (50%)
    if (Math.abs(y - 50) < SNAP_THRESHOLD) {
      snappedY = 50;
      snapH = true;
    }

    return { x: snappedX, y: snappedY, snapH, snapV };
  }, []);

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

      let newX = Math.max(0, Math.min(100, dragStart.current.layerX + dxPercent));
      let newY = Math.max(0, Math.min(100, dragStart.current.layerY + dyPercent));

      // Apply snapping
      const snapped = applySnap(newX, newY);
      newX = snapped.x;
      newY = snapped.y;

      onSnapGuidesChange?.({ horizontal: snapped.snapH, vertical: snapped.snapV });
      onPositionChange(newX, newY);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      onSnapGuidesChange?.({ horizontal: false, vertical: false });
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [layer.x, layer.y, containerWidth, containerHeight, onSelect, onPositionChange, onSnapGuidesChange, applySnap]);

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

      let newX = Math.max(0, Math.min(100, dragStart.current.layerX + dxPercent));
      let newY = Math.max(0, Math.min(100, dragStart.current.layerY + dyPercent));

      // Apply snapping
      const snapped = applySnap(newX, newY);
      newX = snapped.x;
      newY = snapped.y;

      onSnapGuidesChange?.({ horizontal: snapped.snapH, vertical: snapped.snapV });
      onPositionChange(newX, newY);
    };

    const handleTouchEnd = () => {
      isDragging.current = false;
      onSnapGuidesChange?.({ horizontal: false, vertical: false });
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  }, [layer.x, layer.y, containerWidth, containerHeight, onSelect, onPositionChange, onSnapGuidesChange, applySnap]);

  // Calculate scale factor for preview (ratio of preview size to actual image size)
  const scale = imageNaturalWidth > 0 ? containerWidth / imageNaturalWidth : 1;

  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.style.setProperty('--scale', String(scale));
    }
  }, [scale]);

  const scaledFontSize = layer.fontSize * scale;

  const showHighlight = isSelected || isHovered;

  return (
    <div
      ref={elementRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className="absolute cursor-move select-none transition-all"
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
          ? `${layer.shadowOffsetX * scale}px ${layer.shadowOffsetY * scale}px ${layer.shadowBlur * scale}px ${layer.shadowColor}`
          : 'none',
        whiteSpace: 'pre-wrap',
        outline: showHighlight ? '2px dashed var(--accent)' : 'none',
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
