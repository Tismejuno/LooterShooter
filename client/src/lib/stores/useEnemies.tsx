import { create } from "zustand";
import { Enemy, Position } from "../gameTypes";
import { getRandomInRange } from "../gameUtils";

interface EnemiesState {
  enemies: Enemy[];
  
  // Actions
  spawnEnemy: (position: Position, type?: string) => void;
  moveEnemy: (enemyId: string, position: Position) => void;
  damageEnemy: (enemyId: string, damage: number) => void;
  removeEnemy: (enemyId: string) => void;
  spawnWave: (playerLevel: number, biome?: string) => void;
}

let enemyIdCounter = 0;

// ─── ENEMY DATABASE ──────────────────────────────────────────────────────────
// Each entry: { health, damage, speed, experience }

const ENEMY_TYPES: Record<string, { health: number; damage: number; speed: number; experience: number }> = {
  // ── Crypt / Dungeon ──────────────────────────────────────
  zombie:          { health:  80, damage: 15, speed: 1.0, experience:  25 },
  skeleton:        { health:  60, damage: 20, speed: 1.5, experience:  30 },
  ghoul:           { health:  90, damage: 18, speed: 1.2, experience:  35 },
  wraith:          { health:  70, damage: 25, speed: 1.8, experience:  45 },
  lich_minion:     { health: 100, damage: 22, speed: 1.1, experience:  50 },
  bone_golem:      { health: 180, damage: 30, speed: 0.7, experience:  70 },
  // ── Forest ───────────────────────────────────────────────
  corrupted_wolf:  { health:  90, damage: 22, speed: 2.0, experience:  40 },
  thornling:       { health:  70, damage: 15, speed: 1.3, experience:  30 },
  vine_horror:     { health: 130, damage: 28, speed: 0.8, experience:  60 },
  druid_cultist:   { health: 110, damage: 30, speed: 1.4, experience:  65 },
  giant_spider:    { health: 100, damage: 25, speed: 1.6, experience:  55 },
  forest_golem:    { health: 200, damage: 35, speed: 0.7, experience:  80 },
  // ── Snow / Frozen Wastes ─────────────────────────────────
  frost_wraith:    { health: 110, damage: 30, speed: 1.7, experience:  75 },
  ice_golem:       { health: 220, damage: 38, speed: 0.6, experience:  90 },
  frost_giant:     { health: 300, damage: 45, speed: 0.9, experience: 110 },
  snow_wolf:       { health:  95, damage: 25, speed: 2.1, experience:  55 },
  blizzard_shade:  { health:  80, damage: 28, speed: 2.0, experience:  60 },
  frozen_knight:   { health: 170, damage: 40, speed: 1.0, experience:  95 },
  // ── Crystal Depths ───────────────────────────────────────
  crystal_golem:   { health: 250, damage: 42, speed: 0.7, experience: 115 },
  shard_sprite:    { health:  75, damage: 22, speed: 2.2, experience:  50 },
  mirror_copy:     { health: 150, damage: 35, speed: 1.5, experience: 100 },
  mind_weaver:     { health: 120, damage: 38, speed: 1.3, experience:  95 },
  resonance_fiend: { health: 140, damage: 32, speed: 1.4, experience:  85 },
  // ── Lava / Volcanic ──────────────────────────────────────
  fire_demon:      { health: 160, damage: 45, speed: 1.5, experience: 120 },
  lava_golem:      { health: 280, damage: 50, speed: 0.6, experience: 140 },
  ember_sprite:    { health:  90, damage: 30, speed: 2.0, experience:  65 },
  magma_brute:     { health: 230, damage: 48, speed: 0.8, experience: 130 },
  infernal_knight: { health: 200, damage: 55, speed: 1.2, experience: 150 },
  // ── Celestial Realm ──────────────────────────────────────
  storm_elemental: { health: 180, damage: 50, speed: 1.8, experience: 150 },
  divine_sentinel: { health: 250, damage: 60, speed: 1.3, experience: 180 },
  cloud_serpent:   { health: 200, damage: 45, speed: 1.6, experience: 155 },
  angelic_warden:  { health: 220, damage: 55, speed: 1.4, experience: 170 },
  // ── Void ─────────────────────────────────────────────────
  void_entity:     { health: 250, damage: 65, speed: 2.0, experience: 220 },
  void_colossus:   { health: 400, damage: 75, speed: 0.8, experience: 280 },
  reality_shatter: { health: 180, damage: 70, speed: 1.9, experience: 240 },
  // ── Shadowfell ───────────────────────────────────────────
  shadow_wraith:   { health: 280, damage: 72, speed: 2.2, experience: 260 },
  void_stalker:    { health: 220, damage: 68, speed: 2.4, experience: 250 },
  nightmare_hound: { health: 190, damage: 60, speed: 2.6, experience: 230 },
  shadow_colossus: { health: 480, damage: 85, speed: 0.9, experience: 340 },
  soul_harvester:  { health: 310, damage: 78, speed: 1.6, experience: 290 },
  umbral_knight:   { health: 350, damage: 80, speed: 1.3, experience: 310 },
  // ── Primordial Abyss ─────────────────────────────────────
  abyssal_serpent: { health: 360, damage: 88, speed: 1.8, experience: 380 },
  depth_crawler:   { health: 290, damage: 75, speed: 2.0, experience: 340 },
  pressure_golem:  { health: 550, damage: 95, speed: 0.6, experience: 450 },
  tide_horror:     { health: 420, damage: 90, speed: 1.4, experience: 410 },
  abyssal_warden:  { health: 480, damage: 100, speed: 1.2, experience: 460 },
  // ── Eternal Forge ────────────────────────────────────────
  forge_guardian:  { health: 500, damage: 100, speed: 1.1, experience: 520 },
  molten_dwarf:    { health: 320, damage: 85, speed: 1.7, experience: 440 },
  iron_sentinel:   { health: 600, damage: 110, speed: 0.8, experience: 560 },
  titan_colossus:  { health: 750, damage: 120, speed: 0.7, experience: 640 },
  forge_warden:    { health: 550, damage: 108, speed: 1.0, experience: 580 },
  // ── Generic / Boss stubs ─────────────────────────────────
  orc:             { health: 120, damage: 25, speed: 0.8, experience:  40 },
  demon:           { health: 200, damage: 35, speed: 2.0, experience:  75 },
  ancient_one:     { health:1000, damage: 80, speed: 1.5, experience:1000 },
  shadow_sovereign:{ health:1500, damage:110, speed: 1.8, experience:2000 },
  abyssal_leviathan:{ health:2000, damage:130, speed: 1.2, experience:3000 },
  forge_titan:     { health:2500, damage:150, speed: 1.0, experience:4000 },
};

// ─── ENEMY POOLS BY BIOME ────────────────────────────────────────────────────

const BIOME_POOLS: Record<string, string[]> = {
  dungeon:   ['zombie', 'skeleton', 'ghoul', 'wraith', 'lich_minion', 'bone_golem'],
  grassland: ['corrupted_wolf', 'thornling', 'vine_horror', 'druid_cultist', 'giant_spider', 'forest_golem'],
  snow:      ['frost_wraith', 'ice_golem', 'frost_giant', 'snow_wolf', 'blizzard_shade', 'frozen_knight'],
  crystal:   ['crystal_golem', 'shard_sprite', 'mirror_copy', 'mind_weaver', 'resonance_fiend'],
  lava:      ['fire_demon', 'lava_golem', 'ember_sprite', 'magma_brute', 'infernal_knight'],
  clouds:    ['storm_elemental', 'divine_sentinel', 'cloud_serpent', 'angelic_warden'],
  void:      ['void_entity', 'void_colossus', 'reality_shatter'],
  shadow:    ['shadow_wraith', 'void_stalker', 'nightmare_hound', 'soul_harvester', 'umbral_knight', 'shadow_colossus'],
  abyss:     ['depth_crawler', 'abyssal_serpent', 'tide_horror', 'abyssal_warden', 'pressure_golem'],
  forge:     ['molten_dwarf', 'forge_guardian', 'iron_sentinel', 'forge_warden', 'titan_colossus'],
};

function pickFromPool(pool: string[], playerLevel: number): string {
  // Filter pool to enemies that scale with level
  // Higher-index pool entries are stronger — unlock them as level grows
  const maxIndex = Math.min(pool.length - 1, Math.floor(playerLevel / 4));
  const available = pool.slice(0, maxIndex + 1);
  return available[Math.floor(Math.random() * available.length)];
}

function biomeForLevel(playerLevel: number): string {
  if (playerLevel >= 51) return 'forge';
  if (playerLevel >= 41) return 'abyss';
  if (playerLevel >= 31) return 'shadow';
  if (playerLevel >= 30) return 'void';
  if (playerLevel >= 26) return 'clouds';
  if (playerLevel >= 21) return 'lava';
  if (playerLevel >= 16) return 'crystal';
  if (playerLevel >= 11) return 'snow';
  if (playerLevel >= 6)  return 'grassland';
  return 'dungeon';
}

export const useEnemies = create<EnemiesState>((set, get) => ({
  enemies: [],

  spawnEnemy: (position, type = 'zombie') => {
    const template = ENEMY_TYPES[type] ?? ENEMY_TYPES.zombie;
    const enemyId = `enemy_${++enemyIdCounter}`;

    const enemy: Enemy = {
      id: enemyId,
      type,
      position,
      health: template.health,
      maxHealth: template.health,
      damage: template.damage,
      speed: template.speed,
      experience: template.experience,
      lastAttackTime: 0,
    };

    set((state) => ({ enemies: [...state.enemies, enemy] }));
  },

  moveEnemy: (enemyId, position) => {
    set((state) => ({
      enemies: state.enemies.map(enemy =>
        enemy.id === enemyId ? { ...enemy, position } : enemy
      ),
    }));
  },

  damageEnemy: (enemyId, damage) => {
    set((state) => {
      const enemies = state.enemies.map(enemy => {
        if (enemy.id === enemyId) {
          const newHealth = Math.max(0, enemy.health - damage);
          return { ...enemy, health: newHealth };
        }
        return enemy;
      });

      const deadEnemies = enemies.filter(e => e.health <= 0);
      deadEnemies.forEach(enemy => {
        console.log(`Enemy ${enemy.type} defeated! +${enemy.experience} XP`);
      });

      return { enemies: enemies.filter(e => e.health > 0) };
    });
  },

  removeEnemy: (enemyId) => {
    set((state) => ({
      enemies: state.enemies.filter(enemy => enemy.id !== enemyId),
    }));
  },

  spawnWave: (playerLevel, biome) => {
    const { spawnEnemy } = get();
    const enemyCount = Math.min(3 + Math.floor(playerLevel / 2), 12);
    const activeBiome = biome ?? biomeForLevel(playerLevel);
    const pool = BIOME_POOLS[activeBiome] ?? BIOME_POOLS.dungeon;

    // Clear existing enemies
    set({ enemies: [] });

    for (let i = 0; i < enemyCount; i++) {
      const angle = (i / enemyCount) * Math.PI * 2;
      const distance = getRandomInRange(8, 15);
      const position: Position = {
        x: Math.cos(angle) * distance,
        y: 0.5,
        z: Math.sin(angle) * distance,
      };

      const enemyType = pickFromPool(pool, playerLevel);
      spawnEnemy(position, enemyType);
    }

    console.log(`Spawned wave of ${enemyCount} enemies (biome: ${activeBiome}) for level ${playerLevel} player`);
  },
}));
