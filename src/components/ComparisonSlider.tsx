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
        className="absolute top-0 bottom-0 z-10 w-0.5 bg-accent shadow-[0_0_4px_rgba(0,0,0,0.4)]"
        style={{
          left: `${sliderPosition}%`,
          transform: 'translateX(-50%)',
        }}
      >
        {/* Round grab handle */}
        <div
          className="absolute top-1/2 left-1/2 z-20 transition-transform"
          style={{
            transform: `translate(-50%, -50%) ${isDragging ? 'scale(1.1)' : 'scale(1)'}`,
          }}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent shadow-md">
            <svg className="h-4 w-4 text-accent-ink" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-3 3 3 3m8-6l3 3-3 3" />
            </svg>
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 z-10 rounded-md border border-line bg-surface px-2 py-1 text-xs font-medium">
        Before
      </div>
      <div className="absolute top-4 right-4 z-10 rounded-md bg-accent px-2 py-1 text-xs font-medium text-accent-ink">
        After
      </div>

      {/* Position indicator */}
      <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-md border border-line bg-surface px-2 py-1 font-mono text-xs text-subtle">
        {Math.round(sliderPosition)}%
      </div>
    </div>
  );
}
