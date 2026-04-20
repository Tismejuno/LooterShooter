import { create } from "zustand";
import { LootItem, Projectile, Position, Stats, Spell, StatusEffect } from "../gameTypes";
import { WEAPON_ARCHETYPE_PROFILES } from "../content/weaponContent";

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
  weaponMagazine: number;
  weaponReloadingUntil: number;
  lastAbilityTime: Record<number, number>;
  
  // Aim direction (set by Player component from mouse raycasting)
  aimDirection: { x: number; y: number; z: number };

  // Actions
  movePlayer: (direction: { x: number; y: number; z: number }) => void;
  setAimDirection: (direction: { x: number; y: number; z: number }) => void;
  takeDamage: (damage: number) => void;
  gainExperience: (amount: number) => void;
  attack: (direction?: { x: number; y: number; z: number }) => void;
  getAttackCooldownMs: () => number;
  castAbility: (abilityId: number, direction?: { x: number; y: number; z: number }) => void;
  castSpell: (spellId: string, direction?: { x: number; y: number; z: number }) => void;
  collectItem: (item: LootItem) => void;
  equipItem: (item: LootItem) => void;
  unequipItem: (itemId: string) => void;
  allocateSkillPoint: (skillId: string) => void;
  removeProjectile: (projectileId: string) => void;
  regenerate: () => void;
  addGold: (amount: number) => void;
  removeGold: (amount: number) => boolean;
  addEssence: (amount: number) => void;
  addCrystals: (amount: number) => void;
  addStatusEffect: (effect: StatusEffect) => void;
  updateStatusEffects: (deltaTime: number) => void;
  upgradeSpell: (spellId: string) => boolean;
  equipSpell: (spellId: string, slot: number) => void;
  useConsumable: (item: LootItem) => void;
}

let projectileIdCounter = 0;

const DEFAULT_WEAPON_PROFILE = WEAPON_ARCHETYPE_PROFILES.assault;

function normalizeDirection(direction: { x: number; y: number; z: number }): { x: number; y: number; z: number } {
  const length = Math.sqrt(direction.x * direction.x + direction.z * direction.z) || 1;
  return { x: direction.x / length, y: 0, z: direction.z / length };
}

function applySpread(
  baseDirection: { x: number; y: number; z: number },
  spreadAmount: number
): { x: number; y: number; z: number } {
  const yaw = Math.atan2(baseDirection.x, baseDirection.z);
  const jitter = (Math.random() - 0.5) * spreadAmount;
  const outYaw = yaw + jitter;
  return { x: Math.sin(outYaw), y: 0, z: Math.cos(outYaw) };
}

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
  weaponMagazine: DEFAULT_WEAPON_PROFILE.magazineSize,
  weaponReloadingUntil: 0,
  lastAbilityTime: {},

  // Default aim forward (-Z)
  aimDirection: { x: 0, y: 0, z: -1 },

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

  setAimDirection: (direction) => {
    set({ aimDirection: direction });
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

  getAttackCooldownMs: () => {
    const state = get();
    const equippedWeapon = state.equipped.find((item) => item.type === "weapon");
    return equippedWeapon?.weaponProfile?.fireIntervalMs ?? DEFAULT_WEAPON_PROFILE.fireIntervalMs;
  },

  attack: (direction) => {
    const now = Date.now();
    const state = get();

    const equippedWeapon = state.equipped.find((item) => item.type === "weapon");
    const weaponProfile = equippedWeapon?.weaponProfile ?? DEFAULT_WEAPON_PROFILE;
    const weaponArchetype = equippedWeapon?.archetype ?? DEFAULT_WEAPON_PROFILE.archetype;

    if (now < state.weaponReloadingUntil) return;
    if (now - state.lastAttackTime < weaponProfile.fireIntervalMs) return;

    // Use provided direction, or current aim direction, or fallback forward
    const baseDir = normalizeDirection(direction || state.aimDirection || { x: 0, y: 0, z: -1 });

    if (state.weaponMagazine <= 0) {
      set({
        weaponReloadingUntil: now + weaponProfile.reloadMs,
        weaponMagazine: weaponProfile.magazineSize,
      });
      return;
    }

    const baseDamage = equippedWeapon?.stats?.weaponDamage ?? (state.stats.strength * 2 + 10);
    const projectilePayload = {
      speed: weaponProfile.projectileSpeed,
      pierce: weaponProfile.projectileBehavior.pierce,
      chain: weaponProfile.projectileBehavior.chain,
      ricochet: weaponProfile.projectileBehavior.ricochet,
      splashRadius: weaponProfile.projectileBehavior.splashRadius,
      dotPerSecond: weaponProfile.projectileBehavior.dotPerSecond,
      dotDurationMs: weaponProfile.projectileBehavior.dotDurationMs,
      statusPayload: weaponProfile.projectileBehavior.statusPayload,
      sourceArchetype: weaponArchetype,
      maxRange: weaponArchetype === "sniper" ? 60 : weaponArchetype === "melee-hybrid" ? 10 : 35,
      damageType: weaponArchetype === "beam" ? "arcane" : weaponArchetype === "launcher" ? "fire" : "physical",
    } as const;

    const projectileCount =
      weaponArchetype === "shotgun"
        ? Math.max(1, weaponProfile.pelletCount)
        : weaponArchetype === "melee-hybrid"
          ? 3
          : weaponProfile.fireMode === "burst"
            ? 3
            : 1;

    const projectiles: Projectile[] = [];
    for (let i = 0; i < projectileCount; i++) {
      const projectileId = `projectile_${++projectileIdCounter}`;
      const fireDirection = applySpread(baseDir, weaponProfile.spread);
      projectiles.push({
        id: projectileId,
        position: { ...state.position },
        spawnPosition: { ...state.position },
        direction: fireDirection,
        speed: projectilePayload.speed,
        damage: Math.max(1, Math.floor(baseDamage / Math.max(1, weaponArchetype === "shotgun" ? 3 : 1))),
        active: true,
        damageType: projectilePayload.damageType,
        sourceArchetype: projectilePayload.sourceArchetype,
        pierce: projectilePayload.pierce,
        chain: projectilePayload.chain,
        ricochet: projectilePayload.ricochet,
        splashRadius: projectilePayload.splashRadius,
        dotPerSecond: projectilePayload.dotPerSecond,
        dotDurationMs: projectilePayload.dotDurationMs,
        statusPayload: projectilePayload.statusPayload,
        maxRange: projectilePayload.maxRange,
      });
    }

    if (equippedWeapon?.legendaryEffect?.includes("chain")) {
      projectiles.forEach((p) => {
        p.chain = (p.chain ?? 0) + 1;
      });
    }
    if (equippedWeapon?.legendaryEffect?.includes("detonation")) {
      projectiles.forEach((p) => {
        p.splashRadius = Math.max(2, (p.splashRadius ?? 0) + 1.5);
      });
    }

    const nextMagazine = state.weaponMagazine - 1;
    set((state) => ({
      projectiles: [...state.projectiles, ...projectiles],
      lastAttackTime: now,
      weaponMagazine: nextMagazine <= 0 ? weaponProfile.magazineSize : nextMagazine,
      weaponReloadingUntil: nextMagazine <= 0 ? now + weaponProfile.reloadMs : state.weaponReloadingUntil,
    }));
  },

  castAbility: (abilityId, direction) => {
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
    
    // Use provided direction, or current aim direction, or fallback forward
    const dir = direction || state.aimDirection || { x: 0, y: 0, z: -1 };

    // Ability-specific element mapping
    const elements: Record<number, Projectile['element']> = { 1: 'fire', 2: 'ice', 3: 'arcane' };

    // Create ability projectile
    const projectileId = `ability_${abilityId}_${++projectileIdCounter}`;
    const projectile: Projectile = {
      id: projectileId,
      position: { ...state.position },
      spawnPosition: { ...state.position },
      direction: dir,
      speed: 15,
      damage: state.stats.intelligence * 3 + 20,
      active: true,
      element: elements[abilityId],
      damageType: elements[abilityId] === "fire" ? "fire" : elements[abilityId] === "ice" ? "ice" : "arcane",
      maxRange: 40,
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
      // Items that can't be equipped (consumables, materials, etc.)
      const equipableTypes = ['weapon', 'armor', 'accessory', 'offhand', 'relic', 'artifact'];
      if (!equipableTypes.includes(item.type)) return {};

      // Accessories stack up to 2 rings; other types replace
      let newEquipped: typeof state.equipped;
      if (item.type === 'accessory') {
        const rings = state.equipped.filter(eq => eq.type === 'accessory');
        if (rings.length >= 2) {
          // Remove oldest ring
          const oldest = rings[0];
          newEquipped = state.equipped.filter(eq => eq.id !== oldest.id);
        } else {
          newEquipped = [...state.equipped];
        }
      } else {
        newEquipped = state.equipped.filter(eq => eq.type !== item.type);
      }
      
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
        equipped: [...newEquipped, item],
        stats: newStats,
        weaponMagazine: item.type === "weapon" ? (item.weaponProfile?.magazineSize ?? DEFAULT_WEAPON_PROFILE.magazineSize) : state.weaponMagazine,
        weaponReloadingUntil: item.type === "weapon" ? 0 : state.weaponReloadingUntil,
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
        stats: newStats,
        weaponMagazine: item.type === "weapon" ? DEFAULT_WEAPON_PROFILE.magazineSize : state.weaponMagazine,
        weaponReloadingUntil: item.type === "weapon" ? 0 : state.weaponReloadingUntil,
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

  addEssence: (amount) => {
    set((state) => ({ essence: state.essence + amount }));
  },

  addCrystals: (amount) => {
    set((state) => ({ crystals: state.crystals + amount }));
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

  castSpell: (spellId, direction) => {
    const state = get();
    const spell = state.spells.find(s => s.id === spellId);
    if (!spell) return;
    
    const now = Date.now();
    const lastCast = (state.lastAbilityTime as Record<string, number>)[spellId] || 0;
    
    if (now - lastCast < spell.cooldown) return;
    if (state.mana < spell.manaCost) return;
    
    // Use provided direction, or current aim direction, or fallback forward
    const dir = direction || state.aimDirection || { x: 0, y: 0, z: -1 };

    const projectileId = `spell_${spellId}_${++projectileIdCounter}`;
    const element = spell.element === 'holy' ? 'arcane' : spell.element; // Convert holy to arcane for projectile
    const projectile: Projectile = {
      id: projectileId,
      position: { ...state.position },
      spawnPosition: { ...state.position },
      direction: dir,
      speed: 15,
      damage: spell.damage || 0,
      active: true,
      element,
      damageType: element === "fire" ? "fire" : element === "ice" ? "ice" : element === "lightning" ? "lightning" : "arcane",
      maxRange: 45,
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
    const consumableTypes = ['potion', 'scroll', 'consumable', 'food', 'grenade'];
    if (!consumableTypes.includes(item.type)) return;
    
    set((state) => {
      const updates: Partial<PlayerState> = {
        inventory: state.inventory.filter(i => i.id !== item.id)
      };
      
      const power = item.stats?.power || 50;

      // Apply consumable effects
      switch (item.effect) {
        case 'restore_health':
          updates.health = Math.min(state.maxHealth, state.health + power);
          break;
        case 'restore_mana':
          updates.mana = Math.min(state.maxMana, state.mana + power);
          break;
        case 'regen_both':
          updates.health = Math.min(state.maxHealth, state.health + power * 0.5);
          updates.mana = Math.min(state.maxMana, state.mana + power * 0.5);
          break;
        case 'full_restore':
          updates.health = state.maxHealth;
          updates.mana = state.maxMana;
          break;
        case 'boost_strength': {
          const ns = { ...state.stats };
          ns.strength = Math.min(ns.strength + Math.floor(power / 5), ns.strength + 20);
          updates.stats = ns;
          break;
        }
        case 'boost_intelligence': {
          const ns = { ...state.stats };
          ns.intelligence = Math.min(ns.intelligence + Math.floor(power / 5), ns.intelligence + 20);
          updates.stats = ns;
          break;
        }
        // Grenade and scroll effects — brief projectile / AoE would be handled by game loop
        // For now they consume the item; actual combat effects are triggered by game loop
        default:
          break;
      }
      
      return updates;
    });
  }
}));
