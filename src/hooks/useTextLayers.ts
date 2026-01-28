import { useState, useCallback } from 'react';

export interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  color: string;
  opacity: number;
  rotation: number;
  textAlign: 'left' | 'center' | 'right';
  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
}

const defaultLayer: Omit<TextLayer, 'id'> = {
  text: 'New Text',
  x: 50,
  y: 50,
  fontSize: 48,
  fontFamily: 'Inter',
  fontWeight: 400,
  color: '#ffffff',
  opacity: 1,
  rotation: 0,
  textAlign: 'left',
  shadowEnabled: false,
  shadowColor: '#000000',
  shadowBlur: 4,
  shadowOffsetX: 2,
  shadowOffsetY: 2,
};

let layerIdCounter = 0;

function generateLayerId(): string {
  return `layer-${Date.now()}-${++layerIdCounter}`;
}

export function useTextLayers() {
  const [layers, setLayers] = useState<TextLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  const addLayer = useCallback((partial?: Partial<TextLayer>): TextLayer => {
    const newLayer: TextLayer = {
      ...defaultLayer,
      ...partial,
      id: generateLayerId(),
    };
    setLayers(prev => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
    return newLayer;
  }, []);

  const updateLayer = useCallback((id: string, updates: Partial<TextLayer>) => {
    setLayers(prev =>
      prev.map(layer =>
        layer.id === id ? { ...layer, ...updates } : layer
      )
    );
  }, []);

  const removeLayer = useCallback((id: string) => {
    setLayers(prev => prev.filter(layer => layer.id !== id));
    setSelectedLayerId(current => (current === id ? null : current));
  }, []);

  const duplicateLayer = useCallback((id: string) => {
    const layer = layers.find(l => l.id === id);
    if (layer) {
      const newLayer: TextLayer = {
        ...layer,
        id: generateLayerId(),
        x: layer.x + 20,
        y: layer.y + 20,
      };
      setLayers(prev => [...prev, newLayer]);
      setSelectedLayerId(newLayer.id);
    }
  }, [layers]);

  const moveLayerUp = useCallback((id: string) => {
    setLayers(prev => {
      const index = prev.findIndex(l => l.id === id);
      if (index < prev.length - 1) {
        const newLayers = [...prev];
        [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
        return newLayers;
      }
      return prev;
    });
  }, []);

  const moveLayerDown = useCallback((id: string) => {
    setLayers(prev => {
      const index = prev.findIndex(l => l.id === id);
      if (index > 0) {
        const newLayers = [...prev];
        [newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]];
        return newLayers;
      }
      return prev;
    });
  }, []);

  const clearLayers = useCallback(() => {
    setLayers([]);
    setSelectedLayerId(null);
  }, []);

  const setLayersFromYaml = useCallback((newLayers: TextLayer[]) => {
    setLayers(newLayers);
    setSelectedLayerId(newLayers[0]?.id || null);
  }, []);

  const selectedLayer = layers.find(l => l.id === selectedLayerId) || null;

  return {
    layers,
    selectedLayer,
    selectedLayerId,
    setSelectedLayerId,
    addLayer,
    updateLayer,
    removeLayer,
    duplicateLayer,
    moveLayerUp,
    moveLayerDown,
    clearLayers,
    setLayersFromYaml,
  };
}
