import { create } from "zustand";
import { Position, Trap, SpawnPoint } from "../gameTypes";
import { DungeonEngine, Room, Wall } from "../DungeonEngine";

interface DungeonState {
  currentLevel: number;
  rooms: Room[];
  walls: Wall[];
  traps: Trap[];
  spawnPoints: SpawnPoint[];
  
  // Actions
  generateLevel: (level: number) => void;
  nextLevel: () => void;
  getTrap: (trapId: string) => Trap | undefined;
  triggerTrap: (trapId: string) => void;
}

export const useDungeon = create<DungeonState>((set, get) => ({
  currentLevel: 1,
  rooms: [],
  walls: [],
  traps: [],
  spawnPoints: [],

  generateLevel: (level) => {
    const layout = DungeonEngine.generateDungeon(level);
    
    set({
      currentLevel: level,
      rooms: layout.rooms,
      walls: layout.walls,
      traps: layout.traps,
      spawnPoints: layout.spawnPoints
    });
    
    console.log(`Generated dungeon level ${level} with ${layout.rooms.length} rooms, ${layout.traps.length} traps, ${layout.spawnPoints.length} spawn points`);
  },

  nextLevel: () => {
    const { currentLevel, generateLevel } = get();
    const newLevel = currentLevel + 1;
    generateLevel(newLevel);
  },

  getTrap: (trapId) => {
    const state = get();
    return state.traps.find(trap => trap.id === trapId);
  },

  triggerTrap: (trapId) => {
    set((state) => ({
      traps: state.traps.map(trap =>
        trap.id === trapId ? { ...trap, triggered: true } : trap
      )
    }));
  }
}));
