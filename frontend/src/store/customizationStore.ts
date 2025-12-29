import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type PaintFinish = 'matte' | 'glossy' | 'metallic' | 'pearl';
export type WheelSize = 17 | 18 | 19 | 20 | 21 | 22;
export type WheelFinish = 'chrome' | 'matte_black' | 'polished' | 'brushed';
export type TireType = 'sport' | 'all_season' | 'winter' | 'performance';
export type BodyKitPiece = 'front_bumper' | 'rear_bumper' | 'side_skirts' | 'splitter' | 'diffuser';
export type SpoilerDesign = 'gt' | 'carbon' | 'racing' | 'stock' | 'none';
export type SpoilerMaterial = 'abs_plastic' | 'carbon_fiber' | 'aluminum';
export type DecalPlacement = 'hood' | 'roof' | 'trunk' | 'door_left' | 'door_right' | 'quarter_left' | 'quarter_right' | 'stripe_full';

export interface PaintSettings {
  color: string;
  finish: PaintFinish;
  zones: {
    body: boolean;
    roof: boolean;
    trim: boolean;
    accents: boolean;
  };
}

export interface WheelSettings {
  designId: string;
  size: WheelSize;
  finish: WheelFinish;
  tire: TireType;
}

export interface BodyKitSettings {
  kitId: string | null;
  pieces: Partial<Record<BodyKitPiece, boolean>>;
}

export interface SpoilerSettings {
  designId: string | null;
  material: SpoilerMaterial;
  position: 'low' | 'medium' | 'high';
  angle: number;
}

export interface DecalSettings {
  id: string;
  designId: string;
  placement: DecalPlacement;
  color: string;
  opacity: number;
  scale: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
}

export interface CustomizationState {
  paint: PaintSettings;
  wheels: WheelSettings;
  bodyKit: BodyKitSettings;
  spoiler: SpoilerSettings;
  decals: DecalSettings[];
  carId: string | null;
  
  setPaint: (paint: Partial<PaintSettings>) => void;
  setWheels: (wheels: Partial<WheelSettings>) => void;
  setBodyKit: (bodyKit: Partial<BodyKitSettings>) => void;
  setSpoiler: (spoiler: Partial<SpoilerSettings>) => void;
  addDecal: (decal: Omit<DecalSettings, 'id'>) => string;
  updateDecal: (id: string, updates: Partial<DecalSettings>) => void;
  removeDecal: (id: string) => void;
  setCarId: (carId: string | null) => void;
  reset: () => void;
  undo: () => void;
  redo: () => void;
}

const defaultPaint: PaintSettings = {
  color: '#c0c0c0',
  finish: 'metallic',
  zones: {
    body: true,
    roof: false,
    trim: true,
    accents: false,
  },
};

const defaultWheels: WheelSettings = {
  designId: 'sport_5spoke',
  size: 19,
  finish: 'polished',
  tire: 'sport',
};

const defaultBodyKit: BodyKitSettings = {
  kitId: null,
  pieces: {},
};

const defaultSpoiler: SpoilerSettings = {
  designId: null,
  material: 'abs_plastic',
  position: 'medium',
  angle: 0,
};

const createCustomizationStore = () =>
  create<CustomizationState>()(
    persist(
      (set, _get) => ({
        paint: defaultPaint,
        wheels: defaultWheels,
        bodyKit: defaultBodyKit,
        spoiler: defaultSpoiler,
        decals: [],
        carId: null,

        setPaint: (paint) =>
          set((state) => ({
            paint: { ...state.paint, ...paint },
          })),

        setWheels: (wheels) =>
          set((state) => ({
            wheels: { ...state.wheels, ...wheels },
          })),

        setBodyKit: (bodyKit) =>
          set((state) => ({
            bodyKit: { ...state.bodyKit, ...bodyKit },
          })),

        setSpoiler: (spoiler) =>
          set((state) => ({
            spoiler: { ...state.spoiler, ...spoiler },
          })),

        addDecal: (decal) => {
          const id = `decal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          set((state) => ({
            decals: [...state.decals, { ...decal, id }],
          }));
          return id;
        },

        updateDecal: (id, updates) =>
          set((state) => ({
            decals: state.decals.map((d) =>
              d.id === id ? { ...d, ...updates } : d
            ),
          })),

        removeDecal: (id) =>
          set((state) => ({
            decals: state.decals.filter((d) => d.id !== id),
          })),

        setCarId: (carId) => set({ carId }),

        reset: () =>
          set({
            paint: defaultPaint,
            wheels: defaultWheels,
            bodyKit: defaultBodyKit,
            spoiler: defaultSpoiler,
            decals: [],
          }),

        undo: () => {
          console.log('Undo not yet implemented');
        },

        redo: () => {
          console.log('Redo not yet implemented');
        },
      }),
      {
        name: 'car-customization',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          paint: state.paint,
          wheels: state.wheels,
          bodyKit: state.bodyKit,
          spoiler: state.spoiler,
          decals: state.decals,
          carId: state.carId,
        }),
      }
    )
  );

export const useCustomizationStore = createCustomizationStore();

export const calculateTotalPrice = (
  basePrice: number,
  paint: PaintSettings,
  wheels: WheelSettings,
  bodyKit: BodyKitSettings,
  spoiler: SpoilerSettings,
  decals: DecalSettings[],
  options?: {
    wheelDesigns?: Record<string, number>;
    bodyKits?: Record<string, number>;
    spoilerDesigns?: Record<string, number>;
    decalDesigns?: Record<string, number>;
  }
): number => {
  let total = basePrice;

  const paintPrices: Record<PaintFinish, number> = {
    matte: 500,
    glossy: 800,
    metallic: 1200,
    pearl: 2000,
  };
  total += paintPrices[paint.finish];

  if (options?.wheelDesigns && wheels.designId) {
    const baseWheelPrice = options.wheelDesigns[wheels.designId] || 0;
    const sizeMultiplier = 1 + (wheels.size - 17) * 0.1;
    total += baseWheelPrice * sizeMultiplier;
  }

  if (bodyKit.kitId && options?.bodyKits) {
    total += options.bodyKits[bodyKit.kitId] || 0;
  }

  if (spoiler.designId && options?.spoilerDesigns) {
    const basePrice = options.spoilerDesigns[spoiler.designId] || 0;
    const materialMultipliers: Record<SpoilerMaterial, number> = {
      abs_plastic: 1,
      carbon_fiber: 1.5,
      aluminum: 1.25,
    };
    total += basePrice * materialMultipliers[spoiler.material];
  }

  if (options?.decalDesigns) {
    decals.forEach((decal) => {
      const price = options.decalDesigns![decal.designId] || 50;
      total += price * decal.opacity;
    });
  }

  return total;
};
