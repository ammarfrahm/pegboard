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
    <div className="panel p-4">
      <div className="mb-4 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-accent" />
        <h3 className="tape-label">Export</h3>
      </div>

      {/* Format Selection */}
      <div className="mb-4">
        <label className="tape-label mb-2 block">Format</label>
        <div className="flex gap-2">
          {(['png', 'jpeg'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold uppercase transition-colors ${
                format === f
                  ? 'border-accent bg-accent text-accent-ink'
                  : 'border-line text-subtle hover:border-accent hover:text-accent'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Quality Slider (JPEG only) */}
      {format === 'jpeg' && (
        <div className="mb-4">
          <label className="tape-label mb-2 block">Quality · {quality}%</label>
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
      <div className="mb-3 flex gap-2">
        <button
          onClick={handleDownload}
          disabled={isDisabled}
          className="btn-primary flex-1 px-4 py-2 text-sm"
        >
          Download
        </button>
        <button
          onClick={handleCopy}
          disabled={isDisabled || isCopying}
          className="btn-secondary flex-1 px-4 py-2 text-sm"
        >
          {isCopying ? 'Copying…' : copySuccess ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Secondary Actions - Base64 & Share */}
      <div className="flex gap-2">
        <button
          onClick={handleCopyBase64}
          disabled={isDisabled || isCopyingBase64}
          className={`btn-ghost flex-1 border border-line px-3 py-2 text-xs font-medium ${
            base64Success ? 'text-ok' : ''
          }`}
        >
          {isCopyingBase64 ? '…' : base64Success ? 'Copied' : 'Copy as Base64'}
        </button>
        <button
          onClick={handleGenerateShareLink}
          disabled={isDisabled || isGeneratingLink}
          className={`btn-ghost flex-1 border px-3 py-2 text-xs font-medium ${
            linkError ? 'border-bad text-bad' : linkSuccess ? 'border-line text-ok' : 'border-line'
          }`}
        >
          {isGeneratingLink ? '…' : linkSuccess ? 'Copied' : linkError ? 'Too large' : 'Share link'}
        </button>
      </div>

      {isDisabled && (
        <p className="mt-3 text-center text-xs text-subtle">
          Add an image and a text layer to export
        </p>
      )}
    </div>
  );
}
