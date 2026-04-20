import { create } from "zustand";
import { Enemy, Position } from "../gameTypes";
import { getRandomInRange } from "../gameUtils";

interface EnemiesState {
  enemies: Enemy[];
  
  // Actions
  spawnEnemy: (position: Position, type?: string) => void;
  moveEnemy: (enemyId: string, position: Position) => void;
  damageEnemy: (enemyId: string, damage: number) => void;
  applyDamage: (
    enemyId: string,
    payload: {
      damage: number;
      damageType?: "physical" | "fire" | "ice" | "lightning" | "arcane" | "poison";
      hitPosition?: Position;
    }
  ) => { finalDamage: number; killed: boolean; weakPoint: boolean };
  removeEnemy: (enemyId: string) => void;
  spawnWave: (playerLevel: number, biome?: string) => void;
}

let enemyIdCounter = 0;

// ─── ENEMY DATABASE ──────────────────────────────────────────────────────────
// Each entry: { health, damage, speed, experience }

const ENEMY_TYPES: Record<string, { health: number; damage: number; speed: number; experience: number; enemyClass: Enemy["enemyClass"] }> = {
  // ── Crypt / Dungeon ──────────────────────────────────────
  zombie:          { health:  80, damage: 15, speed: 1.0, experience:  25, enemyClass: "standard" },
  skeleton:        { health:  60, damage: 20, speed: 1.5, experience:  30, enemyClass: "rusher" },
  ghoul:           { health:  90, damage: 18, speed: 1.2, experience:  35, enemyClass: "rusher" },
  wraith:          { health:  70, damage: 25, speed: 1.8, experience:  45, enemyClass: "suppressor" },
  lich_minion:     { health: 100, damage: 22, speed: 1.1, experience:  50, enemyClass: "summoner" },
  bone_golem:      { health: 180, damage: 30, speed: 0.7, experience:  70, enemyClass: "shield" },
  // ── Forest ───────────────────────────────────────────────
  corrupted_wolf:  { health:  90, damage: 22, speed: 2.0, experience:  40, enemyClass: "rusher" },
  thornling:       { health:  70, damage: 15, speed: 1.3, experience:  30, enemyClass: "standard" },
  vine_horror:     { health: 130, damage: 28, speed: 0.8, experience:  60, enemyClass: "shield" },
  druid_cultist:   { health: 110, damage: 30, speed: 1.4, experience:  65, enemyClass: "artillery" },
  giant_spider:    { health: 100, damage: 25, speed: 1.6, experience:  55, enemyClass: "rusher" },
  forest_golem:    { health: 200, damage: 35, speed: 0.7, experience:  80, enemyClass: "elite" },
  // ── Snow / Frozen Wastes ─────────────────────────────────
  frost_wraith:    { health: 110, damage: 30, speed: 1.7, experience:  75, enemyClass: "suppressor" },
  ice_golem:       { health: 220, damage: 38, speed: 0.6, experience:  90, enemyClass: "shield" },
  frost_giant:     { health: 300, damage: 45, speed: 0.9, experience: 110, enemyClass: "elite" },
  snow_wolf:       { health:  95, damage: 25, speed: 2.1, experience:  55, enemyClass: "rusher" },
  blizzard_shade:  { health:  80, damage: 28, speed: 2.0, experience:  60, enemyClass: "artillery" },
  frozen_knight:   { health: 170, damage: 40, speed: 1.0, experience:  95, enemyClass: "standard" },
  // ── Crystal Depths ───────────────────────────────────────
  crystal_golem:   { health: 250, damage: 42, speed: 0.7, experience: 115, enemyClass: "shield" },
  shard_sprite:    { health:  75, damage: 22, speed: 2.2, experience:  50, enemyClass: "rusher" },
  mirror_copy:     { health: 150, damage: 35, speed: 1.5, experience: 100, enemyClass: "suppressor" },
  mind_weaver:     { health: 120, damage: 38, speed: 1.3, experience:  95, enemyClass: "summoner" },
  resonance_fiend: { health: 140, damage: 32, speed: 1.4, experience:  85, enemyClass: "artillery" },
  // ── Lava / Volcanic ──────────────────────────────────────
  fire_demon:      { health: 160, damage: 45, speed: 1.5, experience: 120, enemyClass: "rusher" },
  lava_golem:      { health: 280, damage: 50, speed: 0.6, experience: 140, enemyClass: "shield" },
  ember_sprite:    { health:  90, damage: 30, speed: 2.0, experience:  65, enemyClass: "artillery" },
  magma_brute:     { health: 230, damage: 48, speed: 0.8, experience: 130, enemyClass: "elite" },
  infernal_knight: { health: 200, damage: 55, speed: 1.2, experience: 150, enemyClass: "suppressor" },
  // ── Celestial Realm ──────────────────────────────────────
  storm_elemental: { health: 180, damage: 50, speed: 1.8, experience: 150, enemyClass: "artillery" },
  divine_sentinel: { health: 250, damage: 60, speed: 1.3, experience: 180, enemyClass: "shield" },
  cloud_serpent:   { health: 200, damage: 45, speed: 1.6, experience: 155, enemyClass: "rusher" },
  angelic_warden:  { health: 220, damage: 55, speed: 1.4, experience: 170, enemyClass: "elite" },
  // ── Void ─────────────────────────────────────────────────
  void_entity:     { health: 250, damage: 65, speed: 2.0, experience: 220, enemyClass: "suppressor" },
  void_colossus:   { health: 400, damage: 75, speed: 0.8, experience: 280, enemyClass: "shield" },
  reality_shatter: { health: 180, damage: 70, speed: 1.9, experience: 240, enemyClass: "artillery" },
  // ── Shadowfell ───────────────────────────────────────────
  shadow_wraith:   { health: 280, damage: 72, speed: 2.2, experience: 260, enemyClass: "suppressor" },
  void_stalker:    { health: 220, damage: 68, speed: 2.4, experience: 250, enemyClass: "rusher" },
  nightmare_hound: { health: 190, damage: 60, speed: 2.6, experience: 230, enemyClass: "rusher" },
  shadow_colossus: { health: 480, damage: 85, speed: 0.9, experience: 340, enemyClass: "elite" },
  soul_harvester:  { health: 310, damage: 78, speed: 1.6, experience: 290, enemyClass: "summoner" },
  umbral_knight:   { health: 350, damage: 80, speed: 1.3, experience: 310, enemyClass: "shield" },
  // ── Primordial Abyss ─────────────────────────────────────
  abyssal_serpent: { health: 360, damage: 88, speed: 1.8, experience: 380, enemyClass: "rusher" },
  depth_crawler:   { health: 290, damage: 75, speed: 2.0, experience: 340, enemyClass: "suppressor" },
  pressure_golem:  { health: 550, damage: 95, speed: 0.6, experience: 450, enemyClass: "shield" },
  tide_horror:     { health: 420, damage: 90, speed: 1.4, experience: 410, enemyClass: "elite" },
  abyssal_warden:  { health: 480, damage: 100, speed: 1.2, experience: 460, enemyClass: "boss" },
  // ── Eternal Forge ────────────────────────────────────────
  forge_guardian:  { health: 500, damage: 100, speed: 1.1, experience: 520, enemyClass: "shield" },
  molten_dwarf:    { health: 320, damage: 85, speed: 1.7, experience: 440, enemyClass: "artillery" },
  iron_sentinel:   { health: 600, damage: 110, speed: 0.8, experience: 560, enemyClass: "suppressor" },
  titan_colossus:  { health: 750, damage: 120, speed: 0.7, experience: 640, enemyClass: "elite" },
  forge_warden:    { health: 550, damage: 108, speed: 1.0, experience: 580, enemyClass: "boss" },
  // ── Generic / Boss stubs ─────────────────────────────────
  orc:             { health: 120, damage: 25, speed: 0.8, experience:  40, enemyClass: "standard" },
  demon:           { health: 200, damage: 35, speed: 2.0, experience:  75, enemyClass: "rusher" },
  ancient_one:     { health:1000, damage: 80, speed: 1.5, experience:1000, enemyClass: "boss" },
  shadow_sovereign:{ health:1500, damage:110, speed: 1.8, experience:2000, enemyClass: "boss" },
  abyssal_leviathan:{ health:2000, damage:130, speed: 1.2, experience:3000, enemyClass: "boss" },
  forge_titan:     { health:2500, damage:150, speed: 1.0, experience:4000, enemyClass: "boss" },
};

const CLASS_RESISTANCE: Record<NonNullable<Enemy["enemyClass"]>, Partial<Record<"physical" | "fire" | "ice" | "lightning" | "arcane" | "poison", number>>> = {
  standard: { physical: 1, fire: 1, ice: 1, lightning: 1, arcane: 1, poison: 1 },
  rusher: { physical: 1.05, fire: 1.1, ice: 0.85, lightning: 1, arcane: 1, poison: 1.2 },
  shield: { physical: 0.85, fire: 1, ice: 1.1, lightning: 0.95, arcane: 1.15, poison: 0.9 },
  artillery: { physical: 1.1, fire: 0.95, ice: 1, lightning: 1.15, arcane: 0.9, poison: 1 },
  summoner: { physical: 1, fire: 0.9, ice: 1.1, lightning: 1, arcane: 1.2, poison: 0.95 },
  suppressor: { physical: 1.05, fire: 1, ice: 0.95, lightning: 1.2, arcane: 1.05, poison: 1 },
  elite: { physical: 0.9, fire: 0.9, ice: 0.9, lightning: 0.95, arcane: 0.95, poison: 0.9 },
  boss: { physical: 0.82, fire: 0.85, ice: 0.85, lightning: 0.85, arcane: 0.85, poison: 0.8 },
};

function isElementReaction(a?: Enemy["lastElementHit"], b?: Enemy["lastElementHit"]): boolean {
  if (!a || !b || a === b) return false;
  const key = `${a}:${b}`;
  return [
    "fire:ice", "ice:fire",
    "lightning:poison", "poison:lightning",
    "arcane:fire", "arcane:ice",
  ].includes(key);
}

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
    const enemyClass = template.enemyClass ?? "standard";

    const enemy: Enemy = {
      id: enemyId,
      type,
      enemyClass,
      position,
      health: template.health,
      maxHealth: template.health,
      damage: template.damage,
      speed: template.speed,
      experience: template.experience,
      lastAttackTime: 0,
      resistances: CLASS_RESISTANCE[enemyClass],
      weakPoint: {
        heightOffset: enemyClass === "boss" ? 1.2 : enemyClass === "shield" ? 1.05 : 0.9,
        bonusMultiplier: enemyClass === "boss" ? 1.35 : enemyClass === "elite" ? 1.45 : 1.6,
      },
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
    get().applyDamage(enemyId, { damage, damageType: "physical" });
  },

  applyDamage: (enemyId, payload) => {
    let result = { finalDamage: 0, killed: false, weakPoint: false };
    set((state) => {
      const enemies = state.enemies.map((enemy) => {
        if (enemy.id === enemyId) {
          const damageType = payload.damageType ?? "physical";
          const resistance = enemy.resistances?.[damageType] ?? 1;
          const weakPoint = !!payload.hitPosition && !!enemy.weakPoint &&
            payload.hitPosition.y >= enemy.position.y + enemy.weakPoint.heightOffset;
          const reaction = isElementReaction(enemy.lastElementHit, damageType);
          const weakPointMultiplier = weakPoint ? enemy.weakPoint?.bonusMultiplier ?? 1.5 : 1;
          const reactionMultiplier = reaction ? 1.25 : 1;
          const finalDamage = Math.max(1, Math.floor(payload.damage * resistance * weakPointMultiplier * reactionMultiplier));
          const newHealth = Math.max(0, enemy.health - finalDamage);

          result = {
            finalDamage,
            killed: newHealth <= 0,
            weakPoint,
          };

          return {
            ...enemy,
            health: newHealth,
            lastElementHit: damageType,
          };
        }
        return enemy;
      });

      const deadEnemies = enemies.filter(e => e.health <= 0);
      deadEnemies.forEach(enemy => {
        console.log(`Enemy ${enemy.type} defeated! +${enemy.experience} XP`);
      });

      return { enemies: enemies.filter(e => e.health > 0) };
    });
    return result;
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
