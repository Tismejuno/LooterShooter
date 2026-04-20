export type WeaponArchetype =
  | "assault"
  | "smg"
  | "shotgun"
  | "sniper"
  | "launcher"
  | "beam"
  | "melee-hybrid"
  | "exotic";

export type WeaponFireMode = "auto" | "burst" | "semi" | "beam" | "launcher" | "melee";

export type RarityTier = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface ProjectileBehaviorProfile {
  pierce: number;
  chain: number;
  ricochet: number;
  splashRadius: number;
  dotPerSecond: number;
  dotDurationMs: number;
  statusPayload?: "burn" | "freeze" | "poison" | "stun" | "slow";
}

export interface WeaponArchetypeProfile {
  archetype: WeaponArchetype;
  displayName: string;
  fireMode: WeaponFireMode;
  magazineSize: number;
  reloadMs: number;
  fireIntervalMs: number;
  spread: number;
  recoil: number;
  handling: number;
  pelletCount: number;
  projectileSpeed: number;
  projectileBehavior: ProjectileBehaviorProfile;
  archetypeTags: string[];
  affixPool: string[];
}

export interface WeaponDefinition {
  id: string;
  assetKey: string;
  name: string;
  archetype: WeaponArchetype;
  tags: string[];
  baseDamage: number;
}

export interface GeneratedWeaponRoll {
  id: string;
  name: string;
  archetype: WeaponArchetype;
  rarity: RarityTier;
  tags: string[];
  affixes: string[];
  legendaryEffect?: string;
  baseDamage: number;
  totalDamage: number;
  profile: WeaponArchetypeProfile;
}

export const RARITY_CONFIG: Record<RarityTier, { multiplier: number; color: string; weight: number }> = {
  common: { multiplier: 1, color: "#ffffff", weight: 52 },
  uncommon: { multiplier: 1.35, color: "#1eff00", weight: 30 },
  rare: { multiplier: 1.9, color: "#0070dd", weight: 12 },
  epic: { multiplier: 2.8, color: "#a335ee", weight: 5 },
  legendary: { multiplier: 4.4, color: "#ff8000", weight: 1 },
};

export const WEAPON_ARCHETYPE_PROFILES: Record<WeaponArchetype, WeaponArchetypeProfile> = {
  assault: {
    archetype: "assault",
    displayName: "Assault Rifle",
    fireMode: "auto",
    magazineSize: 30,
    reloadMs: 1800,
    fireIntervalMs: 110,
    spread: 0.06,
    recoil: 0.5,
    handling: 0.75,
    pelletCount: 1,
    projectileSpeed: 26,
    projectileBehavior: { pierce: 0, chain: 0, ricochet: 0, splashRadius: 0, dotPerSecond: 0, dotDurationMs: 0 },
    archetypeTags: ["mid-range", "stable", "sustained-dps"],
    affixPool: ["steady", "crit-burst", "armor-breaker", "mag-boost", "quick-reload"],
  },
  smg: {
    archetype: "smg",
    displayName: "SMG",
    fireMode: "auto",
    magazineSize: 42,
    reloadMs: 1450,
    fireIntervalMs: 70,
    spread: 0.11,
    recoil: 0.62,
    handling: 0.95,
    pelletCount: 1,
    projectileSpeed: 24,
    projectileBehavior: { pierce: 0, chain: 0, ricochet: 0, splashRadius: 0, dotPerSecond: 0, dotDurationMs: 0 },
    archetypeTags: ["close-range", "high-rpm", "mobility"],
    affixPool: ["rushdown", "hipfire", "crit-surge", "adrenaline", "overflow-mag"],
  },
  shotgun: {
    archetype: "shotgun",
    displayName: "Shotgun",
    fireMode: "semi",
    magazineSize: 8,
    reloadMs: 2100,
    fireIntervalMs: 540,
    spread: 0.33,
    recoil: 0.88,
    handling: 0.55,
    pelletCount: 9,
    projectileSpeed: 21,
    projectileBehavior: { pierce: 0, chain: 0, ricochet: 1, splashRadius: 0, dotPerSecond: 0, dotDurationMs: 0 },
    archetypeTags: ["close-range", "burst", "crowd-control"],
    affixPool: ["buckshot", "stagger", "armor-crack", "close-quarters", "shred"],
  },
  sniper: {
    archetype: "sniper",
    displayName: "Sniper Rifle",
    fireMode: "semi",
    magazineSize: 5,
    reloadMs: 2300,
    fireIntervalMs: 900,
    spread: 0.01,
    recoil: 0.94,
    handling: 0.48,
    pelletCount: 1,
    projectileSpeed: 42,
    projectileBehavior: { pierce: 1, chain: 0, ricochet: 0, splashRadius: 0, dotPerSecond: 0, dotDurationMs: 0 },
    archetypeTags: ["long-range", "precision", "weakpoint"],
    affixPool: ["headhunter", "piercing", "focus", "eagle-eye", "critical-overload"],
  },
  launcher: {
    archetype: "launcher",
    displayName: "Launcher",
    fireMode: "launcher",
    magazineSize: 3,
    reloadMs: 2600,
    fireIntervalMs: 980,
    spread: 0.05,
    recoil: 1,
    handling: 0.35,
    pelletCount: 1,
    projectileSpeed: 14,
    projectileBehavior: { pierce: 0, chain: 0, ricochet: 0, splashRadius: 3.4, dotPerSecond: 0, dotDurationMs: 0 },
    archetypeTags: ["aoe", "siege", "slow-heavy"],
    affixPool: ["cluster", "blast-radius", "volatile", "demolisher", "shockwave"],
  },
  beam: {
    archetype: "beam",
    displayName: "Beam Emitter",
    fireMode: "beam",
    magazineSize: 60,
    reloadMs: 2000,
    fireIntervalMs: 95,
    spread: 0.02,
    recoil: 0.12,
    handling: 0.86,
    pelletCount: 1,
    projectileSpeed: 34,
    projectileBehavior: { pierce: 2, chain: 1, ricochet: 0, splashRadius: 0, dotPerSecond: 3, dotDurationMs: 1800, statusPayload: "burn" },
    archetypeTags: ["sustained", "elemental", "piercing"],
    affixPool: ["ionized", "chain-link", "melting", "stabilized", "focus-lens"],
  },
  "melee-hybrid": {
    archetype: "melee-hybrid",
    displayName: "Melee-Hybrid",
    fireMode: "melee",
    magazineSize: 1,
    reloadMs: 520,
    fireIntervalMs: 320,
    spread: 0.24,
    recoil: 0.18,
    handling: 1,
    pelletCount: 3,
    projectileSpeed: 17,
    projectileBehavior: { pierce: 1, chain: 0, ricochet: 0, splashRadius: 1.2, dotPerSecond: 0, dotDurationMs: 0, statusPayload: "slow" },
    archetypeTags: ["dash", "close-range", "bleed-window"],
    affixPool: ["lunge", "cleave", "execute", "life-steal", "combo"],
  },
  exotic: {
    archetype: "exotic",
    displayName: "Exotic",
    fireMode: "burst",
    magazineSize: 21,
    reloadMs: 1800,
    fireIntervalMs: 160,
    spread: 0.09,
    recoil: 0.67,
    handling: 0.78,
    pelletCount: 3,
    projectileSpeed: 28,
    projectileBehavior: { pierce: 1, chain: 1, ricochet: 1, splashRadius: 1.6, dotPerSecond: 4, dotDurationMs: 2200, statusPayload: "poison" },
    archetypeTags: ["playstyle-defining", "hybrid", "legendary-synergy"],
    affixPool: ["time-fracture", "void-echo", "prismatic", "entropy", "reality-spike"],
  },
};

const WEAPON_DEFINITIONS: WeaponDefinition[] = [
  { id: "wpn_assault_ironclast", assetKey: "weapon_assault_ironclast", name: "Ironclast AR", archetype: "assault", tags: ["kinetic", "military"], baseDamage: 22 },
  { id: "wpn_assault_valdris", assetKey: "weapon_assault_valdris", name: "Valdris Pattern", archetype: "assault", tags: ["precision", "service"], baseDamage: 24 },
  { id: "wpn_smg_needle", assetKey: "weapon_smg_needle", name: "Needle SMG", archetype: "smg", tags: ["rapid", "spray"], baseDamage: 16 },
  { id: "wpn_smg_slicer", assetKey: "weapon_smg_slicer", name: "Street Slicer", archetype: "smg", tags: ["mobile", "close"], baseDamage: 18 },
  { id: "wpn_shotgun_gravemouth", assetKey: "weapon_shotgun_gravemouth", name: "Gravemouth", archetype: "shotgun", tags: ["scatter", "impact"], baseDamage: 13 },
  { id: "wpn_shotgun_breach", assetKey: "weapon_shotgun_breach", name: "Breach Howler", archetype: "shotgun", tags: ["breach", "stagger"], baseDamage: 15 },
  { id: "wpn_sniper_hush", assetKey: "weapon_sniper_hush", name: "Hushline", archetype: "sniper", tags: ["precision", "weakpoint"], baseDamage: 68 },
  { id: "wpn_sniper_icefang", assetKey: "weapon_sniper_icefang", name: "Icefang", archetype: "sniper", tags: ["pierce", "frost"], baseDamage: 72 },
  { id: "wpn_launcher_ember", assetKey: "weapon_launcher_ember", name: "Ember Mortar", archetype: "launcher", tags: ["explosive", "siege"], baseDamage: 86 },
  { id: "wpn_launcher_hammerfall", assetKey: "weapon_launcher_hammerfall", name: "Hammerfall", archetype: "launcher", tags: ["aoe", "impact"], baseDamage: 92 },
  { id: "wpn_beam_solstice", assetKey: "weapon_beam_solstice", name: "Solstice Beam", archetype: "beam", tags: ["energy", "burn"], baseDamage: 28 },
  { id: "wpn_beam_nullray", assetKey: "weapon_beam_nullray", name: "Nullray", archetype: "beam", tags: ["arcane", "chain"], baseDamage: 30 },
  { id: "wpn_melee_hybrid_reaper", assetKey: "weapon_hybrid_reaper", name: "Reaper Frame", archetype: "melee-hybrid", tags: ["slash", "lunge"], baseDamage: 40 },
  { id: "wpn_melee_hybrid_razorloop", assetKey: "weapon_hybrid_razorloop", name: "Razorloop", archetype: "melee-hybrid", tags: ["combo", "close"], baseDamage: 44 },
  { id: "wpn_exotic_paradox", assetKey: "weapon_exotic_paradox", name: "Paradox Engine", archetype: "exotic", tags: ["void", "hybrid"], baseDamage: 52 },
  { id: "wpn_exotic_shattered", assetKey: "weapon_exotic_shattered", name: "Shattered Crown", archetype: "exotic", tags: ["prismatic", "legendary"], baseDamage: 56 },
];

const LEGENDARY_EFFECTS: string[] = [
  "Time Fracture: burst shots rewind and fire a delayed echo.",
  "Apex Predator: weak-point hits chain to nearby enemies.",
  "Hypercoil Converter: high recoil converts to bonus damage.",
  "Singularity Core: launcher impacts pull enemies before detonation.",
  "Prismatic Flux: alternating elements trigger reaction damage.",
  "Soul Harvest: kills grant temporary magazine overflow.",
];

function pickRandom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

function weightedRarityRoll(playerLevel: number): RarityTier {
  const levelBias = Math.min(20, Math.floor(playerLevel / 3));
  const table: Array<{ rarity: RarityTier; weight: number }> = [
    { rarity: "common", weight: Math.max(8, RARITY_CONFIG.common.weight - levelBias) },
    { rarity: "uncommon", weight: RARITY_CONFIG.uncommon.weight },
    { rarity: "rare", weight: RARITY_CONFIG.rare.weight + Math.floor(levelBias * 0.6) },
    { rarity: "epic", weight: RARITY_CONFIG.epic.weight + Math.floor(levelBias * 0.25) },
    { rarity: "legendary", weight: RARITY_CONFIG.legendary.weight + Math.floor(levelBias * 0.1) },
  ];

  const total = table.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.random() * total;
  for (const entry of table) {
    roll -= entry.weight;
    if (roll <= 0) return entry.rarity;
  }
  return "common";
}

export function rollWeaponRarity(playerLevel: number, forcedRarity?: RarityTier): RarityTier {
  return forcedRarity ?? weightedRarityRoll(playerLevel);
}

export function generateWeaponRoll(playerLevel: number, forcedRarity?: RarityTier): GeneratedWeaponRoll {
  const base = pickRandom(WEAPON_DEFINITIONS);
  const rarity = rollWeaponRarity(playerLevel, forcedRarity);
  const rarityMul = RARITY_CONFIG[rarity].multiplier;
  const profile = WEAPON_ARCHETYPE_PROFILES[base.archetype];
  const affixCount = rarity === "legendary" ? 3 : rarity === "epic" ? 2 : rarity === "rare" ? 2 : 1;
  const affixes = [...profile.affixPool].sort(() => Math.random() - 0.5).slice(0, affixCount);
  const levelScalar = 1 + Math.max(0, playerLevel - 1) * 0.06;
  const totalDamage = Math.floor(base.baseDamage * rarityMul * levelScalar);
  const legendaryEffect = rarity === "legendary" || base.archetype === "exotic" ? pickRandom(LEGENDARY_EFFECTS) : undefined;

  return {
    id: base.id,
    name: base.name,
    archetype: base.archetype,
    rarity,
    tags: [...base.tags, ...profile.archetypeTags],
    affixes,
    legendaryEffect,
    baseDamage: base.baseDamage,
    totalDamage,
    profile,
  };
}
