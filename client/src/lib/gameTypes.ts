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
  type: 'weapon' | 'armor' | 'consumable';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  position: Position;
  stats?: Record<string, number>;
}

export interface Projectile {
  id: string;
  position: Position;
  direction: Position;
  speed: number;
  damage: number;
  active: boolean;
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  description: string;
}
