import { create } from "zustand";
import { LootItem, Projectile, Position, Stats, Spell, StatusEffect } from "../gameTypes";

interface PlayerState {
  // Basic stats
  position: Position;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  level: number;
  experience: number;
  experienceToNext: number;
  skillPoints: number;
  
  // Currency
  gold: number;
  essence: number;
  crystals: number;
  
  // Player stats
  stats: Stats;
  
  // Inventory and equipment
  inventory: LootItem[];
  equipped: LootItem[];
  
  // Skills
  skills: Record<string, number>;
  
  // Spells
  spells: Spell[];
  equippedSpells: string[]; // Spell IDs in quick slots
  
  // Status effects
  statusEffects: StatusEffect[];
  
  // Combat
  projectiles: Projectile[];
  lastAttackTime: number;
  lastAbilityTime: Record<number, number>;
  
  // Actions
  movePlayer: (direction: { x: number; y: number; z: number }) => void;
  takeDamage: (damage: number) => void;
  gainExperience: (amount: number) => void;
  attack: () => void;
  castAbility: (abilityId: number) => void;
  castSpell: (spellId: string) => void;
  collectItem: (item: LootItem) => void;
  equipItem: (item: LootItem) => void;
  unequipItem: (itemId: string) => void;
  allocateSkillPoint: (skillId: string) => void;
  removeProjectile: (projectileId: string) => void;
  regenerate: () => void;
  addGold: (amount: number) => void;
  removeGold: (amount: number) => boolean;
  addStatusEffect: (effect: StatusEffect) => void;
  updateStatusEffects: (deltaTime: number) => void;
  upgradeSpell: (spellId: string) => boolean;
  equipSpell: (spellId: string, slot: number) => void;
  useConsumable: (item: LootItem) => void;
}

let projectileIdCounter = 0;

export const usePlayer = create<PlayerState>((set, get) => ({
  // Initial state
  position: { x: 0, y: 0.5, z: 0 },
  health: 100,
  maxHealth: 100,
  mana: 50,
  maxMana: 50,
  level: 1,
  experience: 0,
  experienceToNext: 100,
  skillPoints: 0,
  
  // Currency
  gold: 100,
  essence: 0,
  crystals: 0,
  
  stats: {
    strength: 10,
    dexterity: 10,
    intelligence: 10,
    vitality: 10
  },
  
  inventory: [],
  equipped: [],
  skills: {},
  
  // Spells
  spells: [
    {
      id: 'fireball',
      name: 'Fireball',
      level: 1,
      manaCost: 20,
      cooldown: 3000,
      damage: 30,
      element: 'fire'
    }
  ],
  equippedSpells: ['fireball', '', '', ''],
  
  statusEffects: [],
  projectiles: [],
  lastAttackTime: 0,
  lastAbilityTime: {},

  movePlayer: (direction) => {
    set((state) => {
      const speed = 0.2;
      return {
        position: {
          x: state.position.x + direction.x * speed,
          y: state.position.y,
          z: state.position.z + direction.z * speed
        }
      };
    });
  },

  takeDamage: (damage) => {
    set((state) => ({
      health: Math.max(0, state.health - damage)
    }));
  },

  gainExperience: (amount) => {
    set((state) => {
      const newExp = state.experience + amount;
      let newLevel = state.level;
      let newSkillPoints = state.skillPoints;
      let expToNext = state.experienceToNext;
      
      if (newExp >= expToNext) {
        newLevel += 1;
        newSkillPoints += 2; // 2 skill points per level
        expToNext = newLevel * 100; // Increasing XP requirement
        
        // Level up bonuses
        const newStats = { ...state.stats };
        newStats.vitality += 2;
        newStats.strength += 1;
        newStats.dexterity += 1;
        newStats.intelligence += 1;
        
        return {
          experience: newExp - state.experienceToNext,
          level: newLevel,
          skillPoints: newSkillPoints,
          experienceToNext: expToNext,
          stats: newStats,
          maxHealth: state.maxHealth + 20,
          health: state.health + 20,
          maxMana: state.maxMana + 10,
          mana: state.mana + 10
        };
      }
      
      return { experience: newExp };
    });
  },

  attack: () => {
    const now = Date.now();
    const state = get();
    
    if (now - state.lastAttackTime < 500) return; // Attack cooldown
    
    const projectileId = `projectile_${++projectileIdCounter}`;
    const projectile: Projectile = {
      id: projectileId,
      position: { ...state.position },
      direction: { x: 0, y: 0, z: -1 }, // Forward direction
      speed: 20,
      damage: state.stats.strength * 2 + 10,
      active: true
    };
    
    set((state) => ({
      projectiles: [...state.projectiles, projectile],
      lastAttackTime: now
    }));
  },

  castAbility: (abilityId) => {
    const now = Date.now();
    const state = get();
    const lastCast = state.lastAbilityTime[abilityId] || 0;
    
    // Different cooldowns for different abilities
    const cooldowns = { 1: 2000, 2: 3000, 3: 5000 };
    if (now - lastCast < cooldowns[abilityId as keyof typeof cooldowns]) return;
    
    // Different mana costs
    const manaCosts = { 1: 10, 2: 15, 3: 25 };
    const cost = manaCosts[abilityId as keyof typeof manaCosts];
    
    if (state.mana < cost) return;
    
    // Create ability projectile
    const projectileId = `ability_${abilityId}_${++projectileIdCounter}`;
    const projectile: Projectile = {
      id: projectileId,
      position: { ...state.position },
      direction: { x: 0, y: 0, z: -1 },
      speed: 15,
      damage: state.stats.intelligence * 3 + 20,
      active: true
    };
    
    set((state) => ({
      projectiles: [...state.projectiles, projectile],
      mana: state.mana - cost,
      lastAbilityTime: { ...state.lastAbilityTime, [abilityId]: now }
    }));
  },

  collectItem: (item) => {
    set((state) => {
      if (state.inventory.length >= 30) return {}; // Inventory limit
      
      return {
        inventory: [...state.inventory, item]
      };
    });
  },

  equipItem: (item) => {
    set((state) => {
      // Remove any existing item of the same type
      const filteredEquipped = state.equipped.filter(eq => eq.type !== item.type);
      
      // Apply item stats
      const newStats = { ...state.stats };
      if (item.stats) {
        Object.entries(item.stats).forEach(([stat, value]) => {
          if (stat in newStats) {
            (newStats as any)[stat] += value;
          }
        });
      }
      
      return {
        equipped: [...filteredEquipped, item],
        stats: newStats
      };
    });
  },

  unequipItem: (itemId) => {
    set((state) => {
      const item = state.equipped.find(eq => eq.id === itemId);
      if (!item) return {};
      
      // Remove item stats
      const newStats = { ...state.stats };
      if (item.stats) {
        Object.entries(item.stats).forEach(([stat, value]) => {
          if (stat in newStats) {
            (newStats as any)[stat] = Math.max(1, (newStats as any)[stat] - value);
          }
        });
      }
      
      return {
        equipped: state.equipped.filter(eq => eq.id !== itemId),
        stats: newStats
      };
    });
  },

  allocateSkillPoint: (skillId) => {
    set((state) => {
      if (state.skillPoints <= 0) return {};
      
      const currentLevel = state.skills[skillId] || 0;
      if (currentLevel >= 5) return {}; // Max skill level
      
      return {
        skills: { ...state.skills, [skillId]: currentLevel + 1 },
        skillPoints: state.skillPoints - 1
      };
    });
  },

  removeProjectile: (projectileId) => {
    set((state) => ({
      projectiles: state.projectiles.filter(p => p.id !== projectileId)
    }));
  },

  regenerate: () => {
    set((state) => {
      const hasRegenSkill = (state.skills.regeneration || 0) > 0;
      if (!hasRegenSkill) return {};
      
      const regenAmount = state.skills.regeneration * 2;
      const manaRegenAmount = 1;
      
      return {
        health: Math.min(state.maxHealth, state.health + regenAmount),
        mana: Math.min(state.maxMana, state.mana + manaRegenAmount)
      };
    });
  },

  addGold: (amount) => {
    set((state) => ({
      gold: state.gold + amount
    }));
  },

  removeGold: (amount) => {
    const state = get();
    if (state.gold >= amount) {
      set({ gold: state.gold - amount });
      return true;
    }
    return false;
  },

  addStatusEffect: (effect) => {
    set((state) => ({
      statusEffects: [...state.statusEffects, effect]
    }));
  },

  updateStatusEffects: (deltaTime) => {
    set((state) => {
      let damageTotal = 0;
      const updatedEffects: StatusEffect[] = [];
      
      state.statusEffects.forEach(effect => {
        const newDuration = effect.duration - deltaTime * 1000;
        
        if (newDuration > 0) {
          if (effect.type === 'burn' || effect.type === 'poison') {
            damageTotal += effect.value * (deltaTime / 1000);
          }
          
          updatedEffects.push({
            ...effect,
            duration: newDuration
          });
        }
      });
      
      return {
        statusEffects: updatedEffects,
        health: Math.max(0, state.health - damageTotal)
      };
    });
  },

  castSpell: (spellId) => {
    const state = get();
    const spell = state.spells.find(s => s.id === spellId);
    if (!spell) return;
    
    const now = Date.now();
    const lastCast = (state.lastAbilityTime as Record<string, number>)[spellId] || 0;
    
    if (now - lastCast < spell.cooldown) return;
    if (state.mana < spell.manaCost) return;
    
    const projectileId = `spell_${spellId}_${++projectileIdCounter}`;
    const element = spell.element === 'holy' ? 'arcane' : spell.element; // Convert holy to arcane for projectile
    const projectile: Projectile = {
      id: projectileId,
      position: { ...state.position },
      direction: { x: 0, y: 0, z: -1 },
      speed: 15,
      damage: spell.damage || 0,
      active: true,
      element
    };
    
    set((state) => ({
      projectiles: [...state.projectiles, projectile],
      mana: state.mana - spell.manaCost,
      lastAbilityTime: { ...state.lastAbilityTime, [spellId]: now }
    }));
  },

  upgradeSpell: (spellId) => {
    const state = get();
    const spell = state.spells.find(s => s.id === spellId);
    if (!spell) return false;
    
    const upgradeCost = 100 * spell.level;
    if (state.gold < upgradeCost) return false;
    
    set((state) => ({
      spells: state.spells.map(s =>
        s.id === spellId
          ? {
              ...s,
              level: s.level + 1,
              damage: s.damage ? s.damage + 10 : undefined,
              manaCost: Math.max(5, s.manaCost - 2)
            }
          : s
      ),
      gold: state.gold - upgradeCost
    }));
    
    return true;
  },

  equipSpell: (spellId, slot) => {
    set((state) => {
      const newEquipped = [...state.equippedSpells];
      newEquipped[slot] = spellId;
      return { equippedSpells: newEquipped };
    });
  },

  useConsumable: (item) => {
    if (item.type !== 'potion' && item.type !== 'scroll' && item.type !== 'consumable') return;
    
    set((state) => {
      const updates: Partial<PlayerState> = {
        inventory: state.inventory.filter(i => i.id !== item.id)
      };
      
      // Apply consumable effects
      if (item.effect === 'restore_health') {
        updates.health = Math.min(state.maxHealth, state.health + (item.stats?.power || 50));
      } else if (item.effect === 'restore_mana') {
        updates.mana = Math.min(state.maxMana, state.mana + (item.stats?.power || 30));
      }
      
      return updates;
    });
  }
}));
