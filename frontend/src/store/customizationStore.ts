import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CustomizationCategory } from '../../../backend/models/enums';

export interface PaintZone {
  id: string;
  name: string;
  color: string;
  finish: PaintFinish;
}

export type PaintFinish = 'matte' | 'glossy' | 'metallic' | 'pearl';

export interface WheelCustomization {
  designId: string;
  size: string;
  color: string;
  finish: string;
  tireType: string;
  modelUrl?: string;
}

export interface BodyKitPiece {
  pieceType: 'front_bumper' | 'rear_bumper' | 'side_skirt' | 'splitter' | 'diffuser';
  optionId: string;
  modelUrl?: string;
}

export interface SpoilerCustomization {
  designId: string;
  material: string;
  angle?: number;
  height?: number;
  position: string;
  modelUrl?: string;
}

export interface DecalApplication {
  id: string;
  decalId: string;
  color: string;
  opacity: number;
  position: string;
  scale: { x: number; y: number };
  rotation: number;
}

export interface CustomizationState {
  selectedCarId: string | null;
  
  // Paint customization
  paintZones: PaintZone[];
  
  // Wheels customization
  wheels: WheelCustomization | null;
  
  // Body kit customization
  bodyKit: BodyKitPiece[];
  
  // Spoiler customization
  spoiler: SpoilerCustomization | null;
  
  // Decals
  appliedDecals: DecalApplication[];
  
  // Pricing
  totalPrice: number;
  basePrice: number;
  
  // UI state
  activeSection: 'paint' | 'wheels' | 'body_kit' | 'spoiler' | 'decals';
  
  // Methods
  setSelectedCar: (carId: string, basePrice: number) => void;
  updatePaintZone: (zoneId: string, updates: Partial<PaintZone>) => void;
  setWheels: (wheels: WheelCustomization) => void;
  addBodyKitPiece: (piece: BodyKitPiece) => void;
  removeBodyKitPiece: (pieceType: BodyKitPiece['pieceType']) => void;
  setSpoiler: (spoiler: SpoilerCustomization | null) => void;
  addDecal: (decal: DecalApplication) => void;
  removeDecal: (decalId: string) => void;
  updateDecal: (decalId: string, updates: Partial<DecalApplication>) => void;
  updateTotalPrice: (additionalPrice: number) => void;
  setActiveSection: (section: CustomizationState['activeSection']) => void;
  resetAll: () => void;
  loadConfiguration: (config: ConfigurationData) => void;
  getConfigurationData: () => ConfigurationData;
}

export interface ConfigurationData {
  carId: string;
  paintZones: PaintZone[];
  wheels: WheelCustomization | null;
  bodyKit: BodyKitPiece[];
  spoiler: SpoilerCustomization | null;
  appliedDecals: DecalApplication[];
  totalPrice: number;
  basePrice: number;
  createdAt: string;
}

const DEFAULT_PAINT_ZONES: PaintZone[] = [
  {
    id: 'body',
    name: 'Body',
    color: '#000000',
    finish: 'glossy',
  },
  {
    id: 'roof',
    name: 'Roof',
    color: '#000000',
    finish: 'glossy',
  },
  {
    id: 'trim',
    name: 'Trim',
    color: '#c0c0c0',
    finish: 'glossy',
  },
  {
    id: 'accents',
    name: 'Accents',
    color: '#ff0000',
    finish: 'glossy',
  },
];

export const useCustomizationStore = create<CustomizationState>()(
  persist(
    (set, get) => ({
      selectedCarId: null,
      paintZones: DEFAULT_PAINT_ZONES,
      wheels: null,
      bodyKit: [],
      spoiler: null,
      appliedDecals: [],
      totalPrice: 0,
      basePrice: 0,
      activeSection: 'paint',

      setSelectedCar: (carId: string, basePrice: number) => {
        set({
          selectedCarId: carId,
          basePrice,
          totalPrice: basePrice,
          paintZones: DEFAULT_PAINT_ZONES.map(zone => ({ 
            ...zone, 
            color: zone.id === 'accents' ? '#ff0000' : '#000000' // Reset body/roof to black
          })),
          wheels: null,
          bodyKit: [],
          spoiler: null,
          appliedDecals: [],
        });
      },

      updatePaintZone: (zoneId: string, updates: Partial<PaintZone>) => {
        set((state) => ({
          paintZones: state.paintZones.map((zone) =>
            zone.id === zoneId ? { ...zone, ...updates } : zone
          ),
        }));
      },

      setWheels: (wheels: WheelCustomization) => {
        set((state) => {
          const oldPrice = state.wheels ? calculateWheelsPrice(state.wheels) : 0;
          const newPrice = calculateWheelsPrice(wheels);
          return {
            wheels,
            totalPrice: state.totalPrice - oldPrice + newPrice,
          };
        });
      },

      addBodyKitPiece: (piece: BodyKitPiece) => {
        set((state) => ({
          bodyKit: [...state.bodyKit.filter(p => p.pieceType !== piece.pieceType), piece],
        }));
      },

      removeBodyKitPiece: (pieceType: BodyKitPiece['pieceType']) => {
        set((state) => ({
          bodyKit: state.bodyKit.filter((piece) => piece.pieceType !== pieceType),
        }));
      },

      setSpoiler: (spoiler: SpoilerCustomization | null) => {
        set((state) => {
          const oldPrice = state.spoiler ? calculateSpoilerPrice(state.spoiler) : 0;
          const newPrice = spoiler ? calculateSpoilerPrice(spoiler) : 0;
          return {
            spoiler,
            totalPrice: state.totalPrice - oldPrice + newPrice,
          };
        });
      },

      addDecal: (decal: DecalApplication) => {
        set((state) => ({
          appliedDecals: [...state.appliedDecals, decal],
        }));
      },

      removeDecal: (decalId: string) => {
        set((state) => ({
          appliedDecals: state.appliedDecals.filter((decal) => decal.id !== decalId),
        }));
      },

      updateDecal: (decalId: string, updates: Partial<DecalApplication>) => {
        set((state) => ({
          appliedDecals: state.appliedDecals.map((decal) =>
            decal.id === decalId ? { ...decal, ...updates } : decal
          ),
        }));
      },

      updateTotalPrice: (additionalPrice: number) => {
        set((state) => ({ totalPrice: state.totalPrice + additionalPrice }));
      },

      setActiveSection: (section: CustomizationState['activeSection']) => {
        set({ activeSection: section });
      },

      resetAll: () => {
        const { basePrice } = get();
        set({
          paintZones: DEFAULT_PAINT_ZONES,
          wheels: null,
          bodyKit: [],
          spoiler: null,
          appliedDecals: [],
          totalPrice: basePrice || 0,
        });
      },

      loadConfiguration: (config: ConfigurationData) => {
        set({
          selectedCarId: config.carId,
          paintZones: config.paintZones,
          wheels: config.wheels,
          bodyKit: config.bodyKit,
          spoiler: config.spoiler,
          appliedDecals: config.appliedDecals,
          totalPrice: config.totalPrice,
          basePrice: config.basePrice,
          activeSection: 'paint',
        });
      },

      getConfigurationData: () => {
        const state = get();
        return {
          carId: state.selectedCarId!,
          paintZones: state.paintZones,
          wheels: state.wheels,
          bodyKit: state.bodyKit,
          spoiler: state.spoiler,
          appliedDecals: state.appliedDecals,
          totalPrice: state.totalPrice,
          basePrice: state.basePrice,
          createdAt: new Date().toISOString(),
        };
      },
    }),
    {
      name: 'car-customization-storage',
      partialize: (state) => ({
        paintZones: state.paintZones,
        wheels: state.wheels,
        bodyKit: state.bodyKit,
        spoiler: state.spoiler,
        appliedDecals: state.appliedDecals,
        activeSection: state.activeSection,
      }),
    }
  )
);

// Price calculation helpers
function calculateWheelsPrice(wheels: WheelCustomization): number {
  const sizePrice: { [key: string]: number } = {
    '17': 500,
    '18': 750,
    '19': 1000,
    '20': 1500,
  };
  const finishPrice: { [key: string]: number } = {
    chrome: 200,
    'matte_black': 0,
    polished: 150,
  };
  
  return (sizePrice[wheels.size] || 500) + (finishPrice[wheels.finish] || 0);
}

function calculateSpoilerPrice(spoiler: SpoilerCustomization): number {
  const materialPrice: { [key: string]: number } = {
    'abs_plastic': 300,
    'carbon_fiber': 800,
    'aluminum': 600,
  };
  
  return materialPrice[spoiler.material] || 500;
}