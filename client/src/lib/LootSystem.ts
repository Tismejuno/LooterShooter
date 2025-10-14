import { LootItem, Position } from "./gameTypes";

export interface ItemModifier {
  stat: string;
  value: number;
  type: 'flat' | 'percentage';
}

export interface LootTable {
  rarity: LootItem['rarity'];
  weight: number;
  minLevel: number;
}

let itemIdCounter = 0;

export class LootSystem {
  private static itemPrefixes = {
    weapon: ['Sharp', 'Keen', 'Brutal', 'Swift', 'Deadly', 'Ancient', 'Cursed', 'Blessed', 'Vengeful', 'Divine'],
    armor: ['Sturdy', 'Light', 'Heavy', 'Reinforced', 'Magical', 'Dragon', 'Shadow', 'Holy', 'Ethereal', 'Titan'],
    potion: ['Minor', 'Lesser', 'Greater', 'Major', 'Superior', 'Divine'],
    scroll: ['Scroll of', 'Tome of', 'Grimoire of', 'Codex of']
  };
  
  private static itemTypes = {
    weapon: ['Sword', 'Axe', 'Bow', 'Staff', 'Dagger', 'Mace', 'Spear', 'Hammer', 'Wand'],
    armor: ['Helmet', 'Chestplate', 'Boots', 'Gauntlets', 'Shield', 'Cloak', 'Belt', 'Ring'],
    potion: ['Health Potion', 'Mana Potion', 'Strength Elixir', 'Defense Tonic', 'Speed Draught'],
    scroll: ['Fireball', 'Lightning', 'Ice Storm', 'Healing', 'Teleportation', 'Summoning']
  };
  
  private static rarityValues = {
    common: { multiplier: 1, color: '#ffffff', sellValue: 10 },
    uncommon: { multiplier: 1.5, color: '#1eff00', sellValue: 25 },
    rare: { multiplier: 2, color: '#0070dd', sellValue: 50 },
    epic: { multiplier: 3, color: '#a335ee', sellValue: 100 },
    legendary: { multiplier: 5, color: '#ff8000', sellValue: 250 }
  };
  
  static generateItem(
    position: Position,
    rarity: LootItem['rarity'],
    itemType?: LootItem['type'],
    playerLevel: number = 1
  ): LootItem {
    const type = itemType || this.randomItemType();
    const name = this.generateItemName(type, rarity);
    const stats = this.generateStats(type, rarity, playerLevel);
    const value = this.calculateValue(type, rarity, stats);
    
    const item: LootItem = {
      id: `item_${++itemIdCounter}`,
      name,
      type,
      rarity,
      position,
      stats,
      value
    };
    
    // Add special effects for consumables
    if (type === 'potion' || type === 'scroll') {
      item.effect = this.generateEffect(type, name);
    }
    
    return item;
  }
  
  private static randomItemType(): LootItem['type'] {
    const types: LootItem['type'][] = ['weapon', 'armor', 'potion', 'scroll'];
    const weights = [35, 35, 20, 10]; // % chance
    
    const roll = Math.random() * 100;
    let cumulative = 0;
    
    for (let i = 0; i < types.length; i++) {
      cumulative += weights[i];
      if (roll < cumulative) {
        return types[i];
      }
    }
    
    return 'weapon';
  }
  
  private static generateItemName(type: LootItem['type'], rarity: LootItem['rarity']): string {
    const validTypes = type === 'consumable' ? 'potion' : type;
    const prefixes = this.itemPrefixes[validTypes as keyof typeof this.itemPrefixes] || this.itemPrefixes.weapon;
    const types = this.itemTypes[validTypes as keyof typeof this.itemTypes] || this.itemTypes.weapon;
    
    if (type === 'potion' || type === 'consumable') {
      const prefix = prefixes[Math.min(Math.floor(Math.random() * prefixes.length), prefixes.length - 1)];
      const potionType = types[Math.floor(Math.random() * types.length)];
      return `${prefix} ${potionType}`;
    }
    
    if (type === 'scroll') {
      const scrollType = types[Math.floor(Math.random() * types.length)];
      return `Scroll of ${scrollType}`;
    }
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const itemType = types[Math.floor(Math.random() * types.length)];
    
    // Legendary items get special names
    if (rarity === 'legendary') {
      const legendaryNames = ['Excalibur', 'Mjolnir', 'Aegis', 'Gungnir', 'Durandal'];
      return legendaryNames[Math.floor(Math.random() * legendaryNames.length)];
    }
    
    return `${prefix} ${itemType}`;
  }
  
  private static generateStats(
    type: LootItem['type'],
    rarity: LootItem['rarity'],
    playerLevel: number
  ): Record<string, number> {
    const stats: Record<string, number> = {};
    const multiplier = this.rarityValues[rarity].multiplier * (1 + playerLevel * 0.1);
    
    if (type === 'weapon') {
      stats.strength = Math.floor((3 + Math.random() * 7) * multiplier);
      
      if (Math.random() < 0.4) {
        stats.dexterity = Math.floor((2 + Math.random() * 4) * multiplier);
      }
      
      if (rarity === 'epic' || rarity === 'legendary') {
        stats.critChance = Math.floor(5 + Math.random() * 10);
        if (Math.random() < 0.5) {
          stats.intelligence = Math.floor((1 + Math.random() * 3) * multiplier);
        }
      }
    } else if (type === 'armor') {
      stats.vitality = Math.floor((3 + Math.random() * 6) * multiplier);
      
      const randomStat = ['strength', 'dexterity', 'intelligence'][Math.floor(Math.random() * 3)];
      stats[randomStat] = Math.floor((2 + Math.random() * 4) * multiplier);
      
      if (rarity === 'rare' || rarity === 'epic' || rarity === 'legendary') {
        stats.armor = Math.floor((5 + Math.random() * 15) * multiplier);
      }
    } else if (type === 'potion' || type === 'scroll') {
      // Consumables have effect power
      stats.power = Math.floor((10 + Math.random() * 20) * multiplier);
    }
    
    return stats;
  }
  
  private static generateEffect(type: LootItem['type'], name: string): string {
    if (type === 'potion') {
      if (name.includes('Health')) return 'restore_health';
      if (name.includes('Mana')) return 'restore_mana';
      if (name.includes('Strength')) return 'boost_strength';
      if (name.includes('Defense')) return 'boost_defense';
      if (name.includes('Speed')) return 'boost_speed';
    } else if (type === 'scroll') {
      if (name.includes('Fireball')) return 'cast_fireball';
      if (name.includes('Lightning')) return 'cast_lightning';
      if (name.includes('Ice')) return 'cast_ice_storm';
      if (name.includes('Healing')) return 'cast_heal';
      if (name.includes('Teleportation')) return 'cast_teleport';
      if (name.includes('Summoning')) return 'cast_summon';
    }
    
    return 'unknown';
  }
  
  private static calculateValue(
    type: LootItem['type'],
    rarity: LootItem['rarity'],
    stats: Record<string, number>
  ): number {
    const baseValue = this.rarityValues[rarity].sellValue;
    const statValue = Object.values(stats).reduce((sum, val) => sum + val, 0);
    
    return Math.floor(baseValue + statValue * 2);
  }
  
  static rollRarity(playerLevel: number, luckModifier: number = 0): LootItem['rarity'] {
    const roll = Math.random() * 100 + luckModifier;
    const levelBonus = Math.floor(playerLevel / 5);
    
    if (roll < 1 + levelBonus) return 'legendary';
    if (roll < 5 + levelBonus * 2) return 'epic';
    if (roll < 20 + levelBonus * 3) return 'rare';
    if (roll < 50 + levelBonus * 2) return 'uncommon';
    return 'common';
  }
  
  static applyModifiers(item: LootItem, modifiers: ItemModifier[]): LootItem {
    const newStats = { ...item.stats };
    
    modifiers.forEach(modifier => {
      if (newStats && modifier.stat in newStats) {
        if (modifier.type === 'flat') {
          newStats[modifier.stat] += modifier.value;
        } else {
          newStats[modifier.stat] = Math.floor(newStats[modifier.stat] * (1 + modifier.value / 100));
        }
      }
    });
    
    return {
      ...item,
      stats: newStats,
      value: this.calculateValue(item.type, item.rarity, newStats)
    };
  }
}
