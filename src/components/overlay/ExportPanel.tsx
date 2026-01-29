import { useState } from 'react';
import type { TextLayer } from '../../stores/overlayStore';
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
  const [isCopyingBase64, setIsCopyingBase64] = useState(false);
  const [base64Success, setBase64Success] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [linkSuccess, setLinkSuccess] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  const { downloadImage, copyToClipboard, copyBase64ToClipboard, generateShareLink } = useCanvasExport();

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

  const handleCopyBase64 = async () => {
    if (!image) return;

    setIsCopyingBase64(true);
    const success = await copyBase64ToClipboard(image, layers, { format, quality: quality / 100 });
    setIsCopyingBase64(false);

    if (success) {
      setBase64Success(true);
      setTimeout(() => setBase64Success(false), 2000);
    }
  };

  const handleGenerateShareLink = async () => {
    if (!image) return;

    setIsGeneratingLink(true);
    setLinkError(null);

    // Use lower quality JPEG for share links to keep size manageable
    const shareUrl = await generateShareLink(image, layers, { format: 'jpeg', quality: 0.6 });
    setIsGeneratingLink(false);

    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setLinkSuccess(true);
        setTimeout(() => setLinkSuccess(false), 2000);
      } catch {
        setLinkError('Failed to copy link');
      }
    } else {
      setLinkError('Image too large for share link');
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

      {/* Primary Action Buttons */}
      <div className="flex gap-2 mb-3">
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

      {/* Secondary Actions - Base64 & Share */}
      <div className="flex gap-2">
        <button
          onClick={handleCopyBase64}
          disabled={isDisabled || isCopyingBase64}
          className="flex-1 px-3 py-2 border-2 font-mono text-xs uppercase transition-colors"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'transparent',
            color: base64Success ? 'var(--success)' : 'var(--muted)',
          }}
          onMouseEnter={(e) => {
            if (!base64Success) e.currentTarget.style.color = 'var(--foreground)';
          }}
          onMouseLeave={(e) => {
            if (!base64Success) e.currentTarget.style.color = 'var(--muted)';
          }}
        >
          {isCopyingBase64 ? '...' : base64Success ? 'COPIED!' : 'BASE64'}
        </button>
        <button
          onClick={handleGenerateShareLink}
          disabled={isDisabled || isGeneratingLink}
          className="flex-1 px-3 py-2 border-2 font-mono text-xs uppercase transition-colors"
          style={{
            borderColor: linkError ? 'var(--danger)' : 'var(--border)',
            backgroundColor: 'transparent',
            color: linkSuccess ? 'var(--success)' : linkError ? 'var(--danger)' : 'var(--muted)',
          }}
          onMouseEnter={(e) => {
            if (!linkSuccess && !linkError) e.currentTarget.style.color = 'var(--foreground)';
          }}
          onMouseLeave={(e) => {
            if (!linkSuccess && !linkError) e.currentTarget.style.color = 'var(--muted)';
          }}
        >
          {isGeneratingLink ? '...' : linkSuccess ? 'COPIED!' : linkError ? 'TOO LARGE' : 'SHARE LINK'}
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
