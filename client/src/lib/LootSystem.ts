import { LootItem, Position, ItemType } from "./gameTypes";
import { generateWeaponRoll } from "./content/weaponContent";
import { worldTierForLevel } from "./content/lootTables";

export interface ItemModifier {
  stat: string;
  value: number;
  type: 'flat' | 'percentage';
}

export interface LootTable {
  rarity: LootItem['rarity'];
  weight: number;
  minLevel: number;
}

let itemIdCounter = 0;

// ─── ITEM DATABASES ─────────────────────────────────────────────────────────

const WEAPONS = {
  // Swords
  swords: [
    'Broadsword', 'Longsword', 'Shortsword', 'Katana', 'Rapier', 'Claymore',
    'Gladius', 'Falchion', 'Scimitar', 'Bastard Sword', 'Zweihänder', 'Saber'
  ],
  // Axes
  axes: [
    'Battleaxe', 'Hatchet', 'Greataxe', 'War Axe', 'Moon Blade',
    'Splitting Axe', 'Bearded Axe', 'Throwing Axe'
  ],
  // Bows
  bows: [
    'Shortbow', 'Longbow', 'Crossbow', 'War Bow', "Hunter's Bow",
    'Recurve Bow', 'Composite Bow', 'Siege Crossbow'
  ],
  // Staffs
  staffs: [
    'Fire Staff', 'Ice Staff', 'Thunder Staff', 'Arcane Staff',
    'Nature Staff', 'Death Staff', 'Holy Staff', 'Shadow Wand',
    'Crystal Scepter', 'Dragon Bone Staff'
  ],
  // Daggers
  daggers: [
    'Stiletto', 'Kris', 'Dirk', 'Kukri', 'Shiv',
    'Throwing Knife', 'Assassin Blade', 'Venom Fang'
  ],
  // Hammers / Maces
  hammers: [
    'War Hammer', 'Maul', 'Flanged Mace', 'Morning Star', 'Club',
    'Great Maul', 'Spiked Club', 'Bone Crusher'
  ],
  // Spears / Polearms
  spears: [
    'Javelin', 'Trident', 'Pike', 'Halberd', 'Glaive',
    'Partisan', 'Ranseur', 'War Scythe'
  ],
  // Special / Elemental
  special: [
    'Frostblade', 'Lava Shard', 'Cloud Scepter', 'Crystal Shiv',
    'Vine Whip', 'Ember Lance', 'Skybow', 'Glacial Cleaver',
    'Thornbark Club', 'Void Reaver', 'Storm Herald', 'Soul Striker',
    // Shadow zone weapons
    'Shadow Reaper', 'Voidbane Edge', 'Nightmare Cutter', 'Soul Drinker',
    'Umbral Fang', 'Darkweave Blade', 'Eclipse Shard',
    // Abyss zone weapons
    'Abyssal Trident', 'Depth Piercer', 'Leviathan Spine', 'Pressure Blade',
    'Tide Ripper', 'Deep Current Lance', 'Crushing Dark Mace',
    // Forge zone weapons
    'Eternal Hammer', 'Forge Titan Maul', 'Primordial Anvil Blade',
    'Iron Verdict', 'Magma-Forged Axe', 'Creation Breaker',
  ],
};

const WEAPON_NAMES_FLAT = [
  ...WEAPONS.swords, ...WEAPONS.axes, ...WEAPONS.bows, ...WEAPONS.staffs,
  ...WEAPONS.daggers, ...WEAPONS.hammers, ...WEAPONS.spears, ...WEAPONS.special,
];

const ARMOR_TYPES = {
  helmets: [
    'Iron Helm', "Knight's Visor", "Ranger's Hood", "Mage's Hat", 'Dark Cowl',
    'Barbute Helmet', 'Bascinet', 'War Mask', 'Crystal Crown', 'Serpent Helm',
    // Shadow set
    "Malachar's Shadow Cowl", 'Void-Walker Hood', 'Umbral Helm', 'Soul-Bound Circlet',
    // Abyss set
    'Abyssal Pressure Helm', 'Leviathan Scale Hood', 'Deep Diver Helm', 'Tide-Blessed Crown',
    // Forge set
    'Forge Titan Helm', 'Eternal Iron Visor', 'Primordial Plate Helm', "Vorn's War Mask",
  ],
  chestplates: [
    'Chainmail', 'Plate Armor', 'Leather Vest', 'Robe of Power', 'Scale Mail',
    'Brigandine', 'Full Plate', 'Shadow Wraith Coat', 'Dragon Scale Cuirass', 'Void Mantle',
    // Shadow set
    "Malachar's Shadow Shroud", 'Void-Walker Coat', 'Umbral Plate', 'Soul Harvester Mantle',
    // Abyss set
    'Abyssal Scale Cuirass', 'Leviathan Carapace', 'Pressure-Forged Plate', 'Tidal Robe',
    // Forge set
    'Forge Titan Chestplate', 'Eternal Iron Plate', 'Primordial Anvil Cuirass', "Vorn's Iron Mantle",
  ],
  boots: [
    'Iron Boots', 'Swift Boots', 'Shadowstep Boots', "Mage's Slippers",
    'Greaves of Haste', 'Stone Boots', 'Winged Sandals', 'Dark Leather Treads',
    // Shadow set
    "Malachar's Shadow Treads", 'Void-Walker Boots', 'Umbral Greaves', 'Soul-Strider Boots',
    // Abyss set
    'Abyssal Depth Greaves', 'Leviathan Scale Boots', 'Pressure-Seal Treads', 'Tidal Waders',
    // Forge set
    'Forge Titan Greaves', 'Eternal Iron Boots', 'Primordial Forged Treads', "Vorn's Iron Stompers",
  ],
  gauntlets: [
    'Iron Gauntlets', 'Spiked Gloves', 'Mage Wraps', 'Dragon Claw Gauntlets',
    'Shadow Grip', 'Holy Vambraces', 'Battle Mitts', 'Crystal Knuckles',
    // Shadow set
    "Malachar's Void Grip", 'Umbral Gauntlets', 'Soul-Bound Bracers', 'Night Weave Gloves',
    // Abyss set
    'Abyssal Pressure Gauntlets', 'Leviathan Claw Wraps', 'Deep Tide Bracers', 'Crushing Depth Vambraces',
    // Forge set
    'Forge Titan Gauntlets', 'Eternal Iron Fists', 'Primordial Anvil Gloves', "Vorn's Forged Vambraces",
  ],
  shields: [
    'Buckler', 'Tower Shield', 'Dragon Shield', 'Magic Barrier',
    'Kite Shield', 'Heater Shield', 'Round Shield', 'Aegis Fragment',
    // Shadow set
    'Void-Walker Ward', 'Umbral Barrier', "Malachar's Shadow Bulwark",
    // Abyss set
    'Abyssal Tide Ward', 'Leviathan Scale Shield', 'Pressure Barrier',
    // Forge set
    'Forge Titan Bulwark', 'Eternal Iron Shield', "Vorn's Forged Ward",
  ],
  cloaks: [
    'Shadow Cloak', 'Wind Cloak', 'Ember Cloak', 'Frost Mantle',
    'Verdant Cape', "Assassin's Shroud", 'Celestial Veil', 'Bone Mantle',
    // Shadow set
    "Malachar's Void Shroud", 'Umbral Cloak', 'Soul-Weave Mantle', 'Night Wrap',
    // Abyss set
    'Abyssal Current Cloak', 'Leviathan Skin Drape', 'Tidal Veil', 'Deep Sea Mantle',
    // Forge set
    'Forge Titan Cape', 'Ember-Iron Cloak', "Vorn's Molten Mantle",
  ],
  belts: [
    'War Belt', 'Scout Belt', 'Mystic Sash', 'Titan Girdle',
    'Shadow Wrap', 'Battle Harness', 'Enchanted Cord', 'Dragon Leather Belt',
    // Shadow set
    "Malachar's Void Girdle", 'Umbral Sash', 'Soul-Wrapped Belt', 'Night Weave Cord',
    // Abyss set
    'Abyssal Pressure Girdle', 'Leviathan Hide Belt', 'Deep Tide Sash', 'Current-Blessed Cord',
    // Forge set
    'Forge Titan Girdle', 'Eternal Iron Sash', "Vorn's Forged Belt", 'Primordial Anvil Cord',
  ],
};

const ARMOR_NAMES_FLAT = [
  ...ARMOR_TYPES.helmets, ...ARMOR_TYPES.chestplates, ...ARMOR_TYPES.boots,
  ...ARMOR_TYPES.gauntlets, ...ARMOR_TYPES.shields, ...ARMOR_TYPES.cloaks,
  ...ARMOR_TYPES.belts,
];

const ACCESSORIES = [
  // Rings
  'Ring of Strength', 'Ring of Wisdom', 'Ring of Vitality', 'Death Ring',
  'Fire Ring', 'Frost Band', 'Thunder Loop', 'Shadow Ring', 'Crystal Ring',
  // Necklaces / Amulets
  'Amulet of Power', 'Pendant of Arcane', 'Necklace of Fortune',
  'Dragon Tooth Pendant', "Sage's Medallion", 'Blood Amulet',
  // Bracelets
  'Iron Bracelet', 'Crystal Bracelet', 'Shadow Bracelet', 'Holy Bangle',
];

const OFFHAND_ITEMS = [
  // Orbs
  'Fire Orb', 'Ice Orb', 'Lightning Orb', 'Shadow Orb', 'Void Orb',
  // Tomes
  'Ancient Tome', 'Battle Tome', 'Mystic Grimoire', 'Codex of Shadows',
  // Quivers
  'Iron Quiver', 'Poison Quiver', 'Flame Quiver', 'Enchanted Quiver',
];

const POTIONS = [
  // Health
  'Minor Health Potion', 'Health Potion', 'Greater Health Potion', 'Superior Health Flask',
  'Elixir of Life', 'Crimson Draught',
  // Mana
  'Minor Mana Potion', 'Mana Potion', 'Greater Mana Potion', 'Arcane Brew', 'Crystal Elixir',
  // Buffs
  'Potion of Strength', 'Potion of Haste', 'Potion of Fortitude', 'Potion of Clarity',
  'Rage Potion', "Berserker's Brew", 'Invisibility Draught', 'Dragon Blood Tonic',
  // Antidotes / Cures
  'Antidote', 'Cure Poison Flask', 'Thawing Draught',
];

const FOOD_ITEMS = [
  'Roasted Meat', 'Hearty Stew', 'Elven Bread', 'Dragon Fruit',
  'Mushroom Soup', 'Sweet Berry', 'Combat Ration', 'Blessed Feast',
  'Hunter\'s Jerky', 'Crystal Spring Water', 'Mana Biscuit', 'Ancient Herb Tea',
];

const SCROLLS = [
  // Attack
  'Scroll of Fireball', 'Scroll of Lightning', 'Scroll of Ice Storm',
  'Scroll of Chain Lightning', 'Scroll of Meteor Strike', 'Scroll of Frost Nova',
  // Utility
  'Scroll of Teleportation', 'Scroll of Town Portal', 'Scroll of Identify',
  'Scroll of Mapping', 'Scroll of Escape',
  // Buffs
  'Scroll of Fortification', 'Scroll of Blessing', 'Scroll of War Cry',
  // Summon
  'Scroll of Summoning', 'Scroll of Undead Army', 'Scroll of Elemental',
  // Area
  'Scroll of Blizzard', 'Scroll of Eruption', 'Scroll of Thunder Storm',
];

const GRENADES = [
  'Fire Bomb', 'Frost Grenade', 'Thunder Orb', 'Poison Flask',
  'Smoke Bomb', 'Holy Grenade', 'Arcane Cluster', 'Void Shard Grenade',
];

const AMMO_TYPES = [
  'Standard Rounds',
  'Hollow Point Rounds',
  'Armor-Piercing Rounds',
  'Incendiary Rounds',
  'Cryo Rounds',
  'Shock Shells',
  'Scatter Shells',
  'Longshot Cartridges',
  'Plasma Cells',
  'Arc Cells',
  'Void Charges',
  'Forge-Core Slugs',
];
const ENERGY_AMMO_KEYWORDS = ['Plasma', 'Arc', 'Void', 'Forge-Core'];

const GEMS = [
  'Ruby', 'Sapphire', 'Emerald', 'Diamond', 'Topaz',
  'Amethyst', 'Opal', 'Obsidian Gem', 'Pearl', 'Moonstone',
  'Sunstone', 'Voidite Crystal', 'Frost Jewel', 'Ember Stone',
];

const RUNES = [
  'Rune of Strength', 'Rune of Defense', 'Rune of Speed', 'Rune of Fire',
  'Rune of Ice', 'Rune of Thunder', 'Rune of Life', 'Rune of Death',
  'Rune of Power', 'Rune of the Void', 'Ancient Rune Shard',
];

const MATERIALS = [
  'Iron Ore', 'Steel Ingot', 'Dragon Scale', 'Phoenix Feather',
  'Ancient Wood', 'Crystal Shard', 'Shadow Essence', 'Holy Dust',
  'Mana Crystal', 'Void Shard', 'Enchanted Leather', 'Mythril Flake',
  'Frozen Tear', 'Lava Core Fragment', 'Star Dust',
];

const RELICS = [
  'Ancient Relic', 'Cursed Artifact', 'Sacred Idol', 'Dragon Egg',
  'Timeless Piece', 'Void Crystal', 'Forsaken Idol', 'Celestial Compass',
];

const BLUEPRINTS = [
  'Blueprint: Iron Sword', 'Blueprint: Chainmail', 'Blueprint: Fire Staff',
  'Blueprint: Dragon Shield', 'Blueprint: Legendary Axe', 'Blueprint: Arcane Orb',
  'Blueprint: Shadow Dagger', 'Blueprint: Holy Armor',
];

const ARTIFACTS = [
  'Heart of the Dragon', 'Eye of the Storm', 'Soul Lantern',
  'Crown of the Fallen King', 'Gauntlet of Eternity',
  'Orb of Infinite Knowledge', 'Shattered God Fragment', "Void Reaper's Essence",
];

const LEGENDARY_UNIQUES = [
  'Excalibur', 'Mjolnir', 'Aegis', 'Gungnir', 'Durandal',
  'Frostmourne', 'Sulfuras', 'Ashbringer', 'Thunderfury',
  "Ner'zhul's Chillblade", 'The Lava Core', 'Heart of the Crystal Cavern',
  "Zephyr's Cloud Mantle", 'Verdant Crown of the Forest',
  "Voidwalker's Shroud", 'The Eternal Flame', "Titan's Last Stand",
  "Shadowmeld Dagger", 'Worldbreaker', 'Starfall Bow',
  // Shadow zone legendaries
  "Malachar's Soul Reaper", 'The Shadow Sovereign Crown', 'Umbral Void Edge',
  'Eternal Darkness Mantle', 'Soul-Forged Nightmare Blade',
  // Abyss zone legendaries
  "Xerath's Scale Shard", 'Leviathan Heart', 'Abyssal Pressure Crown',
  'Primordial Depth Trident', 'Crushing Dark of the Abyss',
  // Forge zone legendaries
  "Vorn's Creation Hammer", 'The Eternal Forge Plate', 'Primordial Anvil',
  'Iron Birth of the Universe', "Forge Titan's Last Stand",
];

// ─── PREFIXES / SUFFIXES ─────────────────────────────────────────────────────

const WEAPON_PREFIXES = [
  'Sharp', 'Keen', 'Brutal', 'Swift', 'Deadly', 'Ancient', 'Cursed', 'Blessed',
  'Vengeful', 'Divine', 'Frostbitten', 'Volcanic', 'Crystal', 'Stormborn',
  'Verdant', 'Glacial', 'Infernal', 'Celestial', 'Arcane', 'Thunderous',
  'Voidtouched', 'Serrated', 'Bloodied', 'Shadowforged', 'Heroic',
  'Umbral', 'Soul-Draining', 'Night-Forged', 'Abyssal', 'Tide-Blessed',
  'Deep-Forged', 'Pressure-Bound', 'Primal', 'Eternal', 'Primordial',
  'Titan-Forged', 'Molten', 'Iron-Born', 'Creation-Touched',
];

const ARMOR_PREFIXES = [
  'Sturdy', 'Light', 'Heavy', 'Reinforced', 'Magical', 'Dragon', 'Shadow',
  'Holy', 'Ethereal', 'Titan', 'Frozen', 'Ember', 'Cloudweave', 'Crystalline',
  'Mossgrown', 'Volcanic', 'Stormforged', 'Astral', 'Verdant', 'Glacial',
  'Void-tempered', 'Warded', 'Runed', 'Nightforged', 'Sunblessed',
  'Umbral', 'Soul-Touched', 'Abyssal', 'Pressure-Forged', 'Tidal',
  'Depth-Tempered', 'Leviathan-Scale', 'Primordial', 'Eternal-Iron',
  'Forge-Blessed', 'Titan-Wrought', 'Molten-Tempered', 'Creation-Forged',
];

// ─── RARITY CONFIG ───────────────────────────────────────────────────────────

const RARITY_VALUES = {
  common:    { multiplier: 1,   color: '#ffffff', sellValue: 10  },
  uncommon:  { multiplier: 1.5, color: '#1eff00', sellValue: 25  },
  rare:      { multiplier: 2,   color: '#0070dd', sellValue: 50  },
  epic:      { multiplier: 3,   color: '#a335ee', sellValue: 100 },
  legendary: { multiplier: 5,   color: '#ff8000', sellValue: 250 },
};

// ─── EFFECT MAPPING ──────────────────────────────────────────────────────────

function deriveEffect(type: ItemType, name: string): string {
  if (type === 'potion') {
    if (name.includes('Health') || name.includes('Life') || name.includes('Crimson')) return 'restore_health';
    if (name.includes('Mana') || name.includes('Arcane') || name.includes('Crystal Elixir')) return 'restore_mana';
    if (name.includes('Strength')) return 'boost_strength';
    if (name.includes('Fortitude') || name.includes('Defense')) return 'boost_defense';
    if (name.includes('Haste') || name.includes('Speed')) return 'boost_speed';
    if (name.includes('Rage') || name.includes('Berserker')) return 'boost_attack';
    if (name.includes('Clarity')) return 'boost_intelligence';
    if (name.includes('Invisibility')) return 'invisibility';
    if (name.includes('Dragon Blood')) return 'dragon_blood';
    if (name.includes('Antidote') || name.includes('Cure') || name.includes('Thawing')) return 'cure_status';
    return 'restore_health';
  }
  if (type === 'food') {
    if (name.includes('Meat') || name.includes('Stew') || name.includes('Ration') || name.includes('Jerky')) return 'restore_health';
    if (name.includes('Mana') || name.includes('Crystal') || name.includes('Tea')) return 'restore_mana';
    if (name.includes('Berry') || name.includes('Fruit')) return 'regen_both';
    if (name.includes('Feast')) return 'full_restore';
    return 'restore_health';
  }
  if (type === 'scroll') {
    if (name.includes('Fireball')) return 'cast_fireball';
    if (name.includes('Lightning') || name.includes('Chain Lightning')) return 'cast_lightning';
    if (name.includes('Ice') || name.includes('Blizzard') || name.includes('Frost')) return 'cast_ice_storm';
    if (name.includes('Healing') || name.includes('Blessing')) return 'cast_heal';
    if (name.includes('Teleportation') || name.includes('Escape')) return 'cast_teleport';
    if (name.includes('Town Portal')) return 'cast_town_portal';
    if (name.includes('Summon') || name.includes('Elemental')) return 'cast_summon';
    if (name.includes('Eruption') || name.includes('Meteor')) return 'cast_eruption';
    if (name.includes('Thunder') || name.includes('Storm')) return 'cast_thunderstorm';
    if (name.includes('Fortification') || name.includes('War Cry')) return 'cast_fortify';
    if (name.includes('Undead')) return 'cast_undead';
    if (name.includes('Identify') || name.includes('Mapping')) return 'utility';
    return 'unknown';
  }
  if (type === 'grenade') {
    if (name.includes('Fire')) return 'grenade_fire';
    if (name.includes('Frost') || name.includes('Ice')) return 'grenade_frost';
    if (name.includes('Thunder') || name.includes('Void')) return 'grenade_thunder';
    if (name.includes('Poison')) return 'grenade_poison';
    if (name.includes('Smoke')) return 'grenade_smoke';
    if (name.includes('Holy')) return 'grenade_holy';
    return 'grenade_generic';
  }
  if (type === 'ammo') {
    if (name.includes('Armor-Piercing')) return 'ammo_armor_piercing';
    if (name.includes('Hollow Point')) return 'ammo_hollow_point';
    if (name.includes('Incendiary')) return 'ammo_incendiary';
    if (name.includes('Cryo')) return 'ammo_cryo';
    if (name.includes('Shock')) return 'ammo_shock';
    if (name.includes('Scatter')) return 'ammo_scatter';
    if (name.includes('Longshot')) return 'ammo_longshot';
    if (ENERGY_AMMO_KEYWORDS.some((keyword) => name.includes(keyword))) return 'ammo_energy';
    return 'restore_ammo';
  }
  if (type === 'gem') return 'socket_gem';
  if (type === 'rune') return 'enchant_rune';
  if (type === 'material') return 'crafting_material';
  if (type === 'blueprint') return 'learn_recipe';
  return 'unknown';
}

// ─── STAT GENERATION ─────────────────────────────────────────────────────────

function generateStats(
  type: ItemType,
  rarity: LootItem['rarity'],
  playerLevel: number
): Record<string, number> {
  const stats: Record<string, number> = {};
  const mul = RARITY_VALUES[rarity].multiplier * (1 + playerLevel * 0.1);
  const r = () => Math.random();

  switch (type) {
    case 'weapon':
      stats.strength = Math.floor((3 + r() * 7) * mul);
      if (r() < 0.4) stats.dexterity = Math.floor((2 + r() * 4) * mul);
      if (rarity === 'epic' || rarity === 'legendary') {
        stats.critChance = Math.floor(5 + r() * 10);
        if (r() < 0.5) stats.intelligence = Math.floor((1 + r() * 3) * mul);
      }
      break;

    case 'ammo':
      stats.power = Math.floor((8 + r() * 16) * mul);
      if (rarity === 'rare' || rarity === 'epic' || rarity === 'legendary') {
        stats.critChance = Math.floor(2 + r() * 6);
      }
      break;

    case 'armor':
      stats.vitality = Math.floor((3 + r() * 6) * mul);
      {
        const armorSecondaryStats = ['strength', 'dexterity', 'intelligence'];
        stats[armorSecondaryStats[Math.floor(r() * armorSecondaryStats.length)]] = Math.floor((2 + r() * 4) * mul);
      }
      if (rarity === 'rare' || rarity === 'epic' || rarity === 'legendary') {
        stats.armor = Math.floor((5 + r() * 15) * mul);
      }
      break;

    case 'accessory':
      // Rings / necklaces grant mixed bonuses
      {
        const statKeys4 = ['strength', 'dexterity', 'intelligence', 'vitality'];
        stats[statKeys4[Math.floor(r() * 4)]] = Math.floor((2 + r() * 5) * mul);
        if (rarity !== 'common') {
          stats[statKeys4[Math.floor(r() * 4)]] = Math.floor((1 + r() * 3) * mul);
        }
        if (rarity === 'epic' || rarity === 'legendary') {
          stats.critChance = Math.floor(3 + r() * 8);
          stats.luck = Math.floor((2 + r() * 5) * mul);
        }
      }
      break;

    case 'offhand':
      stats.intelligence = Math.floor((4 + r() * 6) * mul);
      if (r() < 0.5) stats.manaBonus = Math.floor((5 + r() * 10) * mul);
      if (rarity === 'epic' || rarity === 'legendary') stats.spellPower = Math.floor((5 + r() * 10) * mul);
      break;

    case 'gem':
    case 'rune':
      // Gems give a single focused stat
      {
        const gemStats = ['strength', 'dexterity', 'intelligence', 'vitality', 'critChance', 'luck'];
        const gemStat = gemStats[Math.floor(r() * gemStats.length)];
        stats[gemStat] = Math.floor((3 + r() * 7) * mul);
      }
      break;

    case 'material':
    case 'blueprint':
      stats.craftingValue = Math.floor((5 + r() * 20) * mul);
      break;

    case 'relic':
    case 'artifact':
      // Relics/Artifacts give large multi-stat bonuses
      stats.strength = Math.floor((2 + r() * 4) * mul);
      stats.intelligence = Math.floor((2 + r() * 4) * mul);
      stats.vitality = Math.floor((2 + r() * 4) * mul);
      stats.dexterity = Math.floor((2 + r() * 4) * mul);
      if (rarity === 'legendary') {
        stats.luck = Math.floor((5 + r() * 10) * mul);
        stats.critChance = Math.floor(8 + r() * 12);
      }
      break;

    case 'potion':
    case 'food':
    case 'scroll':
    case 'grenade':
    case 'consumable':
      stats.power = Math.floor((10 + r() * 20) * mul);
      break;
  }

  return stats;
}

// ─── VALUE CALCULATION ───────────────────────────────────────────────────────

function calculateValue(type: ItemType, rarity: LootItem['rarity'], stats: Record<string, number>): number {
  const base = RARITY_VALUES[rarity].sellValue;
  const statTotal = Object.values(stats).reduce((s, v) => s + v, 0);
  const typeMultiplier: Partial<Record<ItemType, number>> = {
    accessory: 1.8,
    ammo: 1.25,
    artifact: 3,
    blueprint: 2,
    gem: 1.6,
    offhand: 1.4,
    relic: 2.5,
    rune: 1.5,
  };
  return Math.floor((base + statTotal * 2) * (typeMultiplier[type] ?? 1));
}

// ─── NAME GENERATION ─────────────────────────────────────────────────────────

function generateItemName(type: ItemType, rarity: LootItem['rarity']): string {
  const r = () => Math.random();

  if (rarity === 'legendary') {
    return LEGENDARY_UNIQUES[Math.floor(r() * LEGENDARY_UNIQUES.length)];
  }

  switch (type) {
    case 'weapon': {
      const prefix = WEAPON_PREFIXES[Math.floor(r() * WEAPON_PREFIXES.length)];
      const base = WEAPON_NAMES_FLAT[Math.floor(r() * WEAPON_NAMES_FLAT.length)];
      return `${prefix} ${base}`;
    }
    case 'armor': {
      const prefix = ARMOR_PREFIXES[Math.floor(r() * ARMOR_PREFIXES.length)];
      const base = ARMOR_NAMES_FLAT[Math.floor(r() * ARMOR_NAMES_FLAT.length)];
      return `${prefix} ${base}`;
    }
    case 'accessory':
      return ACCESSORIES[Math.floor(r() * ACCESSORIES.length)];
    case 'offhand':
      return OFFHAND_ITEMS[Math.floor(r() * OFFHAND_ITEMS.length)];
    case 'potion':
    case 'consumable':
      return POTIONS[Math.floor(r() * POTIONS.length)];
    case 'food':
      return FOOD_ITEMS[Math.floor(r() * FOOD_ITEMS.length)];
    case 'scroll':
      return SCROLLS[Math.floor(r() * SCROLLS.length)];
    case 'grenade':
      return GRENADES[Math.floor(r() * GRENADES.length)];
    case 'ammo':
      return AMMO_TYPES[Math.floor(r() * AMMO_TYPES.length)];
    case 'gem':
      return GEMS[Math.floor(r() * GEMS.length)];
    case 'rune':
      return RUNES[Math.floor(r() * RUNES.length)];
    case 'material':
      return MATERIALS[Math.floor(r() * MATERIALS.length)];
    case 'relic':
      return RELICS[Math.floor(r() * RELICS.length)];
    case 'blueprint':
      return BLUEPRINTS[Math.floor(r() * BLUEPRINTS.length)];
    case 'artifact':
      return ARTIFACTS[Math.floor(r() * ARTIFACTS.length)];
    default:
      return 'Unknown Item';
  }
}

// ─── ITEM TYPE WEIGHTS ───────────────────────────────────────────────────────

const ITEM_TYPE_POOL: ItemType[] = [
  'weapon', 'weapon', 'weapon',          // 3× weight
  'ammo', 'ammo',
  'armor', 'armor', 'armor',
  'potion', 'potion',
  'scroll', 'scroll',
  'accessory',
  'offhand',
  'food',
  'grenade',
  'gem',
  'rune',
  'material',
  'blueprint',
  'relic',
  'artifact',
];

// ─── LOOT SYSTEM CLASS ───────────────────────────────────────────────────────

export class LootSystem {
  static generateItem(
    position: Position,
    rarity: LootItem['rarity'],
    itemType?: ItemType,
    playerLevel: number = 1
  ): LootItem {
    const type = itemType ?? this.randomItemType();
    const name = generateItemName(type, rarity);
    const stats = generateStats(type, rarity, playerLevel);
    const value = calculateValue(type, rarity, stats);

    const item: LootItem = {
      id: `item_${++itemIdCounter}`,
      name,
      type,
      rarity,
      position,
      stats,
      value,
    };

    if (type === 'weapon') {
      const weaponRoll = generateWeaponRoll(playerLevel, rarity);
      const weaponStats: Record<string, number> = {
        strength: Math.floor(weaponRoll.totalDamage * 0.45),
        dexterity: Math.floor(weaponRoll.profile.handling * 12),
        critChance: Math.floor(5 + weaponRoll.profile.recoil * 4 + weaponRoll.affixes.length * 3),
        weaponDamage: weaponRoll.totalDamage,
      };

      item.name = weaponRoll.name;
      item.stats = weaponStats;
      item.value = calculateValue(type, rarity, weaponStats) + weaponRoll.affixes.length * 25;
      item.archetype = weaponRoll.archetype;
      item.tags = weaponRoll.tags;
      item.affixes = weaponRoll.affixes;
      item.legendaryEffect = weaponRoll.legendaryEffect;
      item.weaponProfile = {
        fireMode: weaponRoll.profile.fireMode,
        magazineSize: weaponRoll.profile.magazineSize,
        reloadMs: weaponRoll.profile.reloadMs,
        fireIntervalMs: weaponRoll.profile.fireIntervalMs,
        spread: weaponRoll.profile.spread,
        recoil: weaponRoll.profile.recoil,
        handling: weaponRoll.profile.handling,
        pelletCount: weaponRoll.profile.pelletCount,
        projectileSpeed: weaponRoll.profile.projectileSpeed,
        projectileBehavior: {
          ...weaponRoll.profile.projectileBehavior,
        },
      };
      item.balancing = {
        itemLevel: playerLevel,
        worldTier: worldTierForLevel(playerLevel),
        dpsScore: Math.floor((weaponRoll.totalDamage / Math.max(1, weaponRoll.profile.fireIntervalMs)) * 1000),
        recoil: weaponRoll.profile.recoil,
        handling: weaponRoll.profile.handling,
      };
    }

    // Consumables and utility items get an effect tag
    const consumableTypes: ItemType[] = ['potion', 'scroll', 'food', 'grenade', 'ammo', 'gem', 'rune', 'material', 'blueprint', 'consumable'];
    if (consumableTypes.includes(type)) {
      item.effect = deriveEffect(type, name);
    }

    // High-rarity equippable items may have socket slots
    if ((type === 'weapon' || type === 'armor') && rarity === 'legendary') {
      item.socketSlots = Math.floor(Math.random() * 2) + 1;
      item.socketedGems = [];
    }

    return item;
  }

  static randomItemType(): ItemType {
    return ITEM_TYPE_POOL[Math.floor(Math.random() * ITEM_TYPE_POOL.length)];
  }

  static rollRarity(playerLevel: number, luckModifier: number = 0): LootItem['rarity'] {
    const roll = Math.random() * 100 + luckModifier;
    const levelBonus = Math.floor(playerLevel / 5);

    if (roll < 1 + levelBonus)          return 'legendary';
    if (roll < 5 + levelBonus * 2)      return 'epic';
    if (roll < 20 + levelBonus * 3)     return 'rare';
    if (roll < 50 + levelBonus * 2)     return 'uncommon';
    return 'common';
  }

  static applyModifiers(item: LootItem, modifiers: ItemModifier[]): LootItem {
    const newStats = { ...item.stats };

    modifiers.forEach(modifier => {
      if (newStats && modifier.stat in newStats) {
        if (modifier.type === 'flat') {
          newStats[modifier.stat] += modifier.value;
        } else {
          newStats[modifier.stat] = Math.floor(newStats[modifier.stat] * (1 + modifier.value / 100));
        }
      }
    });

    return {
      ...item,
      stats: newStats,
      value: calculateValue(item.type, item.rarity, newStats),
    };
  }

  /** Returns the display colour for a given rarity string. */
  static getRarityColor(rarity: LootItem['rarity']): string {
    return RARITY_VALUES[rarity]?.color ?? '#ffffff';
  }

  /** Human-readable category label for each item type. */
  static getTypeLabel(type: ItemType): string {
    const labels: Record<ItemType, string> = {
      weapon: 'Weapon', ammo: 'Ammo', armor: 'Armor', consumable: 'Consumable',
      potion: 'Potion', scroll: 'Scroll', gem: 'Gem', rune: 'Rune',
      relic: 'Relic', blueprint: 'Blueprint', material: 'Material',
      accessory: 'Accessory', offhand: 'Off-Hand', grenade: 'Grenade',
      food: 'Food', artifact: 'Artifact',
    };
    return labels[type] ?? type;
  }
}
