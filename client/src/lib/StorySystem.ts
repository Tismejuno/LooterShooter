import type { Biome } from "./DungeonEngine";

// ─── STORY TYPES ─────────────────────────────────────────────────────────────

export interface StoryMission {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  reward: {
    gold: number;
    experience: number;
    essence?: number;
    crystals?: number;
  };
  completed: boolean;
}

export interface StoryZone {
  id: string;
  name: string;
  subtitle: string;
  chapter: number;
  biome: Biome;
  requiredLevel: number;
  maxLevel: number;
  lore: string;
  bossName: string;
  bossDescription: string;
  missions: StoryMission[];
  unlocked: boolean;
  completed: boolean;
  bgColor: string;     // CSS colour for UI theming
  accentColor: string;
  icon: string;        // Emoji icon
}

// ─── ZONE DATABASE ────────────────────────────────────────────────────────────

export const STORY_ZONES: StoryZone[] = [
  {
    id: 'zone_crypt',
    name: 'The Forsaken Crypt',
    subtitle: 'Chapter I — The Awakening',
    chapter: 1,
    biome: 'dungeon',
    requiredLevel: 1,
    maxLevel: 5,
    icon: '💀',
    bgColor: '#1a1025',
    accentColor: '#8855cc',
    lore:
      'Beneath the crumbling ruins of Valdris Keep lies the Forsaken Crypt — a labyrinth of ancient stone where the dead refuse to rest. ' +
      'Drawn by rumours of lost treasure, you descend into the darkness, ' +
      'unaware that an ancient evil has been stirring for centuries, waiting for someone foolish enough to break its seal.',
    bossName: 'Lord Malveth the Undying',
    bossDescription:
      'A lich of immense power, Lord Malveth bound his soul to the very stones of the crypt. ' +
      'He commands an army of undead and will not rest until the living are wiped from the realm.',
    missions: [
      {
        id: 'crypt_m1',
        title: 'Into the Depths',
        description: 'Explore the crypt and discover what stirs within.',
        objectives: ['Defeat 10 undead enemies', 'Reach the inner sanctum'],
        reward: { gold: 200, experience: 150 },
        completed: false,
      },
      {
        id: 'crypt_m2',
        title: 'Break the Seal',
        description: 'Three phylactery seals keep Lord Malveth\'s power in check. Shatter them.',
        objectives: ['Destroy 3 phylactery seals', 'Survive waves of summoned skeletons'],
        reward: { gold: 500, experience: 300, essence: 20 },
        completed: false,
      },
      {
        id: 'crypt_m3',
        title: 'The Undying Falls',
        description: 'Confront and defeat Lord Malveth the Undying.',
        objectives: ['Defeat Lord Malveth the Undying'],
        reward: { gold: 1000, experience: 600, essence: 50, crystals: 5 },
        completed: false,
      },
    ],
    unlocked: true,
    completed: false,
  },
  {
    id: 'zone_forest',
    name: 'The Cursed Forest',
    subtitle: 'Chapter II — The Green Plague',
    chapter: 2,
    biome: 'grassland',
    requiredLevel: 6,
    maxLevel: 10,
    icon: '🌿',
    bgColor: '#0d1a0d',
    accentColor: '#44aa44',
    lore:
      'Beyond the crypt, a once-verdant forest has been twisted by dark magic. ' +
      'Gnarled trees whisper blasphemous secrets and corrupted wildlife prowls the undergrowth. ' +
      'A mysterious druidic cult called the Thornweavers has been conducting forbidden rituals, ' +
      'and unless they are stopped, the corruption will spread across the entire realm.',
    bossName: 'Briar the Thornweaver',
    bossDescription:
      'High Druid of the Thornweavers, Briar has sacrificed his humanity to become one with the corrupted forest. ' +
      'He commands vines, beasts, and nature\'s darkest forces in defense of his twisted paradise.',
    missions: [
      {
        id: 'forest_m1',
        title: 'Through the Thorns',
        description: 'Navigate the corrupted forest and find the Thornweavers\' encampment.',
        objectives: ['Defeat 15 corrupted creatures', 'Find the hidden ritual site'],
        reward: { gold: 400, experience: 300 },
        completed: false,
      },
      {
        id: 'forest_m2',
        title: 'Roots of Corruption',
        description: 'The corruption spreads from ancient root nodes buried deep in the earth.',
        objectives: ['Destroy 4 corruption root nodes', 'Free 5 trapped forest spirits'],
        reward: { gold: 800, experience: 500, essence: 40 },
        completed: false,
      },
      {
        id: 'forest_m3',
        title: 'The Thornweaver\'s End',
        description: 'End the Thornweavers\' ritual by defeating their High Druid.',
        objectives: ['Defeat Briar the Thornweaver'],
        reward: { gold: 1500, experience: 800, essence: 80, crystals: 8 },
        completed: false,
      },
    ],
    unlocked: false,
    completed: false,
  },
  {
    id: 'zone_frozen',
    name: 'The Frozen Wastes',
    subtitle: 'Chapter III — Hearts of Ice',
    chapter: 3,
    biome: 'snow',
    requiredLevel: 11,
    maxLevel: 15,
    icon: '❄️',
    bgColor: '#0d1a2a',
    accentColor: '#44bbdd',
    lore:
      'Far to the north, beyond the Dead Mountains, lies a perpetually frozen wasteland where an ancient king was sealed ' +
      'after attempting to conquer death itself. Now the seals weaken, and blizzards of supernatural fury sweep ' +
      'southward. Frost giants, ice wraiths, and the walking dead march from the tundra.',
    bossName: 'Kelvrath the Frost King',
    bossDescription:
      'Once a great human king who sought immortality through dark frost magic, Kelvrath is now a towering figure ' +
      'of pure ice and frozen spite. He can summon blizzards, freeze time itself, and his very gaze inflicts ' +
      'lethal frostbite.',
    missions: [
      {
        id: 'frozen_m1',
        title: 'The Long Winter',
        description: 'Brave the supernatural blizzards and reach the Frost King\'s glacier fortress.',
        objectives: ['Survive 3 blizzard events', 'Defeat 20 frost creatures', 'Locate the glacier fortress'],
        reward: { gold: 700, experience: 500 },
        completed: false,
      },
      {
        id: 'frozen_m2',
        title: 'Thaw the Seals',
        description: 'Ancient fire runes hold the Frost King\'s power at bay. They must be relit.',
        objectives: ['Relight 5 ancient fire runes', 'Protect each rune from ice wraith attacks'],
        reward: { gold: 1200, experience: 750, essence: 70 },
        completed: false,
      },
      {
        id: 'frozen_m3',
        title: 'The King Breaks',
        description: 'Face the Frost King in his throne room at the heart of the glacier.',
        objectives: ['Defeat Kelvrath the Frost King'],
        reward: { gold: 2500, experience: 1200, essence: 120, crystals: 12 },
        completed: false,
      },
    ],
    unlocked: false,
    completed: false,
  },
  {
    id: 'zone_crystal',
    name: 'The Crystalline Depths',
    subtitle: 'Chapter IV — Shattered Mirrors',
    chapter: 4,
    biome: 'crystal',
    requiredLevel: 16,
    maxLevel: 20,
    icon: '💎',
    bgColor: '#101025',
    accentColor: '#8888ff',
    lore:
      'Beneath the surface of the world lies a realm of breathtaking crystal formations — and absolute madness. ' +
      'The Crystalmind, a vast psychic intelligence born from aeons of crystalline growth, has begun ' +
      'consuming the minds of those who venture near. Your own thoughts may not be your own here.',
    bossName: 'The Crystalmind',
    bossDescription:
      'An ancient intelligence that exists as a network of crystalline nodes, the Crystalmind can ' +
      'replicate your worst fears, create perfect mirror-image copies of you, and distort reality itself. ' +
      'It cannot be destroyed in one place — its consciousness must be shattered across multiple nodes simultaneously.',
    missions: [
      {
        id: 'crystal_m1',
        title: 'Into the Lattice',
        description: 'Enter the crystalline caverns and locate the first resonance point.',
        objectives: ['Navigate the crystal maze', 'Defeat 15 crystalline golems', 'Find the Resonance Spire'],
        reward: { gold: 1000, experience: 750 },
        completed: false,
      },
      {
        id: 'crystal_m2',
        title: 'Mirror Shards',
        description: 'The Crystalmind creates echo-copies of intruders. Defeat your own reflections.',
        objectives: ['Destroy 3 mirror-copies of yourself', 'Collect 5 resonance shards'],
        reward: { gold: 1800, experience: 1100, essence: 100, crystals: 15 },
        completed: false,
      },
      {
        id: 'crystal_m3',
        title: 'Shatter the Mind',
        description: 'Simultaneously shatter all Crystalmind nodes to permanently destroy it.',
        objectives: ['Defeat The Crystalmind'],
        reward: { gold: 4000, experience: 2000, essence: 200, crystals: 20 },
        completed: false,
      },
    ],
    unlocked: false,
    completed: false,
  },
  {
    id: 'zone_lava',
    name: 'The Volcanic Abyss',
    subtitle: 'Chapter V — Hellfire Rising',
    chapter: 5,
    biome: 'lava',
    requiredLevel: 21,
    maxLevel: 25,
    icon: '🌋',
    bgColor: '#250a00',
    accentColor: '#ff5500',
    lore:
      'Deep beneath the earth, where the rock bleeds fire, a demon lord named Ignarath has carved his throne ' +
      'from a dormant volcano. He seeks to erupt every volcano on the continent simultaneously, ' +
      'turning the world above into a sea of ash. The heat alone has driven expeditions mad.',
    bossName: 'Ignarath the Flame Lord',
    bossDescription:
      'A demon lord of immense power, Ignarath is wreathed in living flame. ' +
      'He is immune to fire damage, rains meteors from his volcanic throne, and can summon lava elementals ' +
      'at will. His rage grows as his health depletes, making the fight progressively more dangerous.',
    missions: [
      {
        id: 'lava_m1',
        title: 'Descent into Fire',
        description: 'Navigate the volcanic corridors to reach Ignarath\'s inner sanctum.',
        objectives: ['Traverse 5 lava bridges', 'Defeat 25 fire demons', 'Survive a meteor shower'],
        reward: { gold: 1500, experience: 1200 },
        completed: false,
      },
      {
        id: 'lava_m2',
        title: 'Cooling the Core',
        description: 'Ancient cooling vents can be reopened to weaken the volcano and Ignarath.',
        objectives: ['Activate 6 ancient cooling vents', 'Defend each vent from demon attacks'],
        reward: { gold: 2500, experience: 1800, essence: 150, crystals: 20 },
        completed: false,
      },
      {
        id: 'lava_m3',
        title: 'Extinguish the Flame',
        description: 'Face Ignarath on his volcanic throne before the eruption begins.',
        objectives: ['Defeat Ignarath the Flame Lord'],
        reward: { gold: 6000, experience: 3500, essence: 300, crystals: 30 },
        completed: false,
      },
    ],
    unlocked: false,
    completed: false,
  },
  {
    id: 'zone_clouds',
    name: 'The Celestial Realm',
    subtitle: 'Chapter VI — The Ascension',
    chapter: 6,
    biome: 'clouds',
    requiredLevel: 26,
    maxLevel: 30,
    icon: '☁️',
    bgColor: '#101530',
    accentColor: '#aaccff',
    lore:
      'Above the clouds, where the sky meets eternity, lies the Celestial Realm — a domain of divine beings ' +
      'who have grown distant and cold. Their guardian, the Warden of the Sky, has declared all mortals ' +
      'unworthy of existence and has been systematically destroying cities with divine lightning storms. ' +
      'You must ascend to the heavens and challenge the divine order itself.',
    bossName: 'Arethon the Celestial Warden',
    bossDescription:
      'Once a benevolent guardian of the skies, Arethon has grown contemptuous of humanity after ' +
      'witnessing centuries of war and destruction. He wields divine light weapons, commands thunder storms, ' +
      'and can call down flocks of divine servants. He fights with crushing regret and terrible resolve.',
    missions: [
      {
        id: 'clouds_m1',
        title: 'Above the Storms',
        description: 'Ascend through the storm layers to reach the Celestial Realm.',
        objectives: ['Climb 7 cloud platforms', 'Defeat 20 storm elementals', 'Find the Celestial Gate'],
        reward: { gold: 2500, experience: 2000 },
        completed: false,
      },
      {
        id: 'clouds_m2',
        title: 'Proving Worthiness',
        description: 'The Celestial Realm has divine trials that must be completed to gain an audience.',
        objectives: ['Complete 3 celestial trials', 'Defeat the Trial Guardians'],
        reward: { gold: 4000, experience: 3000, essence: 250, crystals: 35 },
        completed: false,
      },
      {
        id: 'clouds_m3',
        title: 'The Warden\'s Judgment',
        description: 'Face Arethon the Celestial Warden and prove humanity worthy of existence.',
        objectives: ['Defeat Arethon the Celestial Warden'],
        reward: { gold: 10000, experience: 6000, essence: 500, crystals: 50 },
        completed: false,
      },
    ],
    unlocked: false,
    completed: false,
  },
  {
    id: 'zone_void',
    name: 'The Void Rift',
    subtitle: 'Chapter VII — The Final Darkness',
    chapter: 7,
    biome: 'dungeon',
    requiredLevel: 30,
    maxLevel: 99,
    icon: '🌑',
    bgColor: '#000005',
    accentColor: '#6600cc',
    lore:
      'Behind all the evil you have faced lay a single architect — the Ancient One, a being that predates creation itself. ' +
      'Having manipulated events from the shadows, it has torn a rift in reality to consume all worlds. ' +
      'The Void Rift is not a place — it is the absence of a place. Step through and face the beginning ' +
      'and end of all things.',
    bossName: 'The Ancient One',
    bossDescription:
      'The Ancient One is the final adversary — an entity of pure void that cannot be truly killed, ' +
      'only temporarily sealed. It exists in multiple dimensions simultaneously, can reverse time locally, ' +
      'and its body rewrites reality as it moves. Every weapon hurts it differently. Nothing is guaranteed. ' +
      'This is the ultimate challenge.',
    missions: [
      {
        id: 'void_m1',
        title: 'Crossing the Threshold',
        description: 'Enter the Void Rift and maintain your sanity long enough to find footing.',
        objectives: ['Survive the Void for 5 minutes', 'Defeat 30 void entities', 'Anchor 3 reality points'],
        reward: { gold: 5000, experience: 5000 },
        completed: false,
      },
      {
        id: 'void_m2',
        title: 'Sealing the Rift\'s Heart',
        description: 'The Void is sustained by four cosmic anchors. They must all be destroyed.',
        objectives: ['Destroy 4 cosmic void anchors', 'Survive the reality collapse events'],
        reward: { gold: 8000, experience: 8000, essence: 500, crystals: 75 },
        completed: false,
      },
      {
        id: 'void_m3',
        title: 'Before the Beginning',
        description: 'Face the Ancient One at the heart of the Void Rift. The fate of all worlds hangs in the balance.',
        objectives: ['Defeat The Ancient One'],
        reward: { gold: 50000, experience: 20000, essence: 2000, crystals: 200 },
        completed: false,
      },
    ],
    unlocked: false,
    completed: false,
  },
  {
    id: 'zone_shadow',
    name: 'The Shadowfell',
    subtitle: 'Chapter VIII — Darkness Incarnate',
    chapter: 8,
    biome: 'shadow',
    requiredLevel: 31,
    maxLevel: 40,
    icon: '🌑',
    bgColor: '#080010',
    accentColor: '#9944cc',
    lore:
      'Beyond the Void Rift, a vast dimension of pure shadow stretches without end. ' +
      'Here, the Shadow Sovereign Malachar has built an empire of darkness, ' +
      'hunting the living for sport and weaving their stolen souls into armour of terrible power. ' +
      'Those who enter rarely cast a shadow again.',
    bossName: 'Malachar the Shadow Sovereign',
    bossDescription:
      'Once a great archmage who sacrificed his physical form to gain dominion over shadow magic, ' +
      'Malachar exists as a being of living darkness. He can teleport through shadows instantly, ' +
      'create near-perfect illusions, and drain the life force from victims at range.',
    missions: [
      {
        id: 'shadow_m1',
        title: 'Into the Dark',
        description: 'Navigate the lightless maze of the Shadowfell and establish a foothold.',
        objectives: ['Defeat 25 shadow entities', 'Survive the Void Pulse attack', 'Find the Shadow Nexus'],
        reward: { gold: 8000, experience: 8000 },
        completed: false,
      },
      {
        id: 'shadow_m2',
        title: 'Stealing Light',
        description: "Malachar steals light from the living world through Soul Lanterns. Extinguish them.",
        objectives: ['Destroy 5 Soul Lanterns', 'Free 8 captured souls', 'Defeat the Shadow Wardens'],
        reward: { gold: 14000, experience: 12000, essence: 600, crystals: 80 },
        completed: false,
      },
      {
        id: 'shadow_m3',
        title: "The Sovereign's End",
        description: 'Confront Malachar in his throne of shadow and tear him from the darkness.',
        objectives: ['Defeat Malachar the Shadow Sovereign'],
        reward: { gold: 30000, experience: 25000, essence: 1200, crystals: 150 },
        completed: false,
      },
    ],
    unlocked: false,
    completed: false,
  },
  {
    id: 'zone_abyss',
    name: 'The Primordial Abyss',
    subtitle: 'Chapter IX — Depth Without End',
    chapter: 9,
    biome: 'abyss',
    requiredLevel: 41,
    maxLevel: 50,
    icon: '🌊',
    bgColor: '#000a18',
    accentColor: '#0077cc',
    lore:
      'Far beneath the ocean floor, past the pressure that crushes steel into dust, ' +
      'lies the Primordial Abyss — a realm of crushing darkness and ancient horrors. ' +
      'Xerath, a leviathan older than the gods themselves, has awakened and begun ' +
      'consuming the tectonic plates, threatening to sink every landmass on the continent.',
    bossName: 'Xerath the Abyssal Leviathan',
    bossDescription:
      'An entity of colossal size, Xerath defies comprehension. His body stretches for miles, ' +
      'his scales resist conventional weapons, and his breath petrifies all living matter. ' +
      'He is fought in phases — each phase reveals a new, more dangerous form. ' +
      'His power grows with the depth of the battle.',
    missions: [
      {
        id: 'abyss_m1',
        title: 'Descent into Pressure',
        description: 'Dive into the Primordial Abyss and survive the crushing depths.',
        objectives: ['Reach depth level 5', 'Defeat 30 abyssal creatures', 'Activate the pressure wards'],
        reward: { gold: 15000, experience: 15000 },
        completed: false,
      },
      {
        id: 'abyss_m2',
        title: 'Breaking the Shell',
        description: "Xerath's armour is formed from the bones of ancient gods. Shatter the outer segments.",
        objectives: ['Destroy 6 armour segments', 'Survive the Tidal Collapse', 'Defeat the Depth Guardians'],
        reward: { gold: 25000, experience: 22000, essence: 1000, crystals: 140 },
        completed: false,
      },
      {
        id: 'abyss_m3',
        title: 'Slaying the Leviathan',
        description: 'Strike the exposed heart of Xerath and end the threat from the deep.',
        objectives: ['Defeat Xerath the Abyssal Leviathan'],
        reward: { gold: 60000, experience: 50000, essence: 2500, crystals: 280 },
        completed: false,
      },
    ],
    unlocked: false,
    completed: false,
  },
  {
    id: 'zone_forge',
    name: 'The Eternal Forge',
    subtitle: 'Chapter X — Fire and Iron',
    chapter: 10,
    biome: 'forge',
    requiredLevel: 51,
    maxLevel: 60,
    icon: '⚒️',
    bgColor: '#100808',
    accentColor: '#dd8800',
    lore:
      'At the centre of creation, where the primordial fires that formed the universe still burn, ' +
      'the Eternal Forge hammers reality itself into new shapes. Vorn the Forge Titan, ' +
      'a being of living metal and fire, seeks to reforge existence into a perfect, lifeless machine. ' +
      'If he succeeds, all life will be extinguished and replaced by cold iron.',
    bossName: 'Vorn the Forge Titan',
    bossDescription:
      'Vorn is a colossal being of living ore and primordial fire, thirty feet tall and ' +
      'wielding hammers the size of buildings. His body absorbs and redirects damage as heat, ' +
      'making conventional attacks dangerous. He forges new iron constructs mid-battle ' +
      'and his rage causes reality itself to buckle under the blows of his hammers.',
    missions: [
      {
        id: 'forge_m1',
        title: 'Into the Crucible',
        description: 'Enter the Eternal Forge and endure its extreme heat and mechanical guardians.',
        objectives: ['Survive 5 Forge Surges', 'Defeat 35 iron constructs', 'Reach the Grand Furnace'],
        reward: { gold: 25000, experience: 25000 },
        completed: false,
      },
      {
        id: 'forge_m2',
        title: 'Cooling the Fires',
        description: "Vorn's power comes from the seven Grand Furnaces. Shut them down.",
        objectives: ['Shut down 7 Grand Furnaces', 'Defeat the Forge Wardens', 'Avoid the Magma Vents'],
        reward: { gold: 45000, experience: 40000, essence: 1800, crystals: 250 },
        completed: false,
      },
      {
        id: 'forge_m3',
        title: 'Breaking the Titan',
        description: 'Face Vorn in the heart of the Eternal Forge and shatter him.',
        objectives: ['Defeat Vorn the Forge Titan'],
        reward: { gold: 100000, experience: 80000, essence: 5000, crystals: 500 },
        completed: false,
      },
    ],
    unlocked: false,
    completed: false,
  },
];

// ─── UTILITY HELPERS ─────────────────────────────────────────────────────────

export class StorySystem {
  /** Return the zone for the given player level. */
  static getZoneForLevel(playerLevel: number): StoryZone {
    // Find the highest-level zone the player qualifies for
    const eligible = STORY_ZONES.filter(z => playerLevel >= z.requiredLevel);
    if (eligible.length === 0) return STORY_ZONES[0];
    return eligible[eligible.length - 1];
  }

  /** Unlock zones the player is now eligible for. */
  static computeUnlockedZones(playerLevel: number): string[] {
    return STORY_ZONES
      .filter(z => playerLevel >= z.requiredLevel)
      .map(z => z.id);
  }

  /** Return the chapter number for a given player level. */
  static getChapterForLevel(playerLevel: number): number {
    return this.getZoneForLevel(playerLevel).chapter;
  }

  /** Return the progress percentage within the current zone. */
  static getZoneProgress(playerLevel: number, currentZone: StoryZone): number {
    if (playerLevel <= currentZone.requiredLevel) return 0;
    const span = currentZone.maxLevel - currentZone.requiredLevel;
    const progress = playerLevel - currentZone.requiredLevel;
    return Math.min(100, Math.round((progress / span) * 100));
  }
}
