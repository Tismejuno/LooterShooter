# LooterShooter

A 3D multiplayer dungeon crawler game built with TypeScript, React, React Three Fiber, Zustand, Tailwind CSS, Vite, and Supabase.

## Tools

### looter_shooter_dungeon.py

A Python utility for dungeon generation, testing, and visualization. This script provides:
- Procedural dungeon generation matching the TypeScript DungeonEngine
- ASCII visualization of dungeon layouts
- JSON export for integration with the game
- Batch generation with statistics

**Usage:**
```bash
# Generate and visualize a level 5 dungeon
python3 looter_shooter_dungeon.py --level 5 --visualize

# Export a level 10 dungeon to JSON
python3 looter_shooter_dungeon.py --level 10 --export dungeon.json

# Generate multiple dungeons with stats
python3 looter_shooter_dungeon.py --level 3 --count 5 --stats

# Use a seed for reproducible generation
python3 looter_shooter_dungeon.py --level 5 --seed 42 --visualize
```

### looter_shooter_game.py

A Python utility for game mechanics simulation and testing. This script provides:
- Combat system simulation with damage calculation and status effects
- Loot generation system with multiple rarity tiers
- Complete dungeon run simulations with enemies and loot
- Player progression and stats testing

**Usage:**
```bash
# Simulate combat between player and enemy
python3 looter_shooter_game.py --simulate-combat --player-level 5 --enemy-level 5

# Generate random loot items
python3 looter_shooter_game.py --generate-loot --rarity rare --count 5

# Simulate a complete dungeon run
python3 looter_shooter_game.py --simulate-dungeon-run --player-level 10 --dungeon-level 5

# Export results to JSON file
python3 looter_shooter_game.py --simulate-dungeon-run --player-level 15 --dungeon-level 3 --export results.json

# Use a seed for reproducible results
python3 looter_shooter_game.py --generate-loot --rarity legendary --seed 42
```

### dungeon_integration.py

A command-line interface for the Node.js/TypeScript backend to interact with the Python dungeon generator. This module enables server-side dungeon generation via subprocess calls.

**Usage:**
```bash
# Generate a dungeon and output JSON
python3 dungeon_integration.py --level 5

# Generate with a specific seed for reproducibility
python3 dungeon_integration.py --level 10 --seed 42

# Generate with validation
python3 dungeon_integration.py --level 3 --validate

# Generate compact JSON (no indentation)
python3 dungeon_integration.py --level 7 --compact
```

**API Endpoint:**

The server provides a REST API endpoint for dungeon generation:

```bash
# Generate a dungeon via HTTP POST
curl -X POST http://localhost:5000/api/dungeon/generate \
  -H "Content-Type: application/json" \
  -d '{"level": 5, "seed": 42}'
```

**Response Format:**
```json
{
  "rooms": [...],
  "corridors": [...],
  "traps": [...],
  "spawnPoints": [...],
  "walls": [...],
  "level": 5,
  "metadata": {
    "num_rooms": 5,
    "num_traps": 7,
    "num_spawn_points": 12
  }
}
```

### looter_shooter_integration.py

A command-line interface for the Node.js/TypeScript backend to interact with the Python game mechanics. This module enables server-side game simulation via subprocess calls.

**Usage:**
```bash
# Generate loot items
python3 looter_shooter_integration.py --action generate-loot --level 5 --count 3 --rarity rare

# Simulate combat
python3 looter_shooter_integration.py --action simulate-combat --player-level 10 --enemy-level 8 --enemy-type orc

# Simulate a complete dungeon run
python3 looter_shooter_integration.py --action simulate-dungeon --player-level 15 --dungeon-level 10

# Use seed for reproducibility
python3 looter_shooter_integration.py --action generate-loot --level 5 --seed 42 --compact
```

**API Endpoints:**

The server provides REST API endpoints for game mechanics:

1. **Generate Loot:**
```bash
curl -X POST http://localhost:5000/api/game/generate-loot \
  -H "Content-Type: application/json" \
  -d '{"level": 5, "count": 3, "rarity": "rare"}'
```

Response:
```json
{
  "items": [
    {
      "id": "item_1234",
      "name": "Sharp Sword",
      "type": "weapon",
      "rarity": "rare",
      "stats": {"damage": 40},
      "value": 150
    }
  ]
}
```

2. **Simulate Combat:**
```bash
curl -X POST http://localhost:5000/api/game/simulate-combat \
  -H "Content-Type: application/json" \
  -d '{"playerLevel": 10, "enemyLevel": 8, "enemyType": "orc"}'
```

Response:
```json
{
  "player": {...},
  "enemy": {...},
  "combat": {
    "victory": true,
    "rounds": 3,
    "finalPlayerHealth": 180,
    "finalEnemyHealth": 0,
    "combatLog": [...]
  }
}
```

3. **Simulate Dungeon Run:**
```bash
curl -X POST http://localhost:5000/api/game/simulate-dungeon \
  -H "Content-Type: application/json" \
  -d '{"playerLevel": 15, "dungeonLevel": 10}'
```

Response:
```json
{
  "success": true,
  "enemiesDefeated": 13,
  "lootCollected": [...],
  "finalStats": {...},
  "totalGold": 1500,
  "totalExperience": 450
}
```

See full feature documentation in [FEATURES.md](FEATURES.md).