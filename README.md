# LooterShooter

A 3D multiplayer dungeon crawler game built with TypeScript, React, React Three Fiber, Zustand, Tailwind CSS, Vite, and Supabase.

## Tools

### looter-shooter-dungeon.py

A Python utility for dungeon generation, testing, and visualization. This script provides:
- Procedural dungeon generation matching the TypeScript DungeonEngine
- ASCII visualization of dungeon layouts
- JSON export for integration with the game
- Batch generation with statistics

**Usage:**
```bash
# Generate and visualize a level 5 dungeon
python3 looter-shooter-dungeon.py --level 5 --visualize

# Export a level 10 dungeon to JSON
python3 looter-shooter-dungeon.py --level 10 --export dungeon.json

# Generate multiple dungeons with stats
python3 looter-shooter-dungeon.py --level 3 --count 5 --stats

# Use a seed for reproducible generation
python3 looter-shooter-dungeon.py --level 5 --seed 42 --visualize
```

See full feature documentation in [FEATURES.md](FEATURES.md).