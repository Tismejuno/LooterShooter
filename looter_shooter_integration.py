#!/usr/bin/env python3
"""
LooterShooter Game Integration Module

This module provides a command-line interface for the Node.js/TypeScript backend
to interact with the Python game mechanics. It allows the backend server to
generate loot, simulate combat, and run dungeon scenarios via subprocess calls.

Usage from command line:
    python3 looter_shooter_integration.py --action generate-loot --level 5
    python3 looter_shooter_integration.py --action simulate-combat --player-level 5 --enemy-level 5
    python3 looter_shooter_integration.py --action simulate-dungeon --player-level 10 --dungeon-level 5

Usage from Node.js:
    const { execFileSync } = require('child_process');
    const result = JSON.parse(
        execFileSync('python3', [
            'looter_shooter_integration.py',
            '--action', 'generate-loot',
            '--level', '5',
            '--count', '3'
        ]).toString()
    );
"""

import sys
import json
import argparse
from looter_shooter_game import (
    ItemRarity, ItemType, LootSystem, CombatSystem, 
    EnemyFactory, GameSimulator
)


def generate_loot_json(
    count: int = 1,
    rarity: str = 'common',
    item_type: str = None,
    level: int = 1,
    seed: int = None
) -> str:
    """
    Generate loot items and return as JSON.
    
    Args:
        count: Number of items to generate
        rarity: Item rarity (common, uncommon, rare, epic, legendary)
        item_type: Optional item type (weapon, armor, potion, scroll)
        level: Player level for scaling stats
        seed: Optional random seed for reproducible generation
        
    Returns:
        JSON string representation of generated loot
    """
    import random
    
    if seed is not None:
        random.seed(seed)
    
    try:
        rarity_enum = ItemRarity[rarity.upper()]
    except KeyError:
        raise ValueError(f"Invalid rarity: {rarity}. Must be one of: common, uncommon, rare, epic, legendary")
    
    item_type_enum = None
    if item_type:
        try:
            item_type_enum = ItemType[item_type.upper()]
        except KeyError:
            raise ValueError(f"Invalid item type: {item_type}. Must be one of: weapon, armor, potion, scroll")
    
    items = []
    for _ in range(count):
        item = LootSystem.generate_item(rarity_enum, item_type_enum, level)
        items.append(item.to_dict())
    
    return json.dumps({'items': items})


def simulate_combat_json(
    player_level: int = 1,
    enemy_level: int = 1,
    enemy_type: str = 'zombie',
    seed: int = None
) -> str:
    """
    Simulate combat and return result as JSON.
    
    Args:
        player_level: Player level
        enemy_level: Enemy level
        enemy_type: Enemy type (zombie, skeleton, orc, demon)
        seed: Optional random seed for reproducible generation
        
    Returns:
        JSON string representation of combat result
    """
    import random
    
    if seed is not None:
        random.seed(seed)
    
    player = GameSimulator.create_player("Hero", player_level)
    enemy = EnemyFactory.create_enemy(enemy_type, enemy_level)
    
    combat_result = CombatSystem.simulate_combat(player, enemy)
    
    result = {
        'player': player.to_dict(),
        'enemy': enemy.to_dict(),
        'combat': combat_result
    }
    
    return json.dumps(result)


def simulate_dungeon_json(
    player_level: int = 1,
    dungeon_level: int = 1,
    seed: int = None
) -> str:
    """
    Simulate a complete dungeon run and return result as JSON.
    
    Args:
        player_level: Player level
        dungeon_level: Dungeon difficulty level
        seed: Optional random seed for reproducible generation
        
    Returns:
        JSON string representation of dungeon run result
    """
    import random
    
    if seed is not None:
        random.seed(seed)
    
    dungeon_result = GameSimulator.simulate_dungeon_run(player_level, dungeon_level)
    
    return json.dumps(dungeon_result)


def main():
    """Main entry point for command-line usage"""
    parser = argparse.ArgumentParser(
        description='LooterShooter Game Integration',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  Generate loot items:
    python3 looter_shooter_integration.py --action generate-loot --level 5 --count 3
  
  Simulate combat:
    python3 looter_shooter_integration.py --action simulate-combat --player-level 5 --enemy-level 5
  
  Simulate dungeon run:
    python3 looter_shooter_integration.py --action simulate-dungeon --player-level 10 --dungeon-level 5
  
  Use seed for reproducibility:
    python3 looter_shooter_integration.py --action generate-loot --level 5 --seed 42
        """
    )
    
    parser.add_argument(
        '--action',
        type=str,
        required=True,
        choices=['generate-loot', 'simulate-combat', 'simulate-dungeon'],
        help='Action to perform'
    )
    
    parser.add_argument(
        '--level',
        type=int,
        default=1,
        help='Player or dungeon level (default: 1)'
    )
    
    parser.add_argument(
        '--player-level',
        type=int,
        default=1,
        help='Player level for combat/dungeon simulation (default: 1)'
    )
    
    parser.add_argument(
        '--enemy-level',
        type=int,
        default=1,
        help='Enemy level for combat simulation (default: 1)'
    )
    
    parser.add_argument(
        '--dungeon-level',
        type=int,
        default=1,
        help='Dungeon level for dungeon simulation (default: 1)'
    )
    
    parser.add_argument(
        '--enemy-type',
        type=str,
        default='zombie',
        choices=['zombie', 'skeleton', 'orc', 'demon'],
        help='Enemy type for combat simulation (default: zombie)'
    )
    
    parser.add_argument(
        '--rarity',
        type=str,
        default='common',
        choices=['common', 'uncommon', 'rare', 'epic', 'legendary'],
        help='Item rarity for loot generation (default: common)'
    )
    
    parser.add_argument(
        '--item-type',
        type=str,
        choices=['weapon', 'armor', 'potion', 'scroll'],
        help='Item type for loot generation (optional)'
    )
    
    parser.add_argument(
        '--count',
        type=int,
        default=1,
        help='Number of items to generate (default: 1)'
    )
    
    parser.add_argument(
        '--seed',
        type=int,
        help='Random seed for reproducible results'
    )
    
    parser.add_argument(
        '--compact',
        action='store_true',
        help='Output compact JSON (no indentation)'
    )
    
    args = parser.parse_args()
    
    try:
        if args.action == 'generate-loot':
            output = generate_loot_json(
                count=args.count,
                rarity=args.rarity,
                item_type=args.item_type,
                level=args.level,
                seed=args.seed
            )
        elif args.action == 'simulate-combat':
            output = simulate_combat_json(
                player_level=args.player_level,
                enemy_level=args.enemy_level,
                enemy_type=args.enemy_type,
                seed=args.seed
            )
        elif args.action == 'simulate-dungeon':
            output = simulate_dungeon_json(
                player_level=args.player_level,
                dungeon_level=args.dungeon_level,
                seed=args.seed
            )
        else:
            parser.print_help()
            return 1
        
        # Parse and re-output with proper formatting
        if args.compact:
            print(output)
        else:
            data = json.loads(output)
            print(json.dumps(data, indent=2))
        
        return 0
        
    except Exception as e:
        error_output = {
            'error': str(e),
            'type': type(e).__name__
        }
        print(json.dumps(error_output), file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
