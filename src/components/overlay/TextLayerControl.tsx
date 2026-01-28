import type { TextLayer } from '../../hooks/useTextLayers';

interface TextLayerControlProps {
  layer: TextLayer;
  onChange: (updates: Partial<TextLayer>) => void;
}

const FONT_FAMILIES = [
  'Inter',
  'JetBrains Mono',
  'Arial',
  'Georgia',
  'Times New Roman',
  'Courier New',
  'Verdana',
  'Impact',
];

const FONT_WEIGHTS = [
  { value: 100, label: 'Thin' },
  { value: 300, label: 'Light' },
  { value: 400, label: 'Regular' },
  { value: 500, label: 'Medium' },
  { value: 600, label: 'Semibold' },
  { value: 700, label: 'Bold' },
  { value: 900, label: 'Black' },
];

export function TextLayerControl({ layer, onChange }: TextLayerControlProps) {
  return (
    <div className="space-y-4">
      {/* Text Input */}
      <div>
        <label className="block font-mono text-xs mb-2" style={{ color: 'var(--muted)' }}>
          TEXT
        </label>
        <textarea
          value={layer.text}
          onChange={(e) => onChange({ text: e.target.value })}
          className="w-full px-3 py-2 border-2 font-mono text-sm resize-none"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--surface)',
            color: 'var(--foreground)',
          }}
          rows={2}
        />
      </div>

      {/* Font Settings */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-mono text-xs mb-2" style={{ color: 'var(--muted)' }}>
            FONT
          </label>
          <select
            value={layer.fontFamily}
            onChange={(e) => onChange({ fontFamily: e.target.value })}
            className="w-full px-3 py-2 border-2 text-sm"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--surface)',
              color: 'var(--foreground)',
            }}
          >
            {FONT_FAMILIES.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-mono text-xs mb-2" style={{ color: 'var(--muted)' }}>
            WEIGHT
          </label>
          <select
            value={layer.fontWeight}
            onChange={(e) => onChange({ fontWeight: Number(e.target.value) })}
            className="w-full px-3 py-2 border-2 text-sm"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--surface)',
              color: 'var(--foreground)',
            }}
          >
            {FONT_WEIGHTS.map((weight) => (
              <option key={weight.value} value={weight.value}>
                {weight.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Size and Color */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-mono text-xs mb-2" style={{ color: 'var(--muted)' }}>
            SIZE: {layer.fontSize}px
          </label>
          <input
            type="range"
            min="12"
            max="200"
            value={layer.fontSize}
            onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
            className="w-full"
          />
        </div>

        <div>
          <label className="block font-mono text-xs mb-2" style={{ color: 'var(--muted)' }}>
            COLOR
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={layer.color}
              onChange={(e) => onChange({ color: e.target.value })}
              className="w-10 h-10 border-2 cursor-pointer"
              style={{ borderColor: 'var(--border)' }}
            />
            <input
              type="text"
              value={layer.color}
              onChange={(e) => onChange({ color: e.target.value })}
              className="flex-1 px-2 py-1 border-2 font-mono text-sm"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--surface)',
                color: 'var(--foreground)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Position */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-mono text-xs mb-2" style={{ color: 'var(--muted)' }}>
            X: {layer.x.toFixed(1)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={layer.x}
            onChange={(e) => onChange({ x: Number(e.target.value) })}
            className="w-full"
          />
        </div>

        <div>
          <label className="block font-mono text-xs mb-2" style={{ color: 'var(--muted)' }}>
            Y: {layer.y.toFixed(1)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={layer.y}
            onChange={(e) => onChange({ y: Number(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      {/* Rotation and Opacity */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-mono text-xs mb-2" style={{ color: 'var(--muted)' }}>
            ROTATION: {layer.rotation}°
          </label>
          <input
            type="range"
            min="-180"
            max="180"
            value={layer.rotation}
            onChange={(e) => onChange({ rotation: Number(e.target.value) })}
            className="w-full"
          />
        </div>

        <div>
          <label className="block font-mono text-xs mb-2" style={{ color: 'var(--muted)' }}>
            OPACITY: {Math.round(layer.opacity * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={layer.opacity}
            onChange={(e) => onChange({ opacity: Number(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      {/* Text Align */}
      <div>
        <label className="block font-mono text-xs mb-2" style={{ color: 'var(--muted)' }}>
          ALIGNMENT
        </label>
        <div className="flex gap-2">
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              onClick={() => onChange({ textAlign: align })}
              className="flex-1 px-3 py-2 border-2 font-mono text-xs uppercase transition-colors"
              style={{
                borderColor: layer.textAlign === align ? 'var(--accent)' : 'var(--border)',
                backgroundColor: layer.textAlign === align ? 'var(--accent)' : 'transparent',
                color: layer.textAlign === align ? 'var(--accent-foreground)' : 'var(--foreground)',
              }}
            >
              {align}
            </button>
          ))}
        </div>
      </div>

      {/* Shadow Settings */}
      <div className="border-t-2 pt-4" style={{ borderColor: 'var(--border)' }}>
        <label className="flex items-center gap-2 cursor-pointer mb-3">
          <input
            type="checkbox"
            checked={layer.shadowEnabled}
            onChange={(e) => onChange({ shadowEnabled: e.target.checked })}
            className="w-4 h-4"
          />
          <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
            TEXT SHADOW
          </span>
        </label>

        {layer.shadowEnabled && (
          <div className="space-y-3 pl-6">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-xs mb-1" style={{ color: 'var(--muted)' }}>
                  COLOR
                </label>
                <input
                  type="color"
                  value={layer.shadowColor}
                  onChange={(e) => onChange({ shadowColor: e.target.value })}
                  className="w-full h-8 border-2 cursor-pointer"
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>
              <div>
                <label className="block font-mono text-xs mb-1" style={{ color: 'var(--muted)' }}>
                  BLUR: {layer.shadowBlur}
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={layer.shadowBlur}
                  onChange={(e) => onChange({ shadowBlur: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-xs mb-1" style={{ color: 'var(--muted)' }}>
                  OFFSET X: {layer.shadowOffsetX}
                </label>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  value={layer.shadowOffsetX}
                  onChange={(e) => onChange({ shadowOffsetX: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block font-mono text-xs mb-1" style={{ color: 'var(--muted)' }}>
                  OFFSET Y: {layer.shadowOffsetY}
                </label>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  value={layer.shadowOffsetY}
                  onChange={(e) => onChange({ shadowOffsetY: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
