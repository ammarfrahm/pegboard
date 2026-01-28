import { useState } from 'react';
import yaml from 'js-yaml';
import type { TextLayer } from '../../hooks/useTextLayers';
import { TextLayerControl } from './TextLayerControl';

interface TextLayersPanelProps {
  layers: TextLayer[];
  selectedLayer: TextLayer | null;
  selectedLayerId: string | null;
  onSelectLayer: (id: string) => void;
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
  onSelectLayer,
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
      const newLayers: TextLayer[] = parsed.map((item: Record<string, unknown>) => ({
        id: `yaml-${Date.now()}-${++idCounter}`,
        text: String(item.text || 'Text'),
        x: Number(item.x) || 50,
        y: Number(item.y) || 50,
        fontSize: Number(item.fontSize) || 48,
        fontFamily: String(item.fontFamily || 'Inter'),
        fontWeight: Number(item.fontWeight) || 400,
        color: String(item.color || '#ffffff'),
        opacity: Number(item.opacity) ?? 1,
        rotation: Number(item.rotation) || 0,
        textAlign: (item.textAlign as 'left' | 'center' | 'right') || 'left',
        shadowEnabled: Boolean(item.shadowEnabled),
        shadowColor: String(item.shadowColor || '#000000'),
        shadowBlur: Number(item.shadowBlur) || 4,
        shadowOffsetX: Number(item.shadowOffsetX) || 2,
        shadowOffsetY: Number(item.shadowOffsetY) || 2,
      }));

      onImportYaml(newLayers);
      setYamlError(null);
      setActiveTab('manual');
    } catch (err) {
      setYamlError(err instanceof Error ? err.message : 'Invalid YAML');
    }
  };

  const handleExportYaml = () => {
    const exportData = layers.map((layer) => ({
      text: layer.text,
      x: layer.x,
      y: layer.y,
      fontSize: layer.fontSize,
      fontFamily: layer.fontFamily,
      fontWeight: layer.fontWeight,
      color: layer.color,
      opacity: layer.opacity,
      rotation: layer.rotation,
      textAlign: layer.textAlign,
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
    <div
      className="border-2 overflow-hidden"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
    >
      {/* Tabs */}
      <div className="flex border-b-2" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => setActiveTab('manual')}
          className="flex-1 px-4 py-2 font-mono text-sm transition-colors"
          style={{
            backgroundColor: activeTab === 'manual' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'manual' ? 'var(--accent-foreground)' : 'var(--muted)',
          }}
        >
          LAYERS
        </button>
        <button
          onClick={() => {
            setActiveTab('yaml');
            if (layers.length > 0) handleExportYaml();
          }}
          className="flex-1 px-4 py-2 font-mono text-sm transition-colors"
          style={{
            backgroundColor: activeTab === 'yaml' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'yaml' ? 'var(--accent-foreground)' : 'var(--muted)',
          }}
        >
          YAML
        </button>
      </div>

      {activeTab === 'manual' ? (
        <div className="p-4">
          {/* Layer List */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
                {layers.length} LAYER{layers.length !== 1 ? 'S' : ''}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={onAddLayer}
                  className="px-2 py-1 border-2 font-mono text-xs transition-colors"
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.color = 'var(--accent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--foreground)';
                  }}
                >
                  + ADD
                </button>
                {layers.length > 0 && (
                  <button
                    onClick={onClearLayers}
                    className="px-2 py-1 border-2 font-mono text-xs transition-colors"
                    style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--danger)';
                      e.currentTarget.style.color = 'var(--danger)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.color = 'var(--muted)';
                    }}
                  >
                    CLEAR
                  </button>
                )}
              </div>
            </div>

            {/* Layer Items */}
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {layers.map((layer, index) => (
                <div
                  key={layer.id}
                  onClick={() => onSelectLayer(layer.id)}
                  className="flex items-center gap-2 p-2 border-2 cursor-pointer transition-colors"
                  style={{
                    borderColor: selectedLayerId === layer.id ? 'var(--accent)' : 'var(--border)',
                    backgroundColor: selectedLayerId === layer.id ? 'var(--accent)' : 'transparent',
                    color: selectedLayerId === layer.id ? 'var(--accent-foreground)' : 'var(--foreground)',
                  }}
                >
                  <span className="font-mono text-xs opacity-50">{index + 1}</span>
                  <span className="flex-1 font-mono text-sm truncate">
                    {layer.text.slice(0, 20)}{layer.text.length > 20 ? '...' : ''}
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
              ))}
            </div>
          </div>

          {/* Selected Layer Controls */}
          {selectedLayer && (
            <div className="border-t-2 pt-4" style={{ borderColor: 'var(--border)' }}>
              <TextLayerControl
                layer={selectedLayer}
                onChange={(updates) => onUpdateLayer(selectedLayer.id, updates)}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="p-4">
          <p className="font-mono text-xs mb-2" style={{ color: 'var(--muted)' }}>
            IMPORT/EXPORT YAML
          </p>
          <textarea
            value={yamlInput}
            onChange={(e) => {
              setYamlInput(e.target.value);
              setYamlError(null);
            }}
            className="w-full h-64 px-3 py-2 border-2 font-mono text-xs resize-none"
            style={{
              borderColor: yamlError ? 'var(--danger)' : 'var(--border)',
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)',
            }}
            placeholder={`- text: "Hello World"
  x: 50
  y: 50
  fontSize: 48
  fontFamily: Inter
  color: "#ffffff"`}
          />
          {yamlError && (
            <p className="font-mono text-xs mt-2" style={{ color: 'var(--danger)' }}>
              {yamlError}
            </p>
          )}
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleYamlImport}
              className="flex-1 btn-primary px-4 py-2 text-sm"
            >
              IMPORT
            </button>
            <button
              onClick={handleExportYaml}
              className="flex-1 btn-secondary px-4 py-2 text-sm"
            >
              EXPORT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
