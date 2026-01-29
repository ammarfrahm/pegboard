import { useCallback } from 'react';
import type { TextLayer } from './useTextLayers';

interface ExportOptions {
  format: 'png' | 'jpeg';
  quality: number;
}

export function useCanvasExport() {
  const renderToCanvas = useCallback(
    async (
      image: HTMLImageElement,
      layers: TextLayer[],
      scale: number = 1
    ): Promise<HTMLCanvasElement> => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      // Draw the image
      ctx.drawImage(image, 0, 0);

      // Draw each text layer
      for (const layer of layers) {
        ctx.save();

        // Calculate actual position (percentage to pixels)
        const x = (layer.x / 100) * canvas.width;
        const y = (layer.y / 100) * canvas.height;

        // Scale font size relative to image size
        const fontSize = (layer.fontSize / scale) * (canvas.width / 1000);

        ctx.translate(x, y);
        ctx.rotate((layer.rotation * Math.PI) / 180);

        // Set font
        ctx.font = `${layer.fontWeight} ${fontSize}px "${layer.fontFamily}"`;
        ctx.textAlign = layer.textAlign;
        ctx.textBaseline = 'top';

        // Set opacity
        ctx.globalAlpha = layer.opacity;

        // Set shadow if enabled
        if (layer.shadowEnabled) {
          ctx.shadowColor = layer.shadowColor;
          ctx.shadowBlur = layer.shadowBlur * (canvas.width / 1000);
          ctx.shadowOffsetX = layer.shadowOffsetX * (canvas.width / 1000);
          ctx.shadowOffsetY = layer.shadowOffsetY * (canvas.width / 1000);
        }

        // Draw text
        ctx.fillStyle = layer.color;

        // Handle multiline text
        const lines = layer.text.split('\n');
        const lineHeight = fontSize * 1.2;
        lines.forEach((line, i) => {
          ctx.fillText(line, 0, i * lineHeight);
        });

        ctx.restore();
      }

      return canvas;
    },
    []
  );

  const exportImage = useCallback(
    async (
      image: HTMLImageElement,
      layers: TextLayer[],
      options: ExportOptions = { format: 'png', quality: 0.92 }
    ): Promise<Blob> => {
      const canvas = await renderToCanvas(image, layers);

      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          `image/${options.format}`,
          options.quality
        );
      });
    },
    [renderToCanvas]
  );

  const exportBase64 = useCallback(
    async (
      image: HTMLImageElement,
      layers: TextLayer[],
      options: ExportOptions = { format: 'png', quality: 0.92 }
    ): Promise<string> => {
      const canvas = await renderToCanvas(image, layers);
      return canvas.toDataURL(`image/${options.format}`, options.quality);
    },
    [renderToCanvas]
  );

  const downloadImage = useCallback(
    async (
      image: HTMLImageElement,
      layers: TextLayer[],
      filename: string,
      options?: ExportOptions
    ) => {
      const blob = await exportImage(image, layers, options);
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    },
    [exportImage]
  );

  const copyToClipboard = useCallback(
    async (image: HTMLImageElement, layers: TextLayer[]) => {
      const blob = await exportImage(image, layers, { format: 'png', quality: 1 });

      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
          }),
        ]);
        return true;
      } catch {
        console.error('Failed to copy to clipboard');
        return false;
      }
    },
    [exportImage]
  );

  const copyBase64ToClipboard = useCallback(
    async (
      image: HTMLImageElement,
      layers: TextLayer[],
      options?: ExportOptions
    ): Promise<boolean> => {
      try {
        const base64 = await exportBase64(image, layers, options);
        await navigator.clipboard.writeText(base64);
        return true;
      } catch {
        console.error('Failed to copy base64 to clipboard');
        return false;
      }
    },
    [exportBase64]
  );

  const generateShareLink = useCallback(
    async (
      image: HTMLImageElement,
      layers: TextLayer[],
      options: ExportOptions = { format: 'jpeg', quality: 0.7 }
    ): Promise<string | null> => {
      try {
        // For share links, we compress the image to keep URL shorter
        const base64 = await exportBase64(image, layers, options);

        // Create share URL with base64 in search params
        const shareUrl = `${window.location.origin}/overlay?img=${encodeURIComponent(base64)}`;

        // Check if URL is too long (most browsers support ~2000 chars in URL)
        if (shareUrl.length > 50000) {
          // If too long, just return the base64 directly
          return null;
        }

        return shareUrl;
      } catch {
        console.error('Failed to generate share link');
        return null;
      }
    },
    [exportBase64]
  );

  return {
    renderToCanvas,
    exportImage,
    exportBase64,
    downloadImage,
    copyToClipboard,
    copyBase64ToClipboard,
    generateShareLink,
  };
}
