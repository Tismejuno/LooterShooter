import { create } from "zustand";
import { LootItem, Position } from "../gameTypes";
import { LootSystem } from "../LootSystem";
import { rollLootTable } from "../content/lootTables";
import { useTelemetry } from "./useTelemetry";

interface LootState {
  items: LootItem[];

  // Actions
  spawnLoot: (position: Position, rarity?: "common" | "uncommon" | "rare" | "epic" | "legendary", playerLevel?: number) => void;
  removeItem: (itemId: string) => void;
  generateRandomLoot: (position: Position, playerLevel: number) => void;
}

export const useLoot = create<LootState>((set) => ({
  items: [],

  spawnLoot: (position, rarity = "common", playerLevel = 1) => {
    const tableRoll = rollLootTable(playerLevel);
    const item = LootSystem.generateItem(position, rarity, tableRoll.itemType, playerLevel);

    set((state) => ({
      items: [...state.items, item],
    }));

    useTelemetry.getState().recordLootEvent({
      timestamp: Date.now(),
      rarity: item.rarity,
      itemType: item.type,
      archetype: item.archetype,
      worldTier: tableRoll.worldTier,
    });
  },

  removeItem: (itemId) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    }));
  },

  generateRandomLoot: (position, playerLevel) => {
    const tableRoll = rollLootTable(playerLevel);
    const rarity = LootSystem.rollRarity(playerLevel);
    const item = LootSystem.generateItem(position, rarity, tableRoll.itemType, playerLevel);

    set((state) => ({
      items: [...state.items, item],
    }));

    useTelemetry.getState().recordLootEvent({
      timestamp: Date.now(),
      rarity: item.rarity,
      itemType: item.type,
      archetype: item.archetype,
      worldTier: tableRoll.worldTier,
    });
  },
}));
