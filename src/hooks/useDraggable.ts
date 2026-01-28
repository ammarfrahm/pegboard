import { useState, useCallback, useRef, useEffect } from 'react';

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  elementStartX: number;
  elementStartY: number;
}

interface UseDraggableOptions {
  onDragEnd?: (x: number, y: number) => void;
  bounds?: { minX: number; maxX: number; minY: number; maxY: number };
}

export function useDraggable(
  initialX: number,
  initialY: number,
  options: UseDraggableOptions = {}
) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const dragState = useRef<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    elementStartX: 0,
    elementStartY: 0,
  });

  // Sync position with props
  useEffect(() => {
    setPosition({ x: initialX, y: initialY });
  }, [initialX, initialY]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dragState.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      elementStartX: position.x,
      elementStartY: position.y,
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState.current.isDragging) return;

      const dx = e.clientX - dragState.current.startX;
      const dy = e.clientY - dragState.current.startY;

      let newX = dragState.current.elementStartX + dx;
      let newY = dragState.current.elementStartY + dy;

      if (options.bounds) {
        newX = Math.max(options.bounds.minX, Math.min(options.bounds.maxX, newX));
        newY = Math.max(options.bounds.minY, Math.min(options.bounds.maxY, newY));
      }

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (dragState.current.isDragging) {
        dragState.current.isDragging = false;
        options.onDragEnd?.(position.x, position.y);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [position.x, position.y, options]);

  return {
    position,
    setPosition,
    handleMouseDown,
    isDragging: dragState.current.isDragging,
  };
}
