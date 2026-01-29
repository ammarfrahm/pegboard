import { create } from 'zustand';

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

interface OverlayState {
  // Image state
  image: HTMLImageElement | null;
  filename: string | undefined;

  // Layer state
  layers: TextLayer[];
  selectedLayerId: string | null;
  hoveredLayerId: string | null;

  // Image actions
  setImage: (image: HTMLImageElement | null, filename?: string) => void;
  clearImage: () => void;

  // Layer actions
  addLayer: (partial?: Partial<TextLayer>) => TextLayer;
  updateLayer: (id: string, updates: Partial<TextLayer>) => void;
  removeLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
  clearLayers: () => void;
  setLayersFromYaml: (layers: TextLayer[]) => void;

  // Selection actions
  setSelectedLayerId: (id: string | null) => void;
  setHoveredLayerId: (id: string | null) => void;

  // Computed
  selectedLayer: () => TextLayer | null;
}

export const useOverlayStore = create<OverlayState>((set, get) => ({
  // Initial state
  image: null,
  filename: undefined,
  layers: [],
  selectedLayerId: null,
  hoveredLayerId: null,

  // Image actions
  setImage: (image, filename) => set({ image, filename }),

  clearImage: () => {
    const { image } = get();
    if (image) {
      URL.revokeObjectURL(image.src);
    }
    set({
      image: null,
      filename: undefined,
      layers: [],
      selectedLayerId: null,
      hoveredLayerId: null,
    });
  },

  // Layer actions
  addLayer: (partial) => {
    const newLayer: TextLayer = {
      ...defaultLayer,
      ...partial,
      id: generateLayerId(),
    };
    set((state) => ({
      layers: [...state.layers, newLayer],
      selectedLayerId: newLayer.id,
    }));
    return newLayer;
  },

  updateLayer: (id, updates) => set((state) => ({
    layers: state.layers.map((layer) =>
      layer.id === id ? { ...layer, ...updates } : layer
    ),
  })),

  removeLayer: (id) => set((state) => ({
    layers: state.layers.filter((layer) => layer.id !== id),
    selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId,
  })),

  duplicateLayer: (id) => {
    const { layers } = get();
    const layer = layers.find((l) => l.id === id);
    if (layer) {
      const newLayer: TextLayer = {
        ...layer,
        id: generateLayerId(),
        x: Math.min(layer.x + 5, 100),
        y: Math.min(layer.y + 5, 100),
      };
      set((state) => ({
        layers: [...state.layers, newLayer],
        selectedLayerId: newLayer.id,
      }));
    }
  },

  moveLayerUp: (id) => set((state) => {
    const index = state.layers.findIndex((l) => l.id === id);
    if (index < state.layers.length - 1) {
      const newLayers = [...state.layers];
      [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
      return { layers: newLayers };
    }
    return state;
  }),

  moveLayerDown: (id) => set((state) => {
    const index = state.layers.findIndex((l) => l.id === id);
    if (index > 0) {
      const newLayers = [...state.layers];
      [newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]];
      return { layers: newLayers };
    }
    return state;
  }),

  clearLayers: () => set({
    layers: [],
    selectedLayerId: null,
  }),

  setLayersFromYaml: (layers) => set({
    layers,
    selectedLayerId: layers[0]?.id || null,
  }),

  // Selection actions
  setSelectedLayerId: (id) => set({ selectedLayerId: id }),
  setHoveredLayerId: (id) => set({ hoveredLayerId: id }),

  // Computed
  selectedLayer: () => {
    const { layers, selectedLayerId } = get();
    return layers.find((l) => l.id === selectedLayerId) || null;
  },
}));
