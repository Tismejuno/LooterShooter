# LooterShooter - Full Multiplayer Dungeon Crawler

A 3D multiplayer dungeon crawler game built with TypeScript, React, React Three Fiber, Zustand, Tailwind CSS, Vite, and Supabase.

## Features

### Core Systems

#### 1. **DungeonEngine** (`client/src/lib/DungeonEngine.ts`)
Procedural dungeon generation with:
- Multiple room types (normal, treasure, boss, spawn)
- Interconnected corridors
- Trap placement (spike, fire, arrow, poison)
- Enemy spawn points with cooldown management
- Automatic wall generation
- Scales difficulty with dungeon level

#### 2. **CombatSystem** (`client/src/lib/CombatSystem.ts`)
Advanced real-time combat featuring:
- Multiple damage types: physical, fire, ice, lightning, poison, arcane
- Critical hit mechanics
- Status effects: burn, freeze, slow, stun, poison, heal
- Damage calculation with stat modifiers
- Collision detection for projectiles
- Knockback calculations
- Range checking utilities

#### 3. **LootSystem** (`client/src/lib/LootSystem.ts`)
Comprehensive item generation:
- 5 rarity tiers: common, uncommon, rare, epic, legendary
- Item types: weapons, armor, potions, scrolls
- Stat generation with level scaling
- Random name generation
- Item modifiers and upgrades
- Sell value calculation
- Special effects for consumables

#### 4. **GameLoop** (`client/src/lib/GameLoop.ts`)
Core game loop management:
- Variable and fixed update cycles
- FPS tracking
- Time scaling for slow-mo effects
- Pause/resume functionality
- Input manager for keyboard/mouse
- State machine for game states
- Update scheduler for task management

#### 5. **Multiplayer** (`client/src/lib/Multiplayer.ts`)
Real-time synchronization with:
- WebSocket-based player sync
- Party system (create, join, leave)
- Chat system (party, global, whisper channels)
- Shared dungeon runs
- Supabase integration for persistence
- Real-time player position updates

### UI Components

#### 6. **SpellBook** (`client/src/components/ui/SpellBook.tsx`)
Spell management interface:
- 6 unique spells: Fireball, Healing Light, Blink, Summon Familiar, Ice Shard, Chain Lightning
- Spell leveling system (max level 5)
- Mana cost and cooldown display
- Element-based visual design
- Upgrade system with gold costs
- Quick slot assignment

#### 7. **Shop** (`client/src/components/ui/Shop.tsx`)
In-game merchant system:
- Buy/Sell tabs
- Random item stock generation
- Stock refresh mechanism
- Item inspection
- Affordability checks
- Dynamic pricing (sell at 50% value)

#### 8. **Convert** (`client/src/components/ui/Convert.tsx`)
Loot conversion system:
- Convert items to gold (75% value)
- Extract essence (3 items → 5 essence)
- Crystallize (5 items → 1 crystal)
- Multi-select interface
- Conversion preview
- Material tracking

### Enhanced Player Systems

#### Currency System
- **Gold**: Primary currency for shop purchases
- **Essence**: Used for enchanting (future feature)
- **Crystals**: Used for item enhancement (future feature)

#### Spell System
- Equipped spells in 4 quick slots (Q, E, R, F)
- Spell upgrade path
- Cooldown management
- Mana cost reduction on level up
- Elemental damage types

#### Status Effects
- Burn: Damage over time
- Poison: Damage over time
- Freeze/Slow: Movement reduction
- Stun: Temporary disable
- Heal: Health over time
- Shield: Damage absorption

#### Consumables
- Health potions: Restore HP
- Mana potions: Restore MP
- Stat boosters: Temporary buffs
- Scrolls: One-time spell casts

### Enhanced Dungeon System

The dungeon store now integrates the DungeonEngine for:
- Procedurally generated multi-room dungeons
- Trap tracking and triggering
- Enemy spawn point management
- Boss room generation
- Treasure room placement

### Game State Enhancements

**Player State** (`client/src/lib/stores/usePlayer.tsx`):
- Currency tracking (gold, essence, crystals)
- Spell collection and equipped spells
- Status effect management
- Consumable usage
- Spell casting system
- Gold transaction methods

**Dungeon State** (`client/src/lib/stores/useDungeon.tsx`):
- Trap management
- Spawn point tracking
- Enhanced room types
- Corridor generation

## Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **3D Rendering**: React Three Fiber (@react-three/fiber + @react-three/drei)
- **State Management**: Zustand
- **UI Components**: Radix UI
- **Styling**: Tailwind CSS
- **Backend**: Express.js + Supabase (for multiplayer)
- **Database**: PostgreSQL (via Supabase)

### Project Structure
```
client/src/
├── components/
│   ├── game/          # 3D game entities (Player, Enemy, Loot, etc.)
│   └── ui/            # UI components (Inventory, Shop, SpellBook, etc.)
├── lib/
│   ├── stores/        # Zustand state stores
│   ├── gameTypes.ts   # TypeScript interfaces
│   ├── gameUtils.ts   # Utility functions
│   ├── DungeonEngine.ts
│   ├── CombatSystem.ts
│   ├── LootSystem.ts
│   ├── GameLoop.ts
│   └── Multiplayer.ts
└── pages/             # React Router pages
```

## Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Type Checking
```bash
npm run check
```

## Game Controls

- **WASD**: Move player
- **SPACE**: Attack
- **Q/E/R**: Cast spells (quick slots)
- **I**: Open inventory
- **T**: Open skill tree
- **Click buttons**: Access Shop, Spells, Convert

## Multiplayer Setup

To enable multiplayer features:

1. Set up a Supabase project at https://supabase.com
2. Configure WebSocket server or use Supabase Realtime
3. Update connection settings in Multiplayer.ts
4. Enable authentication for player accounts

## Future Enhancements

- [ ] Implement Supabase authentication
- [ ] Add WebSocket server for real-time multiplayer
- [ ] Implement enchanting system with essence
- [ ] Add item enhancement with crystals
- [ ] Create more spell types and combinations
- [ ] Add more enemy types with unique AI
- [ ] Implement procedural dungeon themes
- [ ] Add boss fight mechanics
- [ ] Create achievement system
- [ ] Add sound effects and music
- [ ] Mobile responsive controls
- [ ] Leaderboards and rankings

## Contributing

This is a demonstration project showcasing full-stack game development with modern web technologies.

## License

MIT
