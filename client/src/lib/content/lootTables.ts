import type { ItemType } from "../gameTypes";
import type { Biome } from "../DungeonEngine";

export interface LootTableEntry {
  itemType: ItemType;
  weight: number;
}

export interface LootTableRoll {
  biome: Biome;
  itemType: ItemType;
  worldTier: number;
}

const BIOME_LOOT_TABLES: Record<Biome, LootTableEntry[]> = {
  dungeon: [
    { itemType: "weapon", weight: 34 },
    { itemType: "armor", weight: 30 },
    { itemType: "potion", weight: 12 },
    { itemType: "scroll", weight: 9 },
    { itemType: "accessory", weight: 8 },
    { itemType: "material", weight: 7 },
  ],
  grassland: [
    { itemType: "weapon", weight: 33 },
    { itemType: "armor", weight: 25 },
    { itemType: "food", weight: 10 },
    { itemType: "potion", weight: 10 },
    { itemType: "accessory", weight: 12 },
    { itemType: "material", weight: 10 },
  ],
  snow: [
    { itemType: "weapon", weight: 30 },
    { itemType: "armor", weight: 30 },
    { itemType: "offhand", weight: 12 },
    { itemType: "scroll", weight: 10 },
    { itemType: "rune", weight: 8 },
    { itemType: "material", weight: 10 },
  ],
  clouds: [
    { itemType: "weapon", weight: 31 },
    { itemType: "armor", weight: 24 },
    { itemType: "offhand", weight: 12 },
    { itemType: "relic", weight: 9 },
    { itemType: "scroll", weight: 10 },
    { itemType: "accessory", weight: 14 },
  ],
  lava: [
    { itemType: "weapon", weight: 36 },
    { itemType: "armor", weight: 24 },
    { itemType: "grenade", weight: 11 },
    { itemType: "material", weight: 11 },
    { itemType: "offhand", weight: 8 },
    { itemType: "relic", weight: 10 },
  ],
  crystal: [
    { itemType: "weapon", weight: 28 },
    { itemType: "armor", weight: 22 },
    { itemType: "gem", weight: 17 },
    { itemType: "rune", weight: 13 },
    { itemType: "offhand", weight: 10 },
    { itemType: "relic", weight: 10 },
  ],
  shadow: [
    { itemType: "weapon", weight: 35 },
    { itemType: "armor", weight: 22 },
    { itemType: "artifact", weight: 8 },
    { itemType: "relic", weight: 12 },
    { itemType: "accessory", weight: 12 },
    { itemType: "rune", weight: 11 },
  ],
  abyss: [
    { itemType: "weapon", weight: 33 },
    { itemType: "armor", weight: 23 },
    { itemType: "artifact", weight: 9 },
    { itemType: "relic", weight: 13 },
    { itemType: "offhand", weight: 11 },
    { itemType: "material", weight: 11 },
  ],
  forge: [
    { itemType: "weapon", weight: 38 },
    { itemType: "armor", weight: 24 },
    { itemType: "artifact", weight: 11 },
    { itemType: "blueprint", weight: 12 },
    { itemType: "relic", weight: 9 },
    { itemType: "material", weight: 6 },
  ],
};

export function biomeForPlayerLevel(level: number): Biome {
  if (level >= 51) return "forge";
  if (level >= 41) return "abyss";
  if (level >= 31) return "shadow";
  if (level >= 26) return "clouds";
  if (level >= 21) return "lava";
  if (level >= 16) return "crystal";
  if (level >= 11) return "snow";
  if (level >= 6) return "grassland";
  return "dungeon";
}

export function worldTierForLevel(level: number): number {
  if (level >= 60) return 5;
  if (level >= 45) return 4;
  if (level >= 30) return 3;
  if (level >= 15) return 2;
  return 1;
}

export function rollLootTable(level: number, biome?: Biome): LootTableRoll {
  const activeBiome = biome ?? biomeForPlayerLevel(level);
  const table = BIOME_LOOT_TABLES[activeBiome];
  const totalWeight = table.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const entry of table) {
    roll -= entry.weight;
    if (roll <= 0) {
      return {
        biome: activeBiome,
        itemType: entry.itemType,
        worldTier: worldTierForLevel(level),
      };
    }
  }

  return {
    biome: activeBiome,
    itemType: "weapon",
    worldTier: worldTierForLevel(level),
  };
}
