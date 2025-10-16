# LooterShooter: Complete Dungeon Crawler Game Guide

## Table of Contents
- [Game Overview](#game-overview)
- [Getting Started](#getting-started)
- [Game Controls](#game-controls)
- [Core Gameplay](#core-gameplay)
- [Game Systems](#game-systems)
- [Character Progression](#character-progression)
- [Multiplayer Features](#multiplayer-features)
- [UI Components](#ui-components)
- [Technical Details](#technical-details)
- [Troubleshooting](#troubleshooting)

## Game Overview

**LooterShooter** is a 3D multiplayer dungeon crawler built with cutting-edge web technologies. Dive into procedurally generated dungeons, battle fierce enemies, collect epic loot, master powerful spells, and team up with friends in this action-packed adventure.

### Key Features
- **Procedural Dungeon Generation**: Every dungeon is unique with rooms, corridors, traps, and secrets
- **Real-time Combat**: Fast-paced action with multiple damage types and status effects
- **Rich Loot System**: 5 rarity tiers with weapons, armor, potions, and scrolls
- **Spell System**: 6 unique spells with upgrade paths and elemental effects
- **Multiplayer Support**: Party system, chat, and shared dungeon runs
- **Character Progression**: Level up, allocate skill points, and become more powerful
- **Dynamic Economy**: Shop, loot conversion, and resource management

### Technology Stack
- **Frontend**: React 18, TypeScript, Vite
- **3D Graphics**: React Three Fiber, Three.js
- **State Management**: Zustand
- **UI Framework**: Radix UI, Tailwind CSS
- **Backend**: Express.js, Supabase
- **Database**: PostgreSQL

## Getting Started

### System Requirements
- **Browser**: Modern browser with WebGL 2.0 support (Chrome, Firefox, Safari, Edge)
- **Hardware**: GPU with WebGL support
- **Internet**: Required for multiplayer features

### Installation

#### For Players
1. Visit the game URL in your browser
2. Wait for the game to load
3. Start playing!

#### For Developers
```bash
# Clone the repository
git clone https://github.com/Tismejuno/LooterShooter.git
cd LooterShooter

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run check
```

### First Time Setup
1. The game automatically generates your first dungeon
2. Initial enemies and loot spawn around you
3. Press `I` to view your starting equipment
4. Use `WASD` to move and `Space` to attack
5. Explore the dungeon and defeat enemies to level up!

## Game Controls

### Movement
- **W / ↑**: Move forward
- **S / ↓**: Move backward
- **A / ←**: Move left
- **D / →**: Move right
- **Mouse**: Look around / Aim

### Combat
- **Space**: Basic attack
- **Q**: Cast spell in slot 1
- **E**: Cast spell in slot 2
- **R**: Cast spell in slot 3
- **F**: Cast spell in slot 4 (if equipped)

### Interface
- **I**: Open/close Inventory
- **T**: Open/close Skill Tree
- **ESC**: Pause game / Close windows
- **✨ Button**: Open Spell Book
- **🏪 Button**: Open Shop
- **⚗️ Button**: Open Convert menu

### Camera Controls
- **Mouse Movement**: Rotate camera
- **Scroll Wheel**: Zoom in/out (if enabled)

## Core Gameplay

### Dungeon Exploration

#### Room Types
Dungeons consist of multiple interconnected rooms:

1. **Spawn Room** (🟦): Your starting location, safe zone
2. **Normal Rooms** (⬜): Common rooms with enemies and loot
3. **Treasure Rooms** (🟨): Contain high-value loot
4. **Boss Rooms** (🟥): Challenging boss encounters with epic rewards

#### Corridors
- Connect rooms throughout the dungeon
- May contain traps and patrolling enemies
- Width varies to create interesting navigation challenges

#### Traps
Beware of four trap types:
- **Spike Traps**: Physical damage
- **Fire Traps**: Fire damage + burn effect
- **Arrow Traps**: Projectile damage
- **Poison Traps**: Poison damage over time

### Combat System

#### Damage Types
The game features six elemental damage types:

1. **Physical** ⚔️: Basic weapon damage, scales with Strength
2. **Fire** 🔥: Burning damage, scales with Intelligence
   - 30% chance to apply Burn (damage over time)
3. **Ice** ❄️: Freezing damage, scales with Intelligence
   - 40% chance to apply Slow (movement reduction)
4. **Lightning** ⚡: Shocking damage, scales with Intelligence
   - 20% chance to apply Stun (temporary disable)
5. **Poison** ☠️: Toxic damage, scales with Intelligence
   - 50% chance to apply Poison (damage over time)
6. **Arcane** ✨: Magical damage, scales with Intelligence

#### Critical Hits
- Base 10% critical hit chance
- Critical hits deal 2x damage
- Can be increased through equipment and skills

#### Status Effects
Effects that persist over time:

- **Burn**: 10% of initial damage per second for 5 seconds
- **Poison**: 5% of initial damage per second for 10 seconds
- **Slow**: 50% movement speed reduction for 4 seconds
- **Stun**: Cannot move or attack for 2 seconds
- **Freeze**: Complete movement disable (high tier ice magic)
- **Heal**: Restore health over time
- **Shield**: Absorb incoming damage

### Loot System

#### Rarity Tiers
Loot comes in five rarity levels, each with unique colors and stat multipliers:

1. **Common** (White): 1x multiplier, 10 gold base value
2. **Uncommon** (Green): 1.5x multiplier, 25 gold base value
3. **Rare** (Blue): 2x multiplier, 50 gold base value
4. **Epic** (Purple): 3x multiplier, 100 gold base value
5. **Legendary** (Orange): 5x multiplier, 250 gold base value

#### Item Types

**Weapons** ⚔️ (35% drop chance)
- Swords, Axes, Bows, Staves, Daggers, Maces, Spears, Hammers, Wands
- Provide: Damage, Attack Speed, Critical Chance
- Scale with player level

**Armor** 🛡️ (35% drop chance)
- Helmets, Chestplates, Boots, Gauntlets, Shields, Cloaks, Belts, Rings
- Provide: Defense, Health, Resistance
- Protect against damage types

**Potions** ⚗️ (20% drop chance)
- Health Potions: Restore HP instantly
- Mana Potions: Restore MP instantly
- Strength Elixirs: Temporary attack boost
- Defense Tonics: Temporary defense boost
- Speed Draughts: Temporary movement boost

**Scrolls** 📜 (10% drop chance)
- One-time use spell casts
- Fireball, Lightning, Ice Storm, Healing, Teleportation, Summoning
- Don't require mana
- Great for emergency situations

#### Loot Modifiers
Items can have special modifiers that enhance their properties:
- Increased stats (+10% to +50%)
- Additional elemental damage
- Life steal / Mana steal
- Status effect immunity
- Set bonuses (when multiple items from same set)

## Game Systems

### Spell System

#### Available Spells

1. **Fireball** 🔥 (Fire)
   - Damage: 30-50 (scales with level)
   - Mana Cost: 20 (reduces with level)
   - Cooldown: 3 seconds
   - Effect: Launches fire projectile, chance to burn
   - Upgrade: +10 damage, -2 mana cost per level

2. **Healing Light** ✨ (Holy)
   - Healing: 40-80 (scales with level)
   - Mana Cost: 25 (reduces with level)
   - Cooldown: 5 seconds
   - Effect: Heals over time, removes debuffs
   - Upgrade: +15 healing, -3 mana cost per level

3. **Blink** 💨 (Arcane)
   - Distance: 10-15 meters
   - Mana Cost: 15 (reduces with level)
   - Cooldown: 8 seconds
   - Effect: Instant teleportation, invulnerable during
   - Upgrade: +2m distance, -2 mana cost per level

4. **Summon Familiar** 🐾 (Arcane)
   - Duration: 30-60 seconds
   - Mana Cost: 40 (reduces with level)
   - Cooldown: 45 seconds
   - Effect: Summons ally to fight alongside you
   - Upgrade: +10s duration, stronger familiar per level

5. **Ice Shard** ❄️ (Ice)
   - Damage: 25-45
   - Mana Cost: 18 (reduces with level)
   - Cooldown: 2.5 seconds
   - Effect: Ice projectile, chance to slow/freeze
   - Upgrade: +8 damage, -2 mana cost per level

6. **Chain Lightning** ⚡ (Lightning)
   - Damage: 20-35 per target
   - Targets: 3-5 (increases with level)
   - Mana Cost: 35 (reduces with level)
   - Cooldown: 6 seconds
   - Effect: Jumps between nearby enemies
   - Upgrade: +1 target, +5 damage per level

#### Spell Mechanics
- **Upgrading**: Spells can be upgraded to level 5 using gold
- **Quick Slots**: Equip up to 4 spells in slots Q, E, R, F
- **Cooldowns**: Each spell has independent cooldown timer
- **Mana Management**: Balance spell usage with mana pool
- **Combos**: Chain spells for devastating effects

### Currency System

#### Gold 💰
- **Primary currency** for all transactions
- Earned by: Defeating enemies, selling items, completing dungeons
- Used for: Buying items, upgrading spells, unlocking skills

#### Essence ✨
- **Enchanting material** for item enhancement
- Earned by: Converting items (3 items → 5 essence)
- Used for: Enchanting equipment (future feature)

#### Crystals 💎
- **High-tier material** for advanced upgrades
- Earned by: Crystallizing items (5 items → 1 crystal)
- Used for: Item enhancement (future feature)

### Shop System

The merchant offers:
- **Buy Tab**: Purchase items from rotating stock
  - 12 items available at a time
  - Stock refreshes periodically
  - Prices based on item rarity and stats
  - Affordability indicators show what you can buy

- **Sell Tab**: Convert unwanted items to gold
  - Sell items for 50% of base value
  - Quick sell for inventory management
  - View all inventory items

### Loot Conversion

Transform unwanted items into useful resources:

1. **Convert to Gold** (⚱️ → 💰)
   - Exchange rate: 75% of item value
   - Instant gold for quick cash

2. **Extract Essence** (⚱️⚱️⚱️ → ✨✨✨✨✨)
   - Requires: 3 items
   - Produces: 5 essence
   - Best for common/uncommon items

3. **Crystallize** (⚱️⚱️⚱️⚱️⚱️ → 💎)
   - Requires: 5 items
   - Produces: 1 crystal
   - Best for rare+ items

**Pro Tip**: Convert low-value items to essence, sell mid-tier items for gold, and crystallize high-tier items for rare materials.

## Character Progression

### Experience and Leveling
- Gain XP by defeating enemies
- Each level requires more XP than the last
- Level up rewards:
  - Increased max HP and MP
  - Skill points for talent tree
  - Access to higher-level dungeons
  - Better loot drops

### Stats System

#### Primary Stats
- **Strength** 💪: Increases physical damage and carry capacity
- **Dexterity** 🎯: Increases attack speed and critical chance
- **Intelligence** 🧠: Increases spell damage and mana pool
- **Vitality** ❤️: Increases max health and damage resistance
- **Wisdom** 📖: Increases mana regeneration and magic resistance
- **Luck** 🍀: Increases critical chance and loot rarity

#### Derived Stats
- **Max Health**: Base 100 + (Vitality × 10)
- **Max Mana**: Base 100 + (Intelligence × 5)
- **Defense**: Vitality × 0.3 (damage reduction)
- **Critical Chance**: Base 10% + (Dexterity × 0.5%)
- **Movement Speed**: Base 5 units/s

### Skill Tree
- Open with `T` key
- Earn skill points on level up
- Multiple branches:
  - **Warrior**: Physical damage, defense, melee skills
  - **Mage**: Spell power, mana efficiency, elemental mastery
  - **Rogue**: Critical damage, speed, stealth abilities
  - **Support**: Healing, buffs, party benefits
- Unlock powerful passive and active abilities
- Respec available for gold cost

### Inventory Management

#### Inventory Capacity
- **30 slots** total capacity
- **Equipment slots**: Weapon, Helmet, Chest, Boots, Gloves, Ring
- **Auto-sorting**: Items organize by rarity and type
- **Quick actions**: Right-click for context menu

#### Item Actions
- **Equip**: Left-click or drag to equipment slot
- **Unequip**: Right-click equipped item
- **Sell**: Drag to shop or use quick-sell
- **Drop**: Remove from inventory (careful!)
- **Compare**: Hover to see stat differences
- **Lock**: Prevent accidental deletion (future feature)

## Multiplayer Features

### Party System

#### Creating a Party
1. Click "Create Party" button
2. Set maximum members (2-4 players)
3. Share party code with friends
4. Wait for members to join

#### Joining a Party
1. Click "Join Party" button
2. Enter party code
3. Accept party invitation
4. Spawn together in shared dungeon

#### Party Benefits
- **Shared Loot**: Items distributed fairly
- **XP Bonus**: 10% bonus per party member
- **Difficulty Scaling**: Enemies scale with party size
- **Revive System**: Downed players can be revived
- **Party Chat**: Private communication channel

### Chat System

#### Chat Channels
1. **Global** 🌍: Talk to all players
2. **Party** 👥: Private party chat
3. **Whisper** 💬: Direct messages

#### Chat Commands
- `/party [message]`: Send to party
- `/w [player] [message]`: Whisper to player
- `/g [message]`: Global chat
- `/help`: Show command list
- `/leave`: Leave current party
- `/invite [player]`: Invite to party

### Real-time Synchronization
- Player positions update in real-time
- Enemy states synchronized
- Loot drops visible to all party members
- Combat events broadcast
- Status effects tracked across clients

### Supabase Integration
- **Player Profiles**: Persistent character data
- **Leaderboards**: Track top players
- **Achievements**: Unlock and display achievements
- **Save System**: Cloud save your progress
- **Social Features**: Friend lists, guilds (future)

## UI Components

### Main HUD (Heads-Up Display)

#### Top-Left: Player Stats
- **Health Bar** (Red): Current HP / Max HP
- **Mana Bar** (Blue): Current MP / Max MP
- **Experience Bar** (Yellow): Progress to next level
- **Level Display**: Current character level
- **Gold Counter**: Available gold 💰

#### Top-Right: Minimap
- Shows dungeon layout
- Player position (green dot)
- Enemies (red dots)
- Loot (yellow dots)
- Rooms and corridors
- Fog of war (unexplored areas)

#### Bottom-Right: Quick Actions
- **✨ Spells**: Open spell book
- **🏪 Shop**: Access merchant
- **⚗️ Convert**: Item conversion menu

#### Bottom-Center: Spell Quick Bar
- Shows equipped spells in slots Q, E, R, F
- Cooldown timers
- Mana cost display
- Visual feedback when ready

### Inventory Screen (Press I)
- 30-slot grid layout
- Equipment panel on left
- Item tooltips on hover
- Rarity-coded borders
- Filter and sort options
- Quick-sell button

### Spell Book (✨ Button)
- 6 spell cards with full details
- Current level and upgrade cost
- Damage/healing values
- Cooldown and mana information
- Upgrade button (if enough gold)
- Equip to quick slot button
- Elemental icon and color coding

### Shop Interface (🏪 Button)
- **Buy Tab**:
  - 12 items in rotating stock
  - Item previews with stats
  - Price tags
  - Affordability indicators
  - "Refresh Stock" button
  - Purchase confirmation

- **Sell Tab**:
  - All inventory items
  - Sell value shown (50% of base)
  - Bulk-select option
  - Total gold preview
  - "Sell Selected" button

### Convert Menu (⚗️ Button)
- **Three conversion tabs**:
  1. Gold: Item → 75% gold value
  2. Essence: 3 items → 5 essence
  3. Crystals: 5 items → 1 crystal

- **Features**:
  - Multi-select items
  - Conversion preview
  - Resource tracking
  - Conversion animation
  - Undo last conversion

### Skill Tree (Press T)
- Tree visualization
- Multiple branches
- Point allocation
- Skill descriptions
- Requirements display
- Reset option (costs gold)
- Preview build calculator

## Technical Details

### Performance Optimization
- **LOD System**: Distant objects use lower detail
- **Occlusion Culling**: Don't render hidden objects
- **Instancing**: Efficient rendering of multiple similar objects
- **Asset Loading**: Lazy loading of textures and models
- **State Management**: Optimized Zustand stores
- **Frame Rate**: Target 60 FPS, adaptive quality

### Save System
- **Auto-save**: Every 5 minutes
- **Cloud Save**: Synced to Supabase
- **Local Backup**: Browser localStorage
- **Save Data Includes**:
  - Character stats and level
  - Inventory and equipment
  - Unlocked spells and skills
  - Currency (gold, essence, crystals)
  - Dungeon progress
  - Achievements

### Networking
- **WebSocket**: Real-time player synchronization
- **REST API**: Authentication, save/load
- **Supabase Realtime**: Database change subscriptions
- **Rate Limiting**: Prevent abuse
- **Encryption**: Secure data transmission

### Dungeon Generation Algorithm
1. Generate spawn room at origin
2. Calculate number of rooms based on level (3 + level/2, max 8)
3. Place rooms in circular pattern around spawn
4. Determine room types (treasure, boss, normal)
5. Create corridors connecting rooms
6. Place traps in rooms and corridors (level-dependent)
7. Generate enemy spawn points
8. Create wall boundaries
9. Validate connectivity
10. Return dungeon layout

### Combat Calculation Example
```typescript
// Physical damage with strength modifier
baseDamage = 50
strength = 10
damageType = 'physical'
totalDamage = 50 + (10 * 0.5) = 55

// Apply defender vitality resistance
vitality = 8
resistance = 8 * 0.3 = 2.4
finalDamage = 55 - 2.4 = 52.6

// Critical hit check (10% chance)
if (critical) {
  finalDamage = 52.6 * 2 = 105.2
}

// Round down to integer
finalDamage = 105
```

### File Structure
```
LooterShooter/
├── client/                    # Frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── game/         # 3D game entities
│   │   │   │   ├── Player.tsx
│   │   │   │   ├── Enemy.tsx
│   │   │   │   ├── Dungeon.tsx
│   │   │   │   ├── Loot.tsx
│   │   │   │   └── GameScene.tsx
│   │   │   └── ui/           # UI components
│   │   │       ├── GameUI.tsx
│   │   │       ├── Inventory.tsx
│   │   │       ├── SpellBook.tsx
│   │   │       ├── Shop.tsx
│   │   │       ├── Convert.tsx
│   │   │       ├── SkillTree.tsx
│   │   │       └── Minimap.tsx
│   │   ├── lib/
│   │   │   ├── stores/       # Zustand state management
│   │   │   │   ├── usePlayer.tsx
│   │   │   │   ├── useEnemies.tsx
│   │   │   │   ├── useDungeon.tsx
│   │   │   │   ├── useLoot.tsx
│   │   │   │   └── useGame.tsx
│   │   │   ├── DungeonEngine.ts   # Procedural generation
│   │   │   ├── CombatSystem.ts    # Combat calculations
│   │   │   ├── LootSystem.ts      # Item generation
│   │   │   ├── GameLoop.ts        # Core game loop
│   │   │   ├── Multiplayer.ts     # Networking
│   │   │   ├── gameTypes.ts       # TypeScript types
│   │   │   └── gameUtils.ts       # Utility functions
│   │   ├── App.tsx           # Main application
│   │   └── main.tsx          # Entry point
│   └── public/               # Static assets
├── server/                   # Backend API
│   ├── routes.ts            # API endpoints
│   ├── index.ts             # Server entry
│   └── storage.ts           # Database operations
├── shared/                   # Shared types and utilities
├── looter_shooter_dungeon.py      # Python dungeon generator
├── looter_shooter_game.py         # Python game simulation
├── dungeon_integration.py         # CLI for dungeon generation
├── looter_shooter_integration.py  # CLI for game mechanics
└── package.json             # Dependencies and scripts
```

## Troubleshooting

### Common Issues

#### Game Won't Load
**Problem**: Black screen or loading forever
**Solutions**:
1. Check browser console for errors (F12)
2. Verify WebGL support: Visit [WebGL Test](https://get.webgl.org/)
3. Update graphics drivers
4. Try different browser
5. Disable browser extensions
6. Clear browser cache

#### Low FPS / Stuttering
**Problem**: Game runs slowly or choppy
**Solutions**:
1. Close other tabs and applications
2. Lower graphics quality in settings
3. Disable browser hardware acceleration
4. Update graphics drivers
5. Check CPU/GPU usage
6. Reduce particle effects

#### Controls Not Working
**Problem**: Keyboard/mouse input not responding
**Solutions**:
1. Click on game canvas to focus
2. Check if another window has focus
3. Verify keyboard layout (QWERTY)
4. Try refreshing the page
5. Check browser permissions
6. Disable conflicting extensions

#### Multiplayer Connection Failed
**Problem**: Cannot join party or see other players
**Solutions**:
1. Check internet connection
2. Verify firewall settings
3. Check if Supabase is accessible
4. Try different network
5. Contact server administrator
6. Check browser console for errors

#### Items Not Appearing
**Problem**: Loot doesn't spawn or disappears
**Solutions**:
1. Check inventory isn't full
2. Verify loot is enabled in settings
3. Look around - items may be behind walls
4. Refresh dungeon
5. Report bug if persists

#### Spells Not Casting
**Problem**: Spells don't work when pressing keys
**Solutions**:
1. Check mana is sufficient
2. Verify spell is equipped
3. Wait for cooldown to complete
4. Ensure spell is unlocked
5. Check for stun/silence effects

### WebGL Not Supported
If you see "WebGL Not Supported" error:

1. **Update Browser**: Use latest Chrome, Firefox, Safari, or Edge
2. **Enable WebGL**:
   - Chrome: `chrome://flags/#enable-webgl2`
   - Firefox: `about:config` → `webgl.disabled` = false
3. **Update Drivers**: Update GPU drivers from manufacturer
4. **Hardware Acceleration**: Enable in browser settings
5. **Try Different Browser**: Some browsers have better WebGL support

### Performance Tips
- **Graphics Settings**: Lower quality on slower machines
- **Close Tabs**: Free up system resources
- **Windowed Mode**: Run in smaller window
- **Disable Effects**: Turn off shadows and particles
- **Update Drivers**: Keep GPU drivers current
- **Monitor Temperature**: Ensure computer isn't overheating

### Bug Reporting
If you encounter a bug:

1. **Check Console**: Press F12, look for errors
2. **Reproduce**: Can you make it happen again?
3. **Screenshot**: Capture the issue
4. **System Info**: Browser, OS, GPU
5. **Steps**: What were you doing?
6. **Report**: Submit issue on GitHub

### Getting Help
- **GitHub Issues**: Report bugs and request features
- **Discord**: Join community server for real-time help
- **Documentation**: Check FEATURES.md and README.md
- **Wiki**: Community-maintained guides and tips

## Advanced Topics

### Speedrunning
- **Categories**: Any%, 100%, Level 10 Rush
- **Strategies**: Optimal paths, skip techniques
- **Records**: Track at [speedrun.com placeholder]
- **Tools**: Timer overlays, route planners

### Modding
- **Asset Replacement**: Custom textures and models
- **Spell Creation**: Design new spells
- **Enemy AI**: Modify behavior patterns
- **Balance Changes**: Tweak damage, costs
- **Share Mods**: Community mod repository

### Competitive Play
- **PvP Mode**: Player vs Player combat
- **Leaderboards**: Fastest clears, highest scores
- **Tournaments**: Regular events
- **Rankings**: ELO-based matchmaking
- **Rewards**: Exclusive items and titles

## Credits & License

### Development Team
- **Core Engine**: React Three Fiber, Three.js
- **State Management**: Zustand
- **UI Framework**: Radix UI, Tailwind CSS
- **Backend**: Express.js, Supabase

### Assets
- 3D Models: [Source TBD]
- Sound Effects: [Source TBD]
- Music: [Source TBD]
- Icons: [Source TBD]

### License
This project is licensed under the MIT License.

### Contributing
Contributions are welcome! Please read CONTRIBUTING.md (if available) for guidelines.

---

**Have fun exploring the dungeons, and may the loot be ever in your favor!** 🎮⚔️✨
