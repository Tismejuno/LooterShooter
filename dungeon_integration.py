#!/usr/bin/env python3
"""
Dungeon Integration Module

This module provides a command-line interface for the Node.js/TypeScript backend
to interact with the Python dungeon generator. It allows the backend server to
generate dungeons via subprocess calls and receive JSON output.

Usage from command line:
    python3 dungeon_integration.py --level 5
    python3 dungeon_integration.py --level 10 --seed 42

Usage from Node.js:
    const { execSync } = require('child_process');
    const dungeon = JSON.parse(
        execSync('python3 dungeon_integration.py --level 5').toString()
    );
"""

import sys
import json
import argparse
from looter_shooter_dungeon import DungeonEngine


def generate_dungeon_json(level: int, seed: int = None) -> str:
    """
    Generate a dungeon and return it as a JSON string.
    
    Args:
        level: Dungeon difficulty level
        seed: Optional random seed for reproducible generation
        
    Returns:
        JSON string representation of the dungeon
    """
    import random
    
    if seed is not None:
        random.seed(seed)
    
    engine = DungeonEngine()
    dungeon = engine.generate_dungeon(level)
    
    return json.dumps(dungeon, indent=2)


def main():
    """Main entry point for command-line usage"""
    parser = argparse.ArgumentParser(
        description='Dungeon Integration - Generate dungeons for LooterShooter backend',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument(
        '--level', '-l',
        type=int,
        required=True,
        help='Dungeon level (difficulty)'
    )
    
    parser.add_argument(
        '--seed',
        type=int,
        help='Random seed for reproducible generation'
    )
    
    parser.add_argument(
        '--validate',
        action='store_true',
        help='Validate the generated dungeon structure'
    )
    
    parser.add_argument(
        '--compact',
        action='store_true',
        help='Output compact JSON (no indentation)'
    )
    
    args = parser.parse_args()
    
    try:
        import random
        
        if args.seed is not None:
            random.seed(args.seed)
        
        engine = DungeonEngine()
        dungeon = engine.generate_dungeon(args.level)
        
        # Validate if requested
        if args.validate:
            validate_dungeon(dungeon)
        
        # Output JSON
        if args.compact:
            print(json.dumps(dungeon))
        else:
            print(json.dumps(dungeon, indent=2))
        
        return 0
        
    except Exception as e:
        print(json.dumps({
            'error': str(e),
            'type': type(e).__name__
        }), file=sys.stderr)
        return 1


def validate_dungeon(dungeon: dict) -> bool:
    """
    Validate that the dungeon structure is correct.
    
    Args:
        dungeon: Dungeon data dictionary
        
    Returns:
        True if valid, raises exception if invalid
    """
    required_keys = ['rooms', 'corridors', 'traps', 'spawnPoints', 'walls', 'level', 'metadata']
    
    for key in required_keys:
        if key not in dungeon:
            raise ValueError(f"Missing required key: {key}")
    
    # Validate rooms
    if not isinstance(dungeon['rooms'], list) or len(dungeon['rooms']) == 0:
        raise ValueError("Dungeon must have at least one room")
    
    # Check for spawn room
    spawn_rooms = [r for r in dungeon['rooms'] if r['type'] == 'spawn']
    if len(spawn_rooms) == 0:
        raise ValueError("Dungeon must have a spawn room")
    
    # Validate metadata
    metadata = dungeon['metadata']
    if metadata['num_rooms'] != len(dungeon['rooms']):
        raise ValueError("Metadata room count doesn't match actual rooms")
    
    if metadata['num_traps'] != len(dungeon['traps']):
        raise ValueError("Metadata trap count doesn't match actual traps")
    
    if metadata['num_spawn_points'] != len(dungeon['spawnPoints']):
        raise ValueError("Metadata spawn point count doesn't match actual spawn points")
    
    return True


if __name__ == '__main__':
    sys.exit(main())
