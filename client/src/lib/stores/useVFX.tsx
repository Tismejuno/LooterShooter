import { create } from "zustand";

export interface VFXEffect {
  id: string;
  type: "hit" | "death" | "levelup" | "ability" | "impact" | "loot" | "footstep";
  position: { x: number; y: number; z: number };
  color: string;
  timestamp: number;
  scale?: number;
}

interface VFXStore {
  effects: VFXEffect[];
  addEffect: (effect: Omit<VFXEffect, "id" | "timestamp">) => void;
  removeEffect: (id: string) => void;
}

export const useVFX = create<VFXStore>((set) => ({
  effects: [],
  addEffect: (effect) =>
    set((state) => ({
      effects: [
        ...state.effects,
        {
          ...effect,
          id: `${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
        },
      ],
    })),
  removeEffect: (id) =>
    set((state) => ({
      effects: state.effects.filter((e) => e.id !== id),
    })),
}));
