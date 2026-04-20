export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Stats {
  strength: number;
  dexterity: number;
  intelligence: number;
  vitality: number;
}

export interface Enemy {
  id: string;
  type: string;
  enemyClass?: 'rusher' | 'shield' | 'artillery' | 'summoner' | 'suppressor' | 'elite' | 'boss' | 'standard';
  position: Position;
  health: number;
  maxHealth: number;
  damage: number;
  speed: number;
  experience: number;
  lastAttackTime: number;
  resistances?: Partial<Record<'physical' | 'fire' | 'ice' | 'lightning' | 'arcane' | 'poison', number>>;
  weakPoint?: {
    heightOffset: number;
    bonusMultiplier: number;
  };
  lastElementHit?: 'physical' | 'fire' | 'ice' | 'lightning' | 'arcane' | 'poison';
}

export type ItemType =
  | 'weapon'
  | 'armor'
  | 'consumable'
  | 'potion'
  | 'scroll'
  | 'gem'
  | 'rune'
  | 'relic'
  | 'blueprint'
  | 'material'
  | 'accessory'
  | 'offhand'
  | 'grenade'
  | 'food'
  | 'artifact';

export interface LootItem {
  id: string;
  name: string;
  type: ItemType;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  position: Position;
  stats?: Record<string, number>;
  value?: number; // Sell value
  effect?: string; // For potions/scrolls/consumables
  description?: string; // Flavour text / lore
  socketSlots?: number; // For items that support gem sockets
  socketedGems?: string[]; // Gem IDs socketed into this item
  archetype?: 'assault' | 'smg' | 'shotgun' | 'sniper' | 'launcher' | 'beam' | 'melee-hybrid' | 'exotic';
  tags?: string[];
  affixes?: string[];
  legendaryEffect?: string;
  weaponProfile?: {
    fireMode: 'auto' | 'burst' | 'semi' | 'beam' | 'launcher' | 'melee';
    magazineSize: number;
    reloadMs: number;
    fireIntervalMs: number;
    spread: number;
    recoil: number;
    handling: number;
    pelletCount: number;
    projectileSpeed: number;
    projectileBehavior: {
      pierce: number;
      chain: number;
      ricochet: number;
      splashRadius: number;
      dotPerSecond: number;
      dotDurationMs: number;
      statusPayload?: 'burn' | 'freeze' | 'poison' | 'stun' | 'slow';
    };
  };
  balancing?: {
    itemLevel: number;
    worldTier: number;
    dpsScore: number;
    recoil: number;
    handling: number;
  };
}

export interface Projectile {
  id: string;
  position: Position;
  direction: Position;
  speed: number;
  damage: number;
  active: boolean;
  element?: 'fire' | 'ice' | 'lightning' | 'arcane';
  damageType?: 'physical' | 'fire' | 'ice' | 'lightning' | 'arcane' | 'poison';
  sourceArchetype?: 'assault' | 'smg' | 'shotgun' | 'sniper' | 'launcher' | 'beam' | 'melee-hybrid' | 'exotic';
  pierce?: number;
  chain?: number;
  ricochet?: number;
  splashRadius?: number;
  dotPerSecond?: number;
  dotDurationMs?: number;
  statusPayload?: 'burn' | 'freeze' | 'poison' | 'stun' | 'slow';
  maxRange?: number;
  spawnPosition: Position; // origin used for max-range check
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  description: string;
}

export interface Spell {
  id: string;
  name: string;
  level: number;
  manaCost: number;
  cooldown: number;
  damage?: number;
  effect?: string;
  element?: 'fire' | 'ice' | 'lightning' | 'arcane' | 'holy';
}

export interface StatusEffect {
  id: string;
  type: 'burn' | 'freeze' | 'poison' | 'stun' | 'slow' | 'heal' | 'shield';
  duration: number;
  value: number;
}

export interface Trap {
  id: string;
  position: Position;
  type: 'spike' | 'fire' | 'arrow' | 'poison';
  damage: number;
  triggered: boolean;
}

export interface SpawnPoint {
  position: Position;
  enemyType: string;
  cooldown: number;
  lastSpawn: number;
}
