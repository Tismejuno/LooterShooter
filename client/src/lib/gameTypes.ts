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
  position: Position;
  health: number;
  maxHealth: number;
  damage: number;
  speed: number;
  experience: number;
  lastAttackTime: number;
}

export interface LootItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'consumable' | 'potion' | 'scroll';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  position: Position;
  stats?: Record<string, number>;
  value?: number; // Sell value
  effect?: string; // For potions/scrolls
}

export interface Projectile {
  id: string;
  position: Position;
  direction: Position;
  speed: number;
  damage: number;
  active: boolean;
  element?: 'fire' | 'ice' | 'lightning' | 'arcane';
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
