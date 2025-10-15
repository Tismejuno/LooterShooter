#!/usr/bin/env python3
"""
LooterShooter Dungeon Generator

A Python implementation of the dungeon generation system for the LooterShooter game.
This script can be used for:
- Testing dungeon generation algorithms
- Visualizing dungeon layouts
- Generating dungeon configurations for import into the game
- Balancing dungeon difficulty and layout

Usage:
    python looter-shooter-dungeon.py --level 5 --visualize
    python looter-shooter-dungeon.py --level 10 --export dungeon.json
"""

import json
import math
import random
import argparse
from typing import List, Dict, Tuple, Any
from dataclasses import dataclass, asdict


@dataclass
class Position:
    """3D position in the dungeon"""
    x: float
    y: float
    z: float


@dataclass
class Room:
    """Dungeon room definition"""
    x: float
    z: float
    width: float
    height: float
    type: str  # 'normal', 'treasure', 'boss', 'spawn'


@dataclass
class Corridor:
    """Corridor connecting two rooms"""
    start: Position
    end: Position
    width: float


@dataclass
class Trap:
    """Trap entity in the dungeon"""
    id: str
    position: Position
    type: str  # 'spike', 'fire', 'arrow', 'poison'
    damage: int
    triggered: bool = False


@dataclass
class SpawnPoint:
    """Enemy spawn point"""
    position: Position
    enemy_type: str
    cooldown: int
    last_spawn: int = 0


@dataclass
class Wall:
    """Wall segment"""
    x: float
    z: float
    width: float
    height: float
    depth: float


class DungeonEngine:
    """Dungeon generation engine matching the TypeScript implementation"""
    
    def __init__(self):
        self.trap_id_counter = 0
        self.spawn_point_id_counter = 0
    
    def generate_dungeon(self, level: int) -> Dict[str, Any]:
        """Generate a complete dungeon layout based on level"""
        rooms: List[Room] = []
        corridors: List[Corridor] = []
        traps: List[Trap] = []
        spawn_points: List[SpawnPoint] = []
        walls: List[Wall] = []
        
        # Generate main spawn room
        spawn_room = Room(
            x=0.0,
            z=0.0,
            width=15.0,
            height=15.0,
            type='spawn'
        )
        rooms.append(spawn_room)
        
        # Generate additional rooms based on level
        num_rooms = min(3 + level // 2, 8)
        room_distance = 25
        
        for i in range(1, num_rooms):
            angle = (i / num_rooms) * math.pi * 2
            distance = room_distance + random.random() * 10
            
            room_type = self._determine_room_type(i, num_rooms)
            
            room = Room(
                x=math.cos(angle) * distance,
                z=math.sin(angle) * distance,
                width=10.0 + random.random() * 8.0,
                height=10.0 + random.random() * 8.0,
                type=room_type
            )
            rooms.append(room)
            
            # Create corridor from previous room
            if i > 0:
                prev_room = rooms[i - 1]
                corridors.append(Corridor(
                    start=Position(prev_room.x, 0, prev_room.z),
                    end=Position(room.x, 0, room.z),
                    width=3.0
                ))
        
        # Connect last room back to spawn
        if len(rooms) > 1:
            last_room = rooms[-1]
            corridors.append(Corridor(
                start=Position(last_room.x, 0, last_room.z),
                end=Position(spawn_room.x, 0, spawn_room.z),
                width=3.0
            ))
        
        # Generate traps based on level
        num_traps = int(level * 1.5)
        for i in range(num_traps):
            room = random.choice(rooms)
            traps.append(self._create_trap(room, level))
        
        # Generate enemy spawn points
        for room in rooms:
            if room.type != 'spawn':
                spawn_count = 1 if room.type == 'boss' else 2 + random.randint(0, 2)
                for _ in range(spawn_count):
                    spawn_points.append(
                        self._create_spawn_point(room, level, room.type == 'boss')
                    )
        
        # Generate walls around rooms
        for room in rooms:
            walls.extend(self._generate_room_walls(room))
        
        return {
            'rooms': [asdict(r) for r in rooms],
            'corridors': [asdict(c) for c in corridors],
            'traps': [asdict(t) for t in traps],
            'spawnPoints': [asdict(sp) for sp in spawn_points],
            'walls': [asdict(w) for w in walls],
            'level': level,
            'metadata': {
                'num_rooms': len(rooms),
                'num_traps': len(traps),
                'num_spawn_points': len(spawn_points)
            }
        }
    
    def _determine_room_type(self, index: int, total_rooms: int) -> str:
        """Determine the type of room to generate"""
        if index == total_rooms - 1:
            return 'boss'  # Last room is boss room
        elif random.random() < 0.2:
            return 'treasure'
        return 'normal'
    
    def _create_trap(self, room: Room, level: int) -> Trap:
        """Create a trap within a room"""
        trap_types = ['spike', 'fire', 'arrow', 'poison']
        trap_type = random.choice(trap_types)
        
        offset_x = (random.random() - 0.5) * room.width * 0.8
        offset_z = (random.random() - 0.5) * room.height * 0.8
        
        self.trap_id_counter += 1
        return Trap(
            id=f'trap_{self.trap_id_counter}',
            position=Position(
                x=room.x + offset_x,
                y=0,
                z=room.z + offset_z
            ),
            type=trap_type,
            damage=10 + level * 5,
            triggered=False
        )
    
    def _create_spawn_point(self, room: Room, level: int, is_boss: bool) -> SpawnPoint:
        """Create an enemy spawn point"""
        enemy_types = ['demon'] if is_boss else ['zombie', 'skeleton', 'orc']
        enemy_type = random.choice(enemy_types)
        
        offset_x = (random.random() - 0.5) * room.width * 0.7
        offset_z = (random.random() - 0.5) * room.height * 0.7
        
        return SpawnPoint(
            position=Position(
                x=room.x + offset_x,
                y=0,
                z=room.z + offset_z
            ),
            enemy_type=enemy_type,
            cooldown=60000 if is_boss else 30000,
            last_spawn=0
        )
    
    def _generate_room_walls(self, room: Room) -> List[Wall]:
        """Generate walls around a room"""
        walls: List[Wall] = []
        wall_thickness = 1.0
        wall_height = 4.0
        
        # North wall
        walls.append(Wall(
            x=room.x,
            z=room.z - room.height / 2 - wall_thickness / 2,
            width=room.width + wall_thickness * 2,
            height=wall_height,
            depth=wall_thickness
        ))
        
        # South wall
        walls.append(Wall(
            x=room.x,
            z=room.z + room.height / 2 + wall_thickness / 2,
            width=room.width + wall_thickness * 2,
            height=wall_height,
            depth=wall_thickness
        ))
        
        # East wall
        walls.append(Wall(
            x=room.x + room.width / 2 + wall_thickness / 2,
            z=room.z,
            width=wall_thickness,
            height=wall_height,
            depth=room.height
        ))
        
        # West wall
        walls.append(Wall(
            x=room.x - room.width / 2 - wall_thickness / 2,
            z=room.z,
            width=wall_thickness,
            height=wall_height,
            depth=room.height
        ))
        
        return walls


def visualize_dungeon(dungeon: Dict[str, Any], output_file: str = None):
    """
    Create an ASCII visualization of the dungeon layout
    
    Args:
        dungeon: Dungeon data dictionary
        output_file: Optional file to save visualization to
    """
    rooms = dungeon['rooms']
    corridors = dungeon['corridors']
    traps = dungeon['traps']
    spawn_points = dungeon['spawnPoints']
    
    # Calculate bounds
    min_x = min_z = float('inf')
    max_x = max_z = float('-inf')
    
    for room in rooms:
        min_x = min(min_x, room['x'] - room['width'] / 2)
        max_x = max(max_x, room['x'] + room['width'] / 2)
        min_z = min(min_z, room['z'] - room['height'] / 2)
        max_z = max(max_z, room['z'] + room['height'] / 2)
    
    # Create grid
    scale = 0.5
    width = int((max_x - min_x) * scale) + 4
    height = int((max_z - min_z) * scale) + 4
    grid = [[' ' for _ in range(width)] for _ in range(height)]
    
    # Draw rooms
    for room in rooms:
        rx = int((room['x'] - min_x) * scale) + 2
        rz = int((room['z'] - min_z) * scale) + 2
        rw = max(1, int(room['width'] * scale))
        rh = max(1, int(room['height'] * scale))
        
        char = 'S' if room['type'] == 'spawn' else \
               'B' if room['type'] == 'boss' else \
               'T' if room['type'] == 'treasure' else '#'
        
        for z in range(max(0, rz - rh // 2), min(height, rz + rh // 2)):
            for x in range(max(0, rx - rw // 2), min(width, rx + rw // 2)):
                if grid[z][x] == ' ':
                    grid[z][x] = char
    
    # Draw corridors
    for corridor in corridors:
        sx = int((corridor['start']['x'] - min_x) * scale) + 2
        sz = int((corridor['start']['z'] - min_z) * scale) + 2
        ex = int((corridor['end']['x'] - min_x) * scale) + 2
        ez = int((corridor['end']['z'] - min_z) * scale) + 2
        
        # Simple line drawing
        dx = ex - sx
        dz = ez - sz
        steps = max(abs(dx), abs(dz))
        if steps > 0:
            for i in range(steps + 1):
                x = int(sx + (dx * i) / steps)
                z = int(sz + (dz * i) / steps)
                if 0 <= x < width and 0 <= z < height and grid[z][x] == ' ':
                    grid[z][x] = '.'
    
    # Draw traps
    for trap in traps:
        tx = int((trap['position']['x'] - min_x) * scale) + 2
        tz = int((trap['position']['z'] - min_z) * scale) + 2
        if 0 <= tx < width and 0 <= tz < height:
            grid[tz][tx] = 'X'
    
    # Draw spawn points
    for sp in spawn_points:
        sx = int((sp['position']['x'] - min_x) * scale) + 2
        sz = int((sp['position']['z'] - min_z) * scale) + 2
        if 0 <= sx < width and 0 <= sz < height and grid[sz][sx] in [' ', '.', '#']:
            grid[sz][sx] = 'E'
    
    # Create output
    output = [
        f"\n{'=' * width}",
        f"Dungeon Level {dungeon['level']} - Layout Visualization",
        f"{'=' * width}",
        "",
        "Legend:",
        "  S = Spawn Room (player start)",
        "  B = Boss Room",
        "  T = Treasure Room",
        "  # = Normal Room",
        "  . = Corridor",
        "  X = Trap",
        "  E = Enemy Spawn Point",
        "",
        f"Stats: {dungeon['metadata']['num_rooms']} rooms, "
        f"{dungeon['metadata']['num_traps']} traps, "
        f"{dungeon['metadata']['num_spawn_points']} spawn points",
        f"{'=' * width}",
        ""
    ]
    
    for row in grid:
        output.append(''.join(row))
    
    output.append(f"\n{'=' * width}\n")
    
    result = '\n'.join(output)
    
    if output_file:
        with open(output_file, 'w') as f:
            f.write(result)
        print(f"Visualization saved to {output_file}")
    else:
        print(result)
    
    return result


def export_dungeon(dungeon: Dict[str, Any], filename: str):
    """Export dungeon data to JSON file"""
    with open(filename, 'w') as f:
        json.dump(dungeon, f, indent=2)
    print(f"Dungeon exported to {filename}")


def print_stats(dungeon: Dict[str, Any]):
    """Print detailed dungeon statistics"""
    print(f"\n{'=' * 60}")
    print(f"Dungeon Level {dungeon['level']} - Statistics")
    print(f"{'=' * 60}")
    print(f"\nRooms:")
    print(f"  Total: {dungeon['metadata']['num_rooms']}")
    
    room_types = {}
    for room in dungeon['rooms']:
        rt = room['type']
        room_types[rt] = room_types.get(rt, 0) + 1
    
    for room_type, count in sorted(room_types.items()):
        print(f"  {room_type.capitalize()}: {count}")
    
    print(f"\nTraps: {dungeon['metadata']['num_traps']}")
    trap_types = {}
    for trap in dungeon['traps']:
        tt = trap['type']
        trap_types[tt] = trap_types.get(tt, 0) + 1
    
    for trap_type, count in sorted(trap_types.items()):
        print(f"  {trap_type.capitalize()}: {count}")
    
    print(f"\nEnemy Spawn Points: {dungeon['metadata']['num_spawn_points']}")
    enemy_types = {}
    for sp in dungeon['spawnPoints']:
        et = sp['enemy_type']
        enemy_types[et] = enemy_types.get(et, 0) + 1
    
    for enemy_type, count in sorted(enemy_types.items()):
        print(f"  {enemy_type.capitalize()}: {count}")
    
    print(f"\nCorridors: {len(dungeon['corridors'])}")
    print(f"Walls: {len(dungeon['walls'])}")
    print(f"\n{'=' * 60}\n")


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description='LooterShooter Dungeon Generator',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  Generate and visualize a level 5 dungeon:
    python looter-shooter-dungeon.py --level 5 --visualize
  
  Generate and export a level 10 dungeon to JSON:
    python looter-shooter-dungeon.py --level 10 --export dungeon.json
  
  Generate multiple dungeons with statistics:
    python looter-shooter-dungeon.py --level 3 --count 5 --stats
        """
    )
    
    parser.add_argument(
        '--level', '-l',
        type=int,
        default=1,
        help='Dungeon level (difficulty, default: 1)'
    )
    
    parser.add_argument(
        '--visualize', '-v',
        action='store_true',
        help='Display ASCII visualization of the dungeon'
    )
    
    parser.add_argument(
        '--export', '-e',
        type=str,
        metavar='FILE',
        help='Export dungeon data to JSON file'
    )
    
    parser.add_argument(
        '--stats', '-s',
        action='store_true',
        help='Print detailed dungeon statistics'
    )
    
    parser.add_argument(
        '--count', '-c',
        type=int,
        default=1,
        help='Number of dungeons to generate (default: 1)'
    )
    
    parser.add_argument(
        '--seed',
        type=int,
        help='Random seed for reproducible generation'
    )
    
    args = parser.parse_args()
    
    if args.seed is not None:
        random.seed(args.seed)
    
    engine = DungeonEngine()
    
    for i in range(args.count):
        if args.count > 1:
            print(f"\n{'#' * 60}")
            print(f"Generating dungeon {i + 1} of {args.count}")
            print(f"{'#' * 60}")
        
        dungeon = engine.generate_dungeon(args.level)
        
        if args.stats or args.count > 1:
            print_stats(dungeon)
        
        if args.visualize:
            visualize_dungeon(dungeon)
        
        if args.export:
            filename = args.export
            if args.count > 1:
                # Add number to filename for multiple exports
                base, ext = filename.rsplit('.', 1) if '.' in filename else (filename, 'json')
                filename = f"{base}_{i + 1}.{ext}"
            export_dungeon(dungeon, filename)


if __name__ == '__main__':
    main()
