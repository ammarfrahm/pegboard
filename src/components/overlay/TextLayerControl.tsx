import type { TextLayer } from '../../stores/overlayStore';

interface TextLayerControlProps {
  layer: TextLayer;
  onChange: (updates: Partial<TextLayer>) => void;
}

const FONT_FAMILIES = [
  'Inter',
  'Roboto',
  'JetBrains Mono',
  'OCR A Std',
  'Playfair Display',
  'Lobster',
  'Pacifico',
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

const fieldClass = 'w-full border border-line bg-well px-3 py-2 text-sm text-ink';

export function TextLayerControl({ layer, onChange }: TextLayerControlProps) {
  return (
    <div className="space-y-4">
      {/* Text Input */}
      <div>
        <label className="tape-label mb-2 block">Text</label>
        <textarea
          value={layer.text}
          onChange={(e) => onChange({ text: e.target.value })}
          className={`${fieldClass} resize-none font-mono`}
          rows={2}
        />
      </div>

      {/* Font Settings */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="tape-label mb-2 block">Font</label>
          <select
            value={layer.fontFamily}
            onChange={(e) => onChange({ fontFamily: e.target.value })}
            className={fieldClass}
          >
            {FONT_FAMILIES.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="tape-label mb-2 block">Weight</label>
          <select
            value={layer.fontWeight}
            onChange={(e) => onChange({ fontWeight: Number(e.target.value) })}
            className={fieldClass}
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
          <label className="tape-label mb-2 block">Size · {layer.fontSize}px</label>
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
          <label className="tape-label mb-2 block">Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={layer.color}
              onChange={(e) => onChange({ color: e.target.value })}
              className="h-8 w-8 shrink-0 cursor-pointer rounded-lg border border-line p-0"
            />
            <input
              type="text"
              value={layer.color}
              onChange={(e) => onChange({ color: e.target.value })}
              className="w-full min-w-0 border border-line bg-well px-2 py-1 font-mono text-xs text-ink"
              maxLength={7}
            />
          </div>
        </div>
      </div>

      {/* Position */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="tape-label mb-2 block">X · {layer.x.toFixed(1)}%</label>
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
          <label className="tape-label mb-2 block">Y · {layer.y.toFixed(1)}%</label>
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
          <label className="tape-label mb-2 block">Rotation · {layer.rotation}°</label>
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
          <label className="tape-label mb-2 block">Opacity · {Math.round(layer.opacity * 100)}%</label>
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
        <label className="tape-label mb-2 block">Alignment</label>
        <div className="flex gap-2">
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              onClick={() => onChange({ textAlign: align })}
              className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium capitalize transition-colors ${
                layer.textAlign === align
                  ? 'border-accent bg-accent text-accent-ink'
                  : 'border-line text-subtle hover:border-accent hover:text-accent'
              }`}
            >
              {align}
            </button>
          ))}
        </div>
      </div>

      {/* Shadow Settings */}
      <div className="border-t border-line pt-4">
        <label className="mb-3 flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={layer.shadowEnabled}
            onChange={(e) => onChange({ shadowEnabled: e.target.checked })}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          <span className="tape-label">Text shadow</span>
        </label>

        {layer.shadowEnabled && (
          <div className="space-y-3 pl-6">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="tape-label mb-1 block">Color</label>
                <input
                  type="color"
                  value={layer.shadowColor}
                  onChange={(e) => onChange({ shadowColor: e.target.value })}
                  className="h-8 w-full cursor-pointer rounded-lg border border-line"
                />
              </div>
              <div>
                <label className="tape-label mb-1 block">Blur · {layer.shadowBlur}</label>
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
                <label className="tape-label mb-1 block">Offset X · {layer.shadowOffsetX}</label>
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
                <label className="tape-label mb-1 block">Offset Y · {layer.shadowOffsetY}</label>
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
