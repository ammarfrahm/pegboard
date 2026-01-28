import { useState } from 'react';
import type { TextLayer } from '../../hooks/useTextLayers';
import { useCanvasExport } from '../../hooks/useCanvasExport';

interface ExportPanelProps {
  image: HTMLImageElement | null;
  layers: TextLayer[];
  originalFilename?: string;
}

export function ExportPanel({ image, layers, originalFilename }: ExportPanelProps) {
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [quality, setQuality] = useState(92);
  const [isCopying, setIsCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const { downloadImage, copyToClipboard } = useCanvasExport();

  const handleDownload = async () => {
    if (!image) return;

    const baseName = originalFilename
      ? originalFilename.replace(/\.[^.]+$/, '')
      : 'image';
    const filename = `${baseName}-overlay.${format}`;

    await downloadImage(image, layers, filename, { format, quality: quality / 100 });
  };

  const handleCopy = async () => {
    if (!image) return;

    setIsCopying(true);
    const success = await copyToClipboard(image, layers);
    setIsCopying(false);

    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const isDisabled = !image || layers.length === 0;

  return (
    <div
      className="border-2 p-4"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
    >
      <h3 className="font-display text-sm mb-4">EXPORT</h3>

      {/* Format Selection */}
      <div className="mb-4">
        <label className="block font-mono text-xs mb-2" style={{ color: 'var(--muted)' }}>
          FORMAT
        </label>
        <div className="flex gap-2">
          {(['png', 'jpeg'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className="flex-1 px-3 py-2 border-2 font-mono text-xs uppercase transition-colors"
              style={{
                borderColor: format === f ? 'var(--accent)' : 'var(--border)',
                backgroundColor: format === f ? 'var(--accent)' : 'transparent',
                color: format === f ? 'var(--accent-foreground)' : 'var(--foreground)',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Quality Slider (JPEG only) */}
      {format === 'jpeg' && (
        <div className="mb-4">
          <label className="block font-mono text-xs mb-2" style={{ color: 'var(--muted)' }}>
            QUALITY: {quality}%
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-full"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          disabled={isDisabled}
          className="flex-1 btn-primary px-4 py-2 text-sm"
        >
          DOWNLOAD
        </button>
        <button
          onClick={handleCopy}
          disabled={isDisabled || isCopying}
          className="flex-1 btn-secondary px-4 py-2 text-sm"
        >
          {isCopying ? 'COPYING...' : copySuccess ? 'COPIED!' : 'COPY'}
        </button>
      </div>

      {isDisabled && (
        <p className="font-mono text-xs mt-3 text-center" style={{ color: 'var(--muted)' }}>
          Add an image and text layers to export
        </p>
      )}
    </div>
  );
}
