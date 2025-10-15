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

See full feature documentation in [FEATURES.md](FEATURES.md).