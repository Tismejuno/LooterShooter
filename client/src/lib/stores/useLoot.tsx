import { create } from "zustand";
import { LootItem, Position } from "../gameTypes";
import { getRandomInRange, generateRandomName } from "../gameUtils";

interface LootState {
  items: LootItem[];
  
  // Actions
  spawnLoot: (position: Position, rarity?: string) => void;
  removeItem: (itemId: string) => void;
  generateRandomLoot: (position: Position, playerLevel: number) => void;
}

let lootIdCounter = 0;

const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
const rarityWeights = [50, 30, 15, 4, 1]; // Probability weights

const itemPrefixes = {
  weapon: ['Sharp', 'Keen', 'Brutal', 'Swift', 'Deadly', 'Ancient', 'Cursed', 'Blessed'],
  armor: ['Sturdy', 'Light', 'Heavy', 'Reinforced', 'Magical', 'Dragon', 'Shadow', 'Holy']
};

const itemTypes = {
  weapon: ['Sword', 'Axe', 'Bow', 'Staff', 'Dagger', 'Mace'],
  armor: ['Helmet', 'Chestplate', 'Boots', 'Gauntlets', 'Shield', 'Cloak']
};

export const useLoot = create<LootState>((set, get) => ({
  items: [],

  spawnLoot: (position, rarity = 'common') => {
    const itemId = `loot_${++lootIdCounter}`;
    
    // Determine item type
    const isWeapon = Math.random() < 0.6;
    const itemType = isWeapon ? 'weapon' : 'armor';
    
    // Generate random name
    const prefixes = itemPrefixes[itemType];
    const types = itemTypes[itemType];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const name = `${prefix} ${type}`;
    
    // Generate stats based on rarity
    const statMultiplier = {
      common: 1,
      uncommon: 1.5,
      rare: 2,
      epic: 3,
      legendary: 5
    }[rarity] || 1;
    
    const stats: Record<string, number> = {};
    
    if (itemType === 'weapon') {
      stats.strength = Math.floor(getRandomInRange(2, 8) * statMultiplier);
      if (Math.random() < 0.3) {
        stats.dexterity = Math.floor(getRandomInRange(1, 4) * statMultiplier);
      }
    } else {
      stats.vitality = Math.floor(getRandomInRange(2, 6) * statMultiplier);
      if (Math.random() < 0.4) {
        const randomStat = ['strength', 'dexterity', 'intelligence'][Math.floor(Math.random() * 3)];
        stats[randomStat] = Math.floor(getRandomInRange(1, 3) * statMultiplier);
      }
    }
    
    const item: LootItem = {
      id: itemId,
      name,
      type: itemType,
      rarity,
      position,
      stats
    };
    
    set((state) => ({
      items: [...state.items, item]
    }));
    
    console.log(`Spawned ${rarity} ${name} at`, position);
  },

  removeItem: (itemId) => {
    set((state) => ({
      items: state.items.filter(item => item.id !== itemId)
    }));
  },

  generateRandomLoot: (position, playerLevel) => {
    const { spawnLoot } = get();
    
    // Determine rarity based on player level and random chance
    let rarity = 'common';
    const roll = Math.random() * 100;
    
    // Higher level players have better chances for rare items
    const levelBonus = Math.floor(playerLevel / 5);
    
    if (roll < 1 + levelBonus) {
      rarity = 'legendary';
    } else if (roll < 5 + levelBonus * 2) {
      rarity = 'epic';
    } else if (roll < 20 + levelBonus * 3) {
      rarity = 'rare';
    } else if (roll < 50 + levelBonus * 2) {
      rarity = 'uncommon';
    }
    
    spawnLoot(position, rarity);
  }
}));
