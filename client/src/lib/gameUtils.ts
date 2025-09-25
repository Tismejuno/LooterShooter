import { Position } from "./gameTypes";

export function getRandomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function getRandomColor(): string {
  const colors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
    '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function checkCollision(pos1: Position, pos2: Position, threshold: number): boolean {
  const dx = pos1.x - pos2.x;
  const dz = pos1.z - pos2.z;
  const distance = Math.sqrt(dx * dx + dz * dz);
  return distance < threshold;
}

export function generateRandomName(): string {
  const prefixes = [
    'Ancient', 'Mystic', 'Sacred', 'Cursed', 'Blessed', 'Dark', 'Light', 'Fire',
    'Ice', 'Thunder', 'Shadow', 'Divine', 'Demon', 'Dragon', 'Phoenix', 'Void'
  ];
  
  const suffixes = [
    'Blade', 'Staff', 'Shield', 'Armor', 'Ring', 'Amulet', 'Crown', 'Gauntlets',
    'Boots', 'Cloak', 'Orb', 'Crystal', 'Gem', 'Rune', 'Tome', 'Wand'
  ];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return `${prefix} ${suffix}`;
}

export function calculateDistance(pos1: Position, pos2: Position): number {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  const dz = pos1.z - pos2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function normalizeVector(vector: Position): Position {
  const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
  if (length === 0) return { x: 0, y: 0, z: 0 };
  
  return {
    x: vector.x / length,
    y: vector.y / length,
    z: vector.z / length
  };
}

export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
