import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type PaintFinish = 'MATTE' | 'GLOSSY' | 'METALLIC' | 'PEARL';
export type PaintZone = 'BODY' | 'ROOF' | 'TRIM' | 'ACCENTS' | 'MIRRORS';

export interface PaintConfig {
  color: string;
  finish: PaintFinish;
  zone: PaintZone;
}

export type WheelSize = '17"' | '18"' | '19"' | '20"' | '21"';
export type WheelFinish = 'CHROME' | 'MATTE_BLACK' | 'POLISHED' | 'PAINTED';
export type TireType = 'SPORT' | 'ALL_SEASON' | 'WINTER' | 'TRACK';

export interface WheelConfig {
  designId: string | null;
  size: WheelSize;
  finish: WheelFinish;
  tireType: TireType;
}

export type BodyKitPiece = 'FRONT_BUMPER' | 'REAR_BUMPER' | 'SIDE_SKIRTS' | 'FENDER_FLARES' | 'HOOD' | 'DIFFUSER' | 'SPLITTER';

export interface BodyKitConfig {
  kitId: string | null;
  pieces: Record<BodyKitPiece, boolean>;
}

export type SpoilerType = 'GT' | 'CARBON' | 'RACING' | 'STOCK' | 'NONE';
export type SpoilerMaterial = 'ABS_PLASTIC' | 'CARBON_FIBER' | 'ALUMINUM' | 'FIBERGLASS';
export type SpoilerPosition = 'LOW' | 'MID' | 'HIGH' | 'LIP';

export interface SpoilerConfig {
  designId: string | null;
  type: SpoilerType;
  material: SpoilerMaterial;
  position: SpoilerPosition;
  angle: number;
  height: number;
}

export type DecalPlacement = 'HOOD' | 'ROOF' | 'TRUNK' | 'DOOR_LEFT' | 'DOOR_RIGHT' | 'QUARTER_LEFT' | 'QUARTER_RIGHT' | 'BUMPER_FRONT' | 'BUMPER_REAR';

export interface DecalConfig {
  id: string;
  typeId: string;
  name: string;
  placement: DecalPlacement;
  color: string;
  opacity: number;
  scale: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
}

interface UndoState {
  paint: PaintConfig;
  wheels: WheelConfig;
  bodyKit: BodyKitConfig;
  spoiler: SpoilerConfig;
  decals: DecalConfig[];
}

interface CustomizationState extends UndoState {
  carId: string | null;
  basePrice: number;
  totalCustomizationPrice: number;
  undoStack: UndoState[];
  redoStack: UndoState[];
  
  setCarId: (carId: string | null, basePrice: number) => void;
  
  setPaint: (paint: Partial<PaintConfig>, saveToHistory?: boolean) => void;
  setPaintColor: (color: string, saveToHistory?: boolean) => void;
  setPaintFinish: (finish: PaintFinish, saveToHistory?: boolean) => void;
  setPaintZone: (zone: PaintZone, saveToHistory?: boolean) => void;
  resetPaint: (saveToHistory?: boolean) => void;
  
  setWheels: (wheels: Partial<WheelConfig>, saveToHistory?: boolean) => void;
  setWheelDesign: (designId: string | null, saveToHistory?: boolean) => void;
  setWheelSize: (size: WheelSize, saveToHistory?: boolean) => void;
  setWheelFinish: (finish: WheelFinish, saveToHistory?: boolean) => void;
  setTireType: (tireType: TireType, saveToHistory?: boolean) => void;
  resetWheels: (saveToHistory?: boolean) => void;
  
  setBodyKit: (bodyKit: Partial<BodyKitConfig>, saveToHistory?: boolean) => void;
  setBodyKitDesign: (kitId: string | null, saveToHistory?: boolean) => void;
  toggleBodyKitPiece: (piece: BodyKitPiece, enabled: boolean, saveToHistory?: boolean) => void;
  resetBodyKit: (saveToHistory?: boolean) => void;
  
  setSpoiler: (spoiler: Partial<SpoilerConfig>, saveToHistory?: boolean) => void;
  setSpoilerDesign: (designId: string | null, saveToHistory?: boolean) => void;
  setSpoilerType: (type: SpoilerType, saveToHistory?: boolean) => void;
  setSpoilerMaterial: (material: SpoilerMaterial, saveToHistory?: boolean) => void;
  setSpoilerPosition: (position: SpoilerPosition, saveToHistory?: boolean) => void;
  setSpoilerAngle: (angle: number, saveToHistory?: boolean) => void;
  setSpoilerHeight: (height: number, saveToHistory?: boolean) => void;
  resetSpoiler: (saveToHistory?: boolean) => void;
  
  addDecal: (decal: Omit<DecalConfig, 'id'>, saveToHistory?: boolean) => string;
  updateDecal: (id: string, updates: Partial<DecalConfig>, saveToHistory?: boolean) => void;
  removeDecal: (id: string, saveToHistory?: boolean) => void;
  clearDecals: (saveToHistory?: boolean) => void;
  
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  
  resetAll: (saveToHistory?: boolean) => void;
  getFullConfiguration: () => CustomizationState;
  loadConfiguration: (config: Partial<UndoState>) => void;
}

const defaultPaint: PaintConfig = {
  color: '#C0C0C0',
  finish: 'GLOSSY',
  zone: 'BODY',
};

const defaultWheels: WheelConfig = {
  designId: null,
  size: '19"',
  finish: 'POLISHED',
  tireType: 'ALL_SEASON',
};

const defaultBodyKit: BodyKitConfig = {
  kitId: null,
  pieces: {
    FRONT_BUMPER: false,
    REAR_BUMPER: false,
    SIDE_SKIRTS: false,
    FENDER_FLARES: false,
    HOOD: false,
    DIFFUSER: false,
    SPLITTER: false,
  },
};

const defaultSpoiler: SpoilerConfig = {
  designId: null,
  type: 'STOCK',
  material: 'ABS_PLASTIC',
  position: 'MID',
  angle: 0,
  height: 0,
};

const generateId = () => Math.random().toString(36).substring(2, 15);

const createUndoState = (state: CustomizationState): UndoState => ({
  paint: { ...state.paint },
  wheels: { ...state.wheels },
  bodyKit: { ...state.bodyKit, pieces: { ...state.bodyKit.pieces } },
  spoiler: { ...state.spoiler },
  decals: state.decals.map(d => ({ ...d })),
});

export const useCustomizationStore = create<CustomizationState>()(
  persist(
    (set, get) => ({
      carId: null,
      basePrice: 0,
      
      paint: { ...defaultPaint },
      wheels: { ...defaultWheels },
      bodyKit: { ...defaultBodyKit },
      spoiler: { ...defaultSpoiler },
      decals: [],
      
      totalCustomizationPrice: 0,
      
      undoStack: [],
      redoStack: [],
      
      setCarId: (carId, basePrice) => set({ carId, basePrice }),
      
      setPaint: (paint, saveToHistory = false) => {
        if (saveToHistory) {
          const current = createUndoState(get());
          set((state) => ({
            paint: { ...state.paint, ...paint },
            undoStack: [...state.undoStack, current].slice(-50),
            redoStack: [],
          }));
        } else {
          set((state) => ({ paint: { ...state.paint, ...paint } }));
        }
      },
      
      setPaintColor: (color, saveToHistory = false) => {
        if (saveToHistory) {
          const current = createUndoState(get());
          set((state) => ({
            paint: { ...state.paint, color },
            undoStack: [...state.undoStack, current].slice(-50),
            redoStack: [],
          }));
        } else {
          set((state) => ({ paint: { ...state.paint, color } }));
        }
      },
      
      setPaintFinish: (finish, saveToHistory = false) => {
        if (saveToHistory) {
          const current = createUndoState(get());
          set((state) => ({
            paint: { ...state.paint, finish },
            undoStack: [...state.undoStack, current].slice(-50),
            redoStack: [],
          }));
        } else {
          set((state) => ({ paint: { ...state.paint, finish } }));
        }
      },
      
      setPaintZone: (zone, saveToHistory = false) => {
        if (saveToHistory) {
          const current = createUndoState(get());
          set((state) => ({
            paint: { ...state.paint, zone },
            undoStack: [...state.undoStack, current].slice(-50),
            redoStack: [],
          }));
        } else {
          set((state) => ({ paint: { ...state.paint, zone } }));
        }
      },
      
      resetPaint: (saveToHistory = false) => {
        if (saveToHistory) {
          const current = createUndoState(get());
          set((state) => ({
            paint: { ...defaultPaint },
            undoStack: [...state.undoStack, current].slice(-50),
            redoStack: [],
          }));
        } else {
          set({ paint: { ...defaultPaint } });
        }
      },
      
      setWheels: (wheels, saveToHistory = false) => {
        if (saveToHistory) {
          const current = createUndoState(get());
          set((state) => ({
            wheels: { ...state.wheels, ...wheels },
            undoStack: [...state.undoStack, current].slice(-50),
            redoStack: [],
          }));
        } else {
          set((state) => ({ wheels: { ...state.wheels, ...wheels } }));
        }
      },
      
      setWheelDesign: (designId, saveToHistory = false) => {
        if (saveToHistory) {
          const current = createUndoState(get());
          set((state) => ({
            wheels: { ...state.wheels, designId },
            undoStack: [...state.undoStack, current].slice(-50),
            redoStack: [],
          }));
        } else {
          set((state) => ({ wheels: { ...state.wheels, designId } }));
        }
      },
      
      setWheelSize: (size, saveToHistory = false) => {
        if (saveToHistory) {
          const current = createUndoState(get());
          set((state) => ({
            wheels: { ...state.wheels, size },
            undoStack: [...state.undoStack, current].slice(-50),
            redoStack: [],
          }));
        } else {
          set((state) => ({ wheels: { ...state.wheels, size } }));
        }
      },
      
      setWheelFinish: (finish, saveToHistory = false) => {
        if (saveToHistory) {
          const current = createUndoState(get());
          set((state) => ({
            wheels: { ...state.wheels, finish },
            undoStack: [...state.undoStack, current].slice(-50),
            redoStack: [],
          }));
        } else {
          set((state) => ({ wheels: { ...state.wheels, finish } }));
        }
      },
      
      setTireType: (tireType, saveToHistory = false) => {
        if (saveToHistory) {
          const current = createUndoState(get());
          set((state) => ({
            wheels: { ...state.wheels, tireType },
            undoStack: [...state.undoStack, current].slice(-50),
            redoStack: [],
          }));
        } else {
          set((state) => ({ wheels: { ...state.wheels, tireType } }));
        }
      },
      
      resetWheels: (saveToHistory = false) => {
        if (saveToHistory) {
          const current = createUndoState(get());
          set((state) => ({
            wheels: { ...defaultWheels },
            undoStack: [...state.undoStack, current].slice(-50),
            redoStack: [],
          }));
        } else {
          set({ wheels: { ...defaultWheels } });
        }
      },
      
      setBodyKit: (bodyKit, saveToHistory = false) => {
        if (saveToHistory) {
          const current = createUndoState(get());
          set((state) => ({
            bodyKit: { ...state.bodyKit, ...bodyKit, pieces: { ...state.bodyKit.pieces, ...(bodyKit.pieces || {}) } },
            undoStack: [...state.undoStack, current].slice(-50),
            redoStack: [],
          }));
        } else {
          set((state) => ({
            bodyKit: { ...state.bodyKit, ...bodyKit, pieces: { ...state.bodyKit.pieces, ...(bodyKit.pieces || {}) } },
          }));
        }
      },
      
      setBodyKitDesign: (kitId, saveToHistory = false) => {
        if (saveToHistory) {
          const current = createUndoState(get());
          set((state) => ({
            bodyKit: { ...state.bodyKit, kitId },
            undoStack: [...state.undoStack, current].slice(-50),
            redoStack: [],
          }));
        } else {
          set((state) => ({ bodyKit: { ...state.bodyKit, kitId } }));
        }
      },
      
      toggleBodyKitPiece: (piece, enabled, saveToHistory = false) => {
        if (saveToHistory) {
          const current = createUndoState(get());
          set((state) => ({
            bodyKit: { ...state.bodyKit, pieces: { ...state.bodyKit.pieces, [piece]: enabled } },
            undoStack: [...state.undoStack, current].slice(-50),
            redoStack: [],
          }));
        } else {
          set((state) => ({
            bodyKit: { ...state.bodyKit, pieces: { ...state.bodyKit.pieces, [piece]: enabled } },
          }));
        }
      },
      
      resetBodyKit: (saveToHistory = false) => {
        if (saveToHistory) {
          const current = createUndoState(get());
          set((state) => ({
            bodyKit: { ...defaultBodyKit },
            undoStack: [...state.undoStack, current].slice(-50),
            redoStack: [],
          }));
        } else {
          set({ bodyKit: { ...defaultBodyKit } });
        }
      },
      
      setSpoiler: (spoiler, saveToHistory = false) => {
        if (saveToHistory) {
          const current = createUndoState(get());
          set((state) => ({
            spoiler: { ...state.spoiler, ...spoiler },
            undoStack: [...state.undoStack, current].slice(-50),
            redoStack: [],
          }));
        } else {
          set((state) => ({ spoiler: { ...state.spoiler, ...spoiler } }));
        }
      },
      
      setSpoilerDesign: (designId, saveToHistory = false) => {
        if (saveToHistory) {
          const current = createUndoState(get());
          set((state) => ({
            spoiler: { ...state.spoiler, designId },
            undoStack: [...state.undoStack, current].slice(-50),
            redoStack: [],
          }));
        } else {
          set((state) => ({ spoiler: { ...state.spoiler, designId } }));
        }
      },
      
      setSpoilerType: (type, saveToHistory = false) => {
        if (saveToHistory) {
          const current = createUndoState(get());
          set((state) => ({
            spoiler: { ...state.spoiler, type },
            undoStack: [...state.undoStack, current].slice(-50),
            redoStack: [],
          }));
        } else {
          set((state) => ({ spoiler: { ...state.spoiler, type } }));
        }
      },
      
      setSpoilerMaterial: (material, saveToHistory = false) => {
        if (saveToHistory) {
          const current = createUndoState(get());
          set((state) => ({
            spoiler: { ...state.spoiler, material },
            undoStack: [...state.undoStack, current].slice(-50),
            redoStack: [],
          }));
        } else {
          set((state) => ({ spoiler: { ...state.spoiler, material } }));
        }
      },
      
      setSpoilerPosition: (position, saveToHistory = false) => {
        if (saveToHistory) {
          const current = createUndoState(get());
          set((state) => ({
            spoiler: { ...state.spoiler, position },
            undoStack: [...state.undoStack, current].slice(-50),
            redoStack: [],
          }));
        } else {
          set((state) => ({ spoiler: { ...state.spoiler, position } }));
        }
      },
      
      setSpoilerAngle: (angle, saveToHistory = false) => {
        const clampedAngle = Math.max(-30, Math.min(30, angle));
        if (saveToHistory) {
          const current = createUndoState(get());
          set((state) => ({
            spoiler: { ...state.spoiler, angle: clampedAngle },
            undoStack: [...state.undoStack, current].slice(-50),
            redoStack: [],
          }));
        } else {
          set((state) => ({ spoiler: { ...state.spoiler, angle: clampedAngle } }));
        }
      },
      
      setSpoilerHeight: (height, saveToHistory = false) => {
        const clampedHeight = Math.max(0, Math.min(100, height));
        if (saveToHistory) {
          const current = createUndoState(get());
          set((state) => ({
            spoiler: { ...state.spoiler, height: clampedHeight },
            undoStack: [...state.undoStack, current].slice(-50),
            redoStack: [],
          }));
        } else {
          set((state) => ({ spoiler: { ...state.spoiler, height: clampedHeight } }));
        }
      },
      
      resetSpoiler: (saveToHistory = false) => {
        if (saveToHistory) {
          const current = createUndoState(get());
          set((state) => ({
            spoiler: { ...defaultSpoiler },
            undoStack: [...state.undoStack, current].slice(-50),
            redoStack: [],
          }));
        } else {
          set({ spoiler: { ...defaultSpoiler } });
        }
      },
      
      addDecal: (decal, saveToHistory = false) => {
        const id = generateId();
        const newDecal: DecalConfig = { ...decal, id };
        if (saveToHistory) {
          const current = createUndoState(get());
          set((state) => ({
            decals: [...state.decals, newDecal],
            undoStack: [...state.undoStack, current].slice(-50),
            redoStack: [],
          }));
        } else {
          set((state) => ({ decals: [...state.decals, newDecal] }));
        }
        return id;
      },
      
      updateDecal: (id, updates, saveToHistory = false) => {
        const currentDecals = get().decals;
        const decalIndex = currentDecals.findIndex((d) => d.id === id);
        if (decalIndex === -1) return;
        const updated = { ...currentDecals[decalIndex], ...updates };
        const newDecals = [...currentDecals];
        newDecals[decalIndex] = updated;
        if (saveToHistory) {
          const current = createUndoState(get());
          set((state) => ({
            decals: newDecals,
            undoStack: [...state.undoStack, current].slice(-50),
            redoStack: [],
          }));
        } else {
          set({ decals: newDecals });
        }
      },
      
      removeDecal: (id, saveToHistory = false) => {
        if (saveToHistory) {
          const current = createUndoState(get());
          set((state) => ({
            decals: state.decals.filter((d) => d.id !== id),
            undoStack: [...state.undoStack, current].slice(-50),
            redoStack: [],
          }));
        } else {
          set((state) => ({ decals: state.decals.filter((d) => d.id !== id) }));
        }
      },
      
      clearDecals: (saveToHistory = false) => {
        if (saveToHistory) {
          const current = createUndoState(get());
          set((state) => ({
            decals: [],
            undoStack: [...state.undoStack, current].slice(-50),
            redoStack: [],
          }));
        } else {
          set({ decals: [] });
        }
      },
      
      undo: () => {
        const { undoStack } = get();
        if (undoStack.length > 0) {
          const previousState = undoStack[undoStack.length - 1];
          set((state) => ({
            paint: { ...previousState.paint },
            wheels: { ...previousState.wheels },
            bodyKit: { ...previousState.bodyKit },
            spoiler: { ...previousState.spoiler },
            decals: previousState.decals.map(d => ({ ...d })),
            undoStack: undoStack.slice(0, -1),
            redoStack: [createUndoState(state), ...state.redoStack].slice(0, 50),
          } as CustomizationState));
        }
      },
      
      redo: () => {
        const { redoStack } = get();
        if (redoStack.length > 0) {
          const nextState = redoStack[0];
          set((state) => ({
            paint: { ...nextState.paint },
            wheels: { ...nextState.wheels },
            bodyKit: { ...nextState.bodyKit },
            spoiler: { ...nextState.spoiler },
            decals: nextState.decals.map(d => ({ ...d })),
            redoStack: redoStack.slice(1),
            undoStack: [...state.undoStack, createUndoState(state)].slice(-50),
          } as CustomizationState));
        }
      },
      
      clearHistory: () => set({ undoStack: [], redoStack: [] }),
      
      resetAll: (saveToHistory = false) => {
        if (saveToHistory) {
          const current = createUndoState(get());
          set((state) => ({
            paint: { ...defaultPaint },
            wheels: { ...defaultWheels },
            bodyKit: { ...defaultBodyKit },
            spoiler: { ...defaultSpoiler },
            decals: [],
            undoStack: [...state.undoStack, current].slice(-50),
            redoStack: [],
          }));
        } else {
          set({
            paint: { ...defaultPaint },
            wheels: { ...defaultWheels },
            bodyKit: { ...defaultBodyKit },
            spoiler: { ...defaultSpoiler },
            decals: [],
          });
        }
      },
      
      getFullConfiguration: () => get(),
      
      loadConfiguration: (config) => {
        set({
          paint: { ...defaultPaint, ...config.paint },
          wheels: { ...defaultWheels, ...config.wheels },
          bodyKit: { ...defaultBodyKit, ...config.bodyKit, pieces: { ...defaultBodyKit.pieces, ...(config.bodyKit?.pieces || {}) } },
          spoiler: { ...defaultSpoiler, ...config.spoiler },
          decals: config.decals?.map(d => ({ ...d })) || [],
        });
      },
    }),
    {
      name: 'car-customization',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        carId: state.carId,
        basePrice: state.basePrice,
        paint: state.paint,
        wheels: state.wheels,
        bodyKit: state.bodyKit,
        spoiler: state.spoiler,
        decals: state.decals,
      }),
    }
  )
);
