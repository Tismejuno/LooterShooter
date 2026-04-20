import { create } from "zustand";

export interface CombatTelemetryEvent {
  timestamp: number;
  damage: number;
  damageType: string;
  enemyType: string;
  weakPoint: boolean;
  killed: boolean;
}

export interface LootTelemetryEvent {
  timestamp: number;
  rarity: string;
  itemType: string;
  archetype?: string;
  worldTier: number;
}

export interface RunTelemetrySnapshot {
  timestamp: number;
  phase: string;
  worldTier: number;
  challengeModifierCount: number;
}

interface TelemetryState {
  combatEvents: CombatTelemetryEvent[];
  lootEvents: LootTelemetryEvent[];
  runSnapshots: RunTelemetrySnapshot[];
  recordCombatEvent: (event: CombatTelemetryEvent) => void;
  recordLootEvent: (event: LootTelemetryEvent) => void;
  recordRunSnapshot: (event: RunTelemetrySnapshot) => void;
  clearTelemetry: () => void;
}

const CAP = 500;

export const useTelemetry = create<TelemetryState>((set) => ({
  combatEvents: [],
  lootEvents: [],
  runSnapshots: [],

  recordCombatEvent: (event) =>
    set((state) => ({
      combatEvents: [...state.combatEvents.slice(-CAP + 1), event],
    })),

  recordLootEvent: (event) =>
    set((state) => ({
      lootEvents: [...state.lootEvents.slice(-CAP + 1), event],
    })),

  recordRunSnapshot: (event) =>
    set((state) => ({
      runSnapshots: [...state.runSnapshots.slice(-CAP + 1), event],
    })),

  clearTelemetry: () =>
    set({
      combatEvents: [],
      lootEvents: [],
      runSnapshots: [],
    }),
}));
