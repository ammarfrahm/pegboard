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
    <div className="border-2 p-6 space-y-6" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2" style={{ backgroundColor: 'var(--accent)' }} />
        <h2 className="font-mono text-sm font-semibold tracking-wider uppercase" style={{ color: 'var(--muted)' }}>
          OPTIONS
        </h2>
      </div>

      {/* Presets */}
      <div className="space-y-2">
        <label className="font-mono text-xs tracking-wider uppercase block" style={{ color: 'var(--muted)' }}>
          PRESET
        </label>
        <select
          onChange={(e) => handlePresetChange(e.target.value)}
          disabled={disabled}
          value={selectedPreset}
          className="w-full px-3 py-2 border-2 font-mono text-sm disabled:opacity-50"
          style={{
            backgroundColor: 'var(--background)',
            borderColor: 'var(--border)',
            color: 'var(--foreground)',
          }}
        >
          <option value="" disabled>
            SELECT PRESET...
          </option>
          {compressionPresets.map((preset) => (
            <option key={preset.name} value={preset.name}>
              {preset.name.toUpperCase()}
            </option>
          ))}
        </select>
        {currentPreset && (
          <p className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
            {currentPreset.description}
          </p>
        )}
      </div>

      {/* Quality Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="font-mono text-xs tracking-wider uppercase" style={{ color: 'var(--muted)' }}>
            QUALITY
          </label>
          <span
            className="font-mono text-sm font-bold px-2 py-0.5"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
          >
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
        <div className="flex justify-between">
          <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>LOW</span>
          <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>HIGH</span>
        </div>
      </div>

      {/* Max Dimensions */}
      <div className="space-y-2">
        <label className="font-mono text-xs tracking-wider uppercase block" style={{ color: 'var(--muted)' }}>
          MAX DIMENSIONS (PX)
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="WIDTH"
            value={options.maxWidth || ''}
            onChange={(e) =>
              onOptionsChange({
                ...options,
                maxWidth: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            disabled={disabled}
            className="flex-1 min-w-0 w-full px-3 py-2 border-2 font-mono text-sm disabled:opacity-50"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            }}
          />
          <span className="font-mono text-lg flex-shrink-0" style={{ color: 'var(--muted)' }}>×</span>
          <input
            type="number"
            placeholder="HEIGHT"
            value={options.maxHeight || ''}
            onChange={(e) =>
              onOptionsChange({
                ...options,
                maxHeight: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            disabled={disabled}
            className="flex-1 min-w-0 w-full px-3 py-2 border-2 font-mono text-sm disabled:opacity-50"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            }}
          />
        </div>
      </div>

      {/* Output Format */}
      <div className="space-y-2">
        <label className="font-mono text-xs tracking-wider uppercase block" style={{ color: 'var(--muted)' }}>
          OUTPUT FORMAT
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
          className="w-full px-3 py-2 border-2 font-mono text-sm disabled:opacity-50"
          style={{
            backgroundColor: 'var(--background)',
            borderColor: 'var(--border)',
            color: 'var(--foreground)',
          }}
        >
          <option value="image/webp">WEBP</option>
          <option value="image/jpeg">JPEG</option>
          <option value="image/png">PNG</option>
        </select>
      </div>

      {/* EXIF Toggle */}
      <div className="flex items-center justify-between pt-2 border-t-2" style={{ borderColor: 'var(--border)' }}>
        <label className="font-mono text-xs tracking-wider uppercase" style={{ color: 'var(--muted)' }}>
          PRESERVE EXIF
        </label>
        <button
          onClick={() =>
            onOptionsChange({ ...options, preserveExif: !options.preserveExif })
          }
          disabled={disabled}
          className="relative w-12 h-6 transition-colors disabled:opacity-50"
          style={{
            backgroundColor: options.preserveExif ? 'var(--accent)' : 'var(--border)',
          }}
        >
          <span
            className="absolute top-1 w-4 h-4 transition-all"
            style={{
              backgroundColor: options.preserveExif ? 'var(--accent-foreground)' : 'var(--muted)',
              left: options.preserveExif ? 'calc(100% - 20px)' : '4px',
            }}
          />
        </button>
      </div>
    </div>
  );
}
