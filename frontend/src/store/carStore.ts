import { create } from 'zustand';

interface CarState {
  color: string;
  model: string;
  modifications: string[];
  setColor: (color: string) => void;
  setModel: (model: string) => void;
  addModification: (modification: string) => void;
  removeModification: (modification: string) => void;
}

export const useCarStore = create<CarState>((set) => ({
  color: '#646cff',
  model: 'default',
  modifications: [],
  setColor: (color) => set({ color }),
  setModel: (model) => set({ model }),
  addModification: (modification) =>
    set((state) => ({
      modifications: [...state.modifications, modification],
    })),
  removeModification: (modification) =>
    set((state) => ({
      modifications: state.modifications.filter((m) => m !== modification),
    })),
}));
