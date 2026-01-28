import { Link } from '@tanstack/react-router';
import { Minimize2, Type } from 'lucide-react';

export function HomePage() {
  return (
    <div className="max-w-4xl mx-auto animate-fade-up">
      <div className="text-center mb-12">
        <h1 className="font-display text-3xl md:text-4xl tracking-tight mb-4">PEGBOARD</h1>
        <p className="text-lg" style={{ color: 'var(--muted)' }}>
          Image tools for the modern web
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image Compressor Card */}
        <Link
          to="/compress"
          className="group block border-2 p-6 transition-all"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--surface)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <Minimize2 className="w-6 h-6" style={{ color: 'var(--accent-foreground)' }} />
            </div>
            <div>
              <h2 className="font-display text-lg tracking-tight mb-2 group-hover:text-[var(--accent)] transition-colors">
                IMAGE COMPRESSOR
              </h2>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Reduce file sizes without sacrificing quality. Batch process multiple images with customizable compression settings.
              </p>
            </div>
          </div>
        </Link>

        {/* Text Overlay Card */}
        <Link
          to="/overlay"
          className="group block border-2 p-6 transition-all"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--surface)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <Type className="w-6 h-6" style={{ color: 'var(--accent-foreground)' }} />
            </div>
            <div>
              <h2 className="font-display text-lg tracking-tight mb-2 group-hover:text-[var(--accent)] transition-colors">
                TEXT OVERLAY
              </h2>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Add text overlays to images with drag-and-drop positioning. Customize fonts, colors, and export with precision.
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
