# LooterShooter UI Components

This document provides an overview of all UI components in the game.

## Core UI Components

### GameUI (`GameUI.tsx`)
Main game HUD that displays:
- Health, mana, and experience bars
- Player stats panel with gold display
- Quick access menu (Spells, Shop, Convert)
- Controls help
- Minimap
- Modal management

### Inventory (`Inventory.tsx`)
Item management interface:
- 30-slot inventory grid
- Equipment slots display
- Drag-and-drop item management (visual only)
- Item tooltips with stats
- Rarity-based item coloring
- Equip/unequip functionality

### SkillTree (`SkillTree.tsx`)
Character progression system:
- 3 skill categories: Combat, Magic, Defense
- 11 unique skills
- Visual skill point allocation
- Skill level display (1-5)
- Category-based organization

### SpellBook (`SpellBook.tsx`)
Spell management interface:
- 6 spells: Fireball, Healing Light, Blink, Summon Familiar, Ice Shard, Chain Lightning
- Spell upgrade system
- Mana cost and cooldown display
- Element-based visual effects
- Spell equipping to quick slots
- Level progression (1-5)

### Shop (`Shop.tsx`)
Merchant trading interface:
- Buy/Sell tabs
- 12 random items in stock
- Stock quantity display
- Gold balance tracking
- Item preview with stats
- Affordability indicators
- Stock refresh button

### Convert (`Convert.tsx`)
Item conversion interface:
- 3 conversion types: Gold, Essence, Crystals
- Multi-item selection
- Conversion ratio display
- Result preview
- Visual feedback for selected items

### Minimap (`Minimap.tsx`)
Navigation aid:
- Top-down dungeon view
- Player position indicator
- Room layout display
- Real-time updates

## UI Styling

All UI components use inline styles for consistency and include:
- Dark theme with transparency
- Rarity-based color coding
- Hover effects
- Smooth transitions
- Responsive layouts

### Color Scheme

**Rarity Colors:**
- Common: `#ffffff` (white)
- Uncommon: `#1eff00` (green)
- Rare: `#0070dd` (blue)
- Epic: `#a335ee` (purple)
- Legendary: `#ff8000` (orange)

**Element Colors:**
- Fire: `#ff4400`
- Ice: `#00aaff`
- Lightning: `#ffff00`
- Arcane: `#aa00ff`
- Holy: `#ffdd00`

**UI Colors:**
- Background: `rgba(0, 0, 0, 0.8)`
- Primary: `#6c63ff`
- Secondary: `#8b7355`
- Gold: `#ffcc00`
- Health: `#ff0000`
- Mana: `#0066ff`
- XP: `#ffaa00`

## Modal Management

All modal components:
- Use fixed positioning with fullscreen overlay
- Include close button
- Prevent click-through with `pointerEvents: 'auto'`
- Support ESC key to close (to be implemented)

## Integration

UI components are integrated into the main game through `GameUI.tsx`, which:
- Manages modal state
- Subscribes to keyboard controls
- Displays appropriate UI based on game phase
- Provides quick access buttons for main features

## Future Enhancements

- Add drag-and-drop for actual item movement
- Implement keyboard shortcuts for all modals
- Add tooltips with detailed information
- Create settings menu
- Add quest log interface
- Implement achievement popup notifications
- Add party member UI
- Create chat interface overlay
