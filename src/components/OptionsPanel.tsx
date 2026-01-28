import { useState } from 'react';
import { compressionPresets } from '../utils/presets';
import type { CompressionOptions } from '../types';

interface OptionsPanelProps {
  options: CompressionOptions;
  onOptionsChange: (options: CompressionOptions) => void;
  disabled?: boolean;
}

export function OptionsPanel({
  options,
  onOptionsChange,
  disabled = false,
}: OptionsPanelProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  const handlePresetChange = (presetName: string) => {
    setSelectedPreset(presetName);
    const preset = compressionPresets.find((p) => p.name === presetName);
    if (preset) {
      onOptionsChange({
        ...options,
        ...preset.options,
      });
    }
  };

  const currentPreset = compressionPresets.find((p) => p.name === selectedPreset);

  return (
    <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6 space-y-6">
      <h2 className="font-semibold text-lg">Compression Options</h2>

      {/* Presets */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
          Presets
        </label>
        <select
          onChange={(e) => handlePresetChange(e.target.value)}
          disabled={disabled}
          value={selectedPreset}
          className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] disabled:opacity-50"
        >
          <option value="" disabled>
            Select a preset...
          </option>
          {compressionPresets.map((preset) => (
            <option key={preset.name} value={preset.name}>
              {preset.name}
            </option>
          ))}
        </select>
        {currentPreset && (
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            {currentPreset.description}
          </p>
        )}
      </div>

      {/* Quality Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
            Quality
          </label>
          <span className="text-sm font-mono">{Math.round(options.quality * 100)}%</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.05"
          value={options.quality}
          onChange={(e) =>
            onOptionsChange({ ...options, quality: parseFloat(e.target.value) })
          }
          disabled={disabled}
          className="w-full accent-[hsl(var(--primary))]"
        />
      </div>

      {/* Max Dimensions */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
          Max Dimensions (px)
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Width"
            value={options.maxWidth || ''}
            onChange={(e) =>
              onOptionsChange({
                ...options,
                maxWidth: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            disabled={disabled}
            className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] disabled:opacity-50"
          />
          <span className="flex-shrink-0 text-[hsl(var(--muted-foreground))]">×</span>
          <input
            type="number"
            placeholder="Height"
            value={options.maxHeight || ''}
            onChange={(e) =>
              onOptionsChange({
                ...options,
                maxHeight: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            disabled={disabled}
            className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] disabled:opacity-50"
          />
        </div>
      </div>

      {/* Output Format */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
          Output Format
        </label>
        <select
          value={options.outputFormat}
          onChange={(e) =>
            onOptionsChange({
              ...options,
              outputFormat: e.target.value as CompressionOptions['outputFormat'],
            })
          }
          disabled={disabled}
          className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] disabled:opacity-50"
        >
          <option value="image/webp">WebP</option>
          <option value="image/jpeg">JPEG</option>
          <option value="image/png">PNG</option>
        </select>
      </div>

      {/* EXIF Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
          Preserve EXIF Metadata
        </label>
        <button
          onClick={() =>
            onOptionsChange({ ...options, preserveExif: !options.preserveExif })
          }
          disabled={disabled}
          className={`
            relative w-11 h-6 rounded-full transition-colors disabled:opacity-50
            ${options.preserveExif ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--muted))]'}
          `}
        >
          <span
            className={`
              absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform
              ${options.preserveExif ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </button>
      </div>
    </div>
  );
}
