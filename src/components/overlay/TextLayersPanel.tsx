import { useState } from 'react';
import yaml from 'js-yaml';
import type { TextLayer } from '../../stores/overlayStore';
import { TextLayerControl } from './TextLayerControl';

interface TextLayersPanelProps {
  layers: TextLayer[];
  selectedLayer: TextLayer | null;
  selectedLayerId: string | null;
  hoveredLayerId: string | null;
  imageWidth: number;
  imageHeight: number;
  onSelectLayer: (id: string) => void;
  onHoverLayer: (id: string | null) => void;
  onAddLayer: () => void;
  onUpdateLayer: (id: string, updates: Partial<TextLayer>) => void;
  onRemoveLayer: (id: string) => void;
  onDuplicateLayer: (id: string) => void;
  onMoveLayerUp: (id: string) => void;
  onMoveLayerDown: (id: string) => void;
  onClearLayers: () => void;
  onImportYaml: (layers: TextLayer[]) => void;
}

export function TextLayersPanel({
  layers,
  selectedLayer,
  selectedLayerId,
  hoveredLayerId,
  imageWidth,
  imageHeight,
  onSelectLayer,
  onHoverLayer,
  onAddLayer,
  onUpdateLayer,
  onRemoveLayer,
  onDuplicateLayer,
  onMoveLayerUp,
  onMoveLayerDown,
  onClearLayers,
  onImportYaml,
}: TextLayersPanelProps) {
  const [activeTab, setActiveTab] = useState<'manual' | 'yaml'>('manual');
  const [yamlInput, setYamlInput] = useState('');
  const [yamlError, setYamlError] = useState<string | null>(null);

  const handleYamlImport = () => {
    try {
      const parsed = yaml.load(yamlInput) as unknown;
      if (!Array.isArray(parsed)) {
        throw new Error('YAML must be an array of text layers');
      }

      let idCounter = 0;
      const newLayers: TextLayer[] = parsed.map((item: Record<string, unknown>) => {
        // Support both old format (pos_x/pos_y in pixels) and new format (x/y in percentage)
        const hasPixelPos = item.pos_x !== undefined || item.pos_y !== undefined;

        let x: number, y: number;
        if (hasPixelPos) {
          // Convert pixel positions to percentages
          x = imageWidth > 0 ? (Number(item.pos_x) / imageWidth) * 100 : 50;
          y = imageHeight > 0 ? (Number(item.pos_y) / imageHeight) * 100 : 50;
        } else {
          x = Number(item.x) || 50;
          y = Number(item.y) || 50;
        }

        // Support both old format (size/font/font_weight) and new format (fontSize/fontFamily/fontWeight)
        const fontSize = Number(item.fontSize ?? item.size) || 48;
        const fontFamily = String(item.fontFamily ?? item.font ?? 'Inter');
        const fontWeight = Number(item.fontWeight ?? item.font_weight) || 400;

        return {
          id: `yaml-${Date.now()}-${++idCounter}`,
          text: String(item.text || 'Text'),
          x,
          y,
          fontSize,
          fontFamily,
          fontWeight,
          color: String(item.color || '#ffffff'),
          opacity: item.opacity !== undefined ? Number(item.opacity) : 1,
          rotation: Number(item.rotation) || 0,
          textAlign: (item.textAlign as 'left' | 'center' | 'right') || 'left',
          shadowEnabled: Boolean(item.shadowEnabled),
          shadowColor: String(item.shadowColor || '#000000'),
          shadowBlur: Number(item.shadowBlur) || 4,
          shadowOffsetX: Number(item.shadowOffsetX) || 2,
          shadowOffsetY: Number(item.shadowOffsetY) || 2,
        };
      });

      onImportYaml(newLayers);
      setYamlError(null);
      setActiveTab('manual');
    } catch (err) {
      setYamlError(err instanceof Error ? err.message : 'Invalid YAML');
    }
  };

  const handleExportYaml = () => {
    // Export in the original format with pixel positions for compatibility
    const exportData = layers.map((layer) => ({
      text: layer.text,
      pos_x: Math.round((layer.x / 100) * imageWidth),
      pos_y: Math.round((layer.y / 100) * imageHeight),
      size: layer.fontSize,
      font: layer.fontFamily,
      font_weight: layer.fontWeight,
      color: layer.color,
      ...(layer.opacity !== 1 && { opacity: layer.opacity }),
      ...(layer.rotation !== 0 && { rotation: layer.rotation }),
      ...(layer.textAlign !== 'left' && { textAlign: layer.textAlign }),
      ...(layer.shadowEnabled && {
        shadowEnabled: true,
        shadowColor: layer.shadowColor,
        shadowBlur: layer.shadowBlur,
        shadowOffsetX: layer.shadowOffsetX,
        shadowOffsetY: layer.shadowOffsetY,
      }),
    }));
    setYamlInput(yaml.dump(exportData));
  };

  return (
    <div className="panel overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-line">
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'manual' ? 'bg-accent text-accent-ink' : 'text-subtle hover:text-ink'
          }`}
        >
          Layers
        </button>
        <button
          onClick={() => {
            setActiveTab('yaml');
            if (layers.length > 0) handleExportYaml();
          }}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'yaml' ? 'bg-accent text-accent-ink' : 'text-subtle hover:text-ink'
          }`}
        >
          YAML
        </button>
      </div>

      {activeTab === 'manual' ? (
        <div className="p-4">
          {/* Layer List */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="tape-label">
                {layers.length} layer{layers.length !== 1 ? 's' : ''}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={onAddLayer}
                  className="rounded-md border border-line px-2 py-1 text-xs font-medium transition-colors hover:border-accent hover:text-accent"
                >
                  + Add
                </button>
                {layers.length > 0 && (
                  <button
                    onClick={onClearLayers}
                    className="rounded-md border border-line px-2 py-1 text-xs font-medium text-subtle transition-colors hover:border-bad hover:text-bad"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Layer Items */}
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {layers.map((layer, index) => {
                const isSelected = selectedLayerId === layer.id;
                const isHovered = hoveredLayerId === layer.id;
                const isHighlighted = isSelected || isHovered;

                return (
                <div
                  key={layer.id}
                  onClick={() => onSelectLayer(layer.id)}
                  onMouseEnter={() => onHoverLayer(layer.id)}
                  onMouseLeave={() => onHoverLayer(null)}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 transition-colors ${
                    isSelected
                      ? 'border-accent bg-accent text-accent-ink'
                      : isHighlighted
                        ? 'border-accent bg-accent/10'
                        : 'border-line'
                  }`}
                >
                  <span className="font-mono text-xs opacity-50">{index + 1}</span>
                  <span className="flex-1 truncate text-sm">
                    {layer.text.slice(0, 20)}{layer.text.length > 20 ? '…' : ''}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveLayerUp(layer.id);
                      }}
                      className="p-1 opacity-50 hover:opacity-100"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveLayerDown(layer.id);
                      }}
                      className="p-1 opacity-50 hover:opacity-100"
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateLayer(layer.id);
                      }}
                      className="p-1 opacity-50 hover:opacity-100"
                      title="Duplicate"
                    >
                      ⧉
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveLayer(layer.id);
                      }}
                      className="p-1 opacity-50 hover:opacity-100"
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
              })}
            </div>
          </div>

          {/* Selected Layer Controls */}
          {selectedLayer && (
            <div className="border-t border-line pt-4">
              <TextLayerControl
                layer={selectedLayer}
                onChange={(updates) => onUpdateLayer(selectedLayer.id, updates)}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="p-4">
          <p className="tape-label mb-2">Import / export YAML</p>
          <textarea
            value={yamlInput}
            onChange={(e) => {
              setYamlInput(e.target.value);
              setYamlError(null);
            }}
            className={`h-64 w-full resize-none border bg-well px-3 py-2 font-mono text-xs text-ink ${
              yamlError ? 'border-bad' : 'border-line'
            }`}
            placeholder={`- text: "Hello World"
  x: 50
  y: 50
  fontSize: 48
  fontFamily: Inter
  color: "#ffffff"`}
          />
          {yamlError && (
            <p className="mt-2 font-mono text-xs text-bad">{yamlError}</p>
          )}
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleYamlImport}
              className="btn-primary flex-1 px-4 py-2 text-sm"
            >
              Import
            </button>
            <button
              onClick={handleExportYaml}
              className="btn-secondary flex-1 px-4 py-2 text-sm"
            >
              Export
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
