import { useState, useCallback, useRef, useEffect } from 'react';

interface ComparisonSliderProps {
  beforeUrl: string;
  afterUrl: string;
}

export function ComparisonSlider({ beforeUrl, afterUrl }: ComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updatePosition(e.clientX);
  }, [updatePosition]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    updatePosition(e.touches[0].clientX);
  }, [updatePosition]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      updatePosition(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      updatePosition(e.touches[0].clientX);
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, updatePosition]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden cursor-ew-resize select-none"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* After Image (full, bottom layer) */}
      <img
        src={afterUrl}
        alt="After compression"
        className="absolute inset-0 w-full h-full object-contain"
        draggable={false}
      />

      {/* Before Image (clipped using clip-path) */}
      <img
        src={beforeUrl}
        alt="Before compression"
        className="absolute inset-0 w-full h-full object-contain"
        style={{
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
        }}
        draggable={false}
      />

      {/* Slider Line */}
      <div
        className="absolute top-0 bottom-0 z-10"
        style={{
          left: `${sliderPosition}%`,
          transform: 'translateX(-50%)',
          width: '3px',
          backgroundColor: 'var(--accent)',
          boxShadow: '0 0 4px rgba(0,0,0,0.5)',
        }}
      >
        {/* Measurement marks along the line */}
        {Array.from({ length: 11 }).map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              top: `${i * 10}%`,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '12px',
              height: '2px',
              backgroundColor: 'var(--accent)',
            }}
          />
        ))}

        {/* Diamond Handle */}
        <div
          className="absolute top-1/2 left-1/2 z-20"
          style={{
            transform: `translate(-50%, -50%) rotate(45deg) ${isDragging ? 'scale(1.1)' : 'scale(1)'}`,
            transition: 'transform 0.15s ease',
          }}
        >
          <div
            className="w-8 h-8 flex items-center justify-center"
            style={{
              backgroundColor: 'var(--accent)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            <div
              className="w-3 h-3"
              style={{
                transform: 'rotate(-45deg)',
                backgroundColor: 'var(--accent-foreground)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Labels */}
      <div
        className="absolute top-4 left-4 px-2 py-1 font-mono text-xs tracking-wider uppercase z-10"
        style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', border: '2px solid var(--border)' }}
      >
        BEFORE
      </div>
      <div
        className="absolute top-4 right-4 px-2 py-1 font-mono text-xs tracking-wider uppercase z-10"
        style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
      >
        AFTER
      </div>

      {/* Position indicator */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 px-2 py-1 font-mono text-xs z-10"
        style={{ backgroundColor: 'var(--background)', color: 'var(--muted)', border: '2px solid var(--border)' }}
      >
        {Math.round(sliderPosition)}%
      </div>
    </div>
  );
}
