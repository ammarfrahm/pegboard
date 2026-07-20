import { useState } from 'react';
import { compressionPresets } from '../utils/presets';
import type { CompressionOptions } from '../types';

interface OptionsPanelProps {
  options: CompressionOptions;
  onOptionsChange: (options: CompressionOptions) => void;
  disabled?: boolean;
}

const fieldClass =
  'w-full border border-line bg-well px-3 py-2 font-mono text-sm text-ink transition-colors disabled:opacity-50';

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
    <div className="panel space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-accent" />
        <h2 className="tape-label">Options</h2>
      </div>

      {/* Presets */}
      <div className="space-y-2">
        <label className="tape-label block">Preset</label>
        <select
          onChange={(e) => handlePresetChange(e.target.value)}
          disabled={disabled}
          value={selectedPreset}
          className={fieldClass}
        >
          <option value="" disabled>
            Select a preset…
          </option>
          {compressionPresets.map((preset) => (
            <option key={preset.name} value={preset.name}>
              {preset.name}
            </option>
          ))}
        </select>
        {currentPreset && (
          <p className="text-xs text-subtle">{currentPreset.description}</p>
        )}
      </div>

      {/* Quality Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="tape-label">Quality</label>
          <span className="rounded-md bg-accent px-2 py-0.5 font-mono text-sm font-semibold text-accent-ink">
            {Math.round(options.quality * 100)}%
          </span>
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
          className="w-full"
        />
        <div className="flex justify-between text-xs text-subtle">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      {/* Max Dimensions */}
      <div className="space-y-2">
        <label className="tape-label block">Max dimensions (px)</label>
        <div className="flex items-center gap-2">
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
            className={`min-w-0 flex-1 ${fieldClass}`}
          />
          <span className="flex-shrink-0 text-lg text-subtle">×</span>
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
            className={`min-w-0 flex-1 ${fieldClass}`}
          />
        </div>
      </div>

      {/* Output Format */}
      <div className="space-y-2">
        <label className="tape-label block">Output format</label>
        <select
          value={options.outputFormat}
          onChange={(e) =>
            onOptionsChange({
              ...options,
              outputFormat: e.target.value as CompressionOptions['outputFormat'],
            })
          }
          disabled={disabled}
          className={fieldClass}
        >
          <option value="image/webp">WebP</option>
          <option value="image/jpeg">JPEG</option>
          <option value="image/png">PNG</option>
        </select>
      </div>

      {/* EXIF Toggle */}
      <div className="flex items-center justify-between border-t border-line pt-4">
        <label className="tape-label">Preserve EXIF</label>
        <button
          onClick={() =>
            onOptionsChange({ ...options, preserveExif: !options.preserveExif })
          }
          disabled={disabled}
          className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-50 ${
            options.preserveExif ? 'bg-accent' : 'bg-line'
          }`}
        >
          <span
            className={`absolute top-1 h-4 w-4 rounded-full bg-surface shadow-sm transition-all ${
              options.preserveExif ? 'left-[calc(100%-20px)]' : 'left-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
