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
      {/* After Image (full) */}
      <img
        src={afterUrl}
        alt="After compression"
        className="absolute inset-0 w-full h-full object-contain"
        draggable={false}
      />

      {/* Before Image (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={beforeUrl}
          alt="Before compression"
          className="absolute inset-0 w-full h-full object-contain"
          style={{ width: `${containerRef.current?.offsetWidth || 0}px` }}
          draggable={false}
        />
      </div>

      {/* Slider Line with measurement marks */}
      <div
        className="absolute top-0 bottom-0 w-0.5"
        style={{
          left: `${sliderPosition}%`,
          transform: 'translateX(-50%)',
          backgroundColor: 'var(--accent)',
        }}
      >
        {/* Measurement marks along the line */}
        {Array.from({ length: 11 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-px"
            style={{
              top: `${i * 10}%`,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'var(--accent)',
            }}
          />
        ))}

        {/* Diamond/Square Handle with crosshair */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform"
          style={{
            transform: `translate(-50%, -50%) rotate(45deg) ${isDragging ? 'scale(1.1)' : 'scale(1)'}`,
          }}
        >
          <div
            className="w-8 h-8 flex items-center justify-center"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <div
              className="w-4 h-4"
              style={{
                transform: 'rotate(-45deg)',
                backgroundColor: 'var(--accent-foreground)',
              }}
            >
              {/* Crosshair */}
              <div
                className="absolute top-1/2 left-0 right-0 h-px"
                style={{ backgroundColor: 'var(--accent)' }}
              />
              <div
                className="absolute left-1/2 top-0 bottom-0 w-px"
                style={{ backgroundColor: 'var(--accent)' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Labels */}
      <div
        className="absolute top-4 left-4 px-2 py-1 font-mono text-xs tracking-wider uppercase"
        style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
      >
        BEFORE
      </div>
      <div
        className="absolute top-4 right-4 px-2 py-1 font-mono text-xs tracking-wider uppercase"
        style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
      >
        AFTER
      </div>

      {/* Position indicator */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 px-2 py-1 font-mono text-xs"
        style={{ backgroundColor: 'var(--background)', color: 'var(--muted)', border: '1px solid var(--border)' }}
      >
        {Math.round(sliderPosition)}%
      </div>
    </div>
  );
}
