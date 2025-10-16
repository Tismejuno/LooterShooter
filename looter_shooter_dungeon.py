#!/usr/bin/env python3
"""
LooterShooter Dungeon Generator

A Python implementation of the dungeon generation system for the LooterShooter game.
This script can be used for:
- Testing dungeon generation algorithms
- Visualizing dungeon layouts (ASCII and 3D)
- Generating dungeon configurations for import into the game
- Balancing dungeon difficulty and layout

Usage:
    python looter_shooter_dungeon.py --level 5 --visualize
    python looter_shooter_dungeon.py --level 5 --render3d
    python looter_shooter_dungeon.py --level 10 --export dungeon.json
    python looter_shooter_dungeon.py --level 7 --render3d-output dungeon_render.png
"""

import json
import math
import random
import argparse
from typing import List, Dict, Tuple, Any
from dataclasses import dataclass, asdict
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from mpl_toolkits.mplot3d.art3d import Poly3DCollection
import numpy as np


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


def render_3d_dungeon(dungeon: Dict[str, Any], output_file: str = None, show: bool = True):
    """
    Create a 3D visualization of the dungeon layout using matplotlib
    
    Args:
        dungeon: Dungeon data dictionary
        output_file: Optional file to save the 3D render to
        show: Whether to display the interactive 3D plot (default: True)
    """
    rooms = dungeon['rooms']
    walls = dungeon['walls']
    corridors = dungeon['corridors']
    traps = dungeon['traps']
    spawn_points = dungeon['spawnPoints']
    
    # Create 3D figure
    fig = plt.figure(figsize=(14, 10))
    ax = fig.add_subplot(111, projection='3d')
    
    # Set labels and title
    ax.set_xlabel('X Position', fontsize=10)
    ax.set_ylabel('Z Position', fontsize=10)
    ax.set_zlabel('Y Height', fontsize=10)
    ax.set_title(f'Dungeon Level {dungeon["level"]} - 3D Visualization', fontsize=14, fontweight='bold')
    
    # Draw floor plane
    x_min = min([r['x'] - r['width']/2 for r in rooms]) - 5
    x_max = max([r['x'] + r['width']/2 for r in rooms]) + 5
    z_min = min([r['z'] - r['height']/2 for r in rooms]) - 5
    z_max = max([r['z'] + r['height']/2 for r in rooms]) + 5
    
    xx, zz = np.meshgrid([x_min, x_max], [z_min, z_max])
    yy = np.zeros_like(xx)
    ax.plot_surface(xx, zz, yy, alpha=0.1, color='green')
    
    # Draw room floors
    for room in rooms:
        x_center = room['x']
        z_center = room['z']
        width = room['width']
        height = room['height']
        
        # Create floor vertices
        x_coords = [x_center - width/2, x_center + width/2, x_center + width/2, x_center - width/2]
        z_coords = [z_center - height/2, z_center - height/2, z_center + height/2, z_center + height/2]
        y_coords = [0.05, 0.05, 0.05, 0.05]
        
        # Draw floor
        vertices = [list(zip(x_coords, z_coords, y_coords))]
        
        # Color based on room type
        if room['type'] == 'spawn':
            color = 'lightblue'
            alpha = 0.6
        elif room['type'] == 'boss':
            color = 'red'
            alpha = 0.6
        elif room['type'] == 'treasure':
            color = 'gold'
            alpha = 0.6
        else:
            color = 'gray'
            alpha = 0.4
        
        poly = Poly3DCollection(vertices, alpha=alpha, facecolor=color, edgecolor='black', linewidths=1)
        ax.add_collection3d(poly)
        
        # Add room label
        ax.text(x_center, z_center, 0.1, room['type'][0].upper(), 
                fontsize=8, ha='center', va='center', weight='bold')
    
    # Draw walls
    for wall in walls:
        x = wall['x']
        z = wall['z']
        w = wall['width']
        h = wall['height']
        d = wall['depth']
        
        # Create box vertices for walls
        # Bottom face
        x_coords = [x - w/2, x + w/2, x + w/2, x - w/2]
        z_coords = [z - d/2, z - d/2, z + d/2, z + d/2]
        y_coords = [0, 0, 0, 0]
        vertices_bottom = [list(zip(x_coords, z_coords, y_coords))]
        
        # Top face
        y_coords = [h, h, h, h]
        vertices_top = [list(zip(x_coords, z_coords, y_coords))]
        
        # Side faces
        # Front face
        x_coords = [x - w/2, x + w/2, x + w/2, x - w/2]
        z_coords = [z - d/2, z - d/2, z - d/2, z - d/2]
        y_coords = [0, 0, h, h]
        vertices_front = [list(zip(x_coords, z_coords, y_coords))]
        
        # Back face
        z_coords = [z + d/2, z + d/2, z + d/2, z + d/2]
        vertices_back = [list(zip(x_coords, z_coords, y_coords))]
        
        # Left face
        x_coords = [x - w/2, x - w/2, x - w/2, x - w/2]
        z_coords = [z - d/2, z + d/2, z + d/2, z - d/2]
        vertices_left = [list(zip(x_coords, z_coords, y_coords))]
        
        # Right face
        x_coords = [x + w/2, x + w/2, x + w/2, x + w/2]
        vertices_right = [list(zip(x_coords, z_coords, y_coords))]
        
        # Add all faces
        for vertices in [vertices_bottom, vertices_top, vertices_front, vertices_back, vertices_left, vertices_right]:
            poly = Poly3DCollection(vertices, alpha=0.7, facecolor='brown', edgecolor='black', linewidths=0.5)
            ax.add_collection3d(poly)
    
    # Draw corridors as thin floor planes
    for corridor in corridors:
        start_x = corridor['start']['x']
        start_z = corridor['start']['z']
        end_x = corridor['end']['x']
        end_z = corridor['end']['z']
        width = corridor['width']
        
        # Calculate perpendicular direction for corridor width
        dx = end_x - start_x
        dz = end_z - start_z
        length = math.sqrt(dx**2 + dz**2)
        if length > 0:
            # Perpendicular unit vector
            perp_x = -dz / length * width / 2
            perp_z = dx / length * width / 2
            
            # Create corridor vertices
            x_coords = [
                start_x + perp_x, start_x - perp_x,
                end_x - perp_x, end_x + perp_x
            ]
            z_coords = [
                start_z + perp_z, start_z - perp_z,
                end_z - perp_z, end_z + perp_z
            ]
            y_coords = [0.03, 0.03, 0.03, 0.03]
            
            vertices = [list(zip(x_coords, z_coords, y_coords))]
            poly = Poly3DCollection(vertices, alpha=0.5, facecolor='lightgray', edgecolor='gray', linewidths=0.5)
            ax.add_collection3d(poly)
    
    # Draw traps as red markers
    trap_positions = [(t['position']['x'], t['position']['z'], 0.5) for t in traps]
    if trap_positions:
        trap_x, trap_z, trap_y = zip(*trap_positions)
        ax.scatter(trap_x, trap_z, trap_y, c='red', marker='^', s=100, label='Traps', edgecolors='darkred')
    
    # Draw spawn points as enemy markers
    spawn_positions = [(sp['position']['x'], sp['position']['z'], 0.5) for sp in spawn_points]
    if spawn_positions:
        spawn_x, spawn_z, spawn_y = zip(*spawn_positions)
        ax.scatter(spawn_x, spawn_z, spawn_y, c='purple', marker='o', s=80, label='Enemies', edgecolors='darkviolet')
    
    # Set axis limits
    ax.set_xlim([x_min, x_max])
    ax.set_ylim([z_min, z_max])
    ax.set_zlim([0, 6])
    
    # Add legend
    ax.legend(loc='upper right', fontsize=9)
    
    # Add stats text box
    stats_text = (
        f"Rooms: {dungeon['metadata']['num_rooms']}\n"
        f"Traps: {dungeon['metadata']['num_traps']}\n"
        f"Enemies: {dungeon['metadata']['num_spawn_points']}"
    )
    ax.text2D(0.02, 0.98, stats_text, transform=ax.transAxes,
             fontsize=9, verticalalignment='top',
             bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.8))
    
    # Set viewing angle for better visualization
    ax.view_init(elev=25, azim=45)
    
    # Save if output file specified
    if output_file:
        plt.savefig(output_file, dpi=150, bbox_inches='tight')
        print(f"3D visualization saved to {output_file}")
    
    # Show interactive plot
    if show:
        plt.show()
    else:
        plt.close()
    
    return fig


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
    python looter_shooter_dungeon.py --level 5 --visualize
  
  Generate and render a level 5 dungeon in 3D:
    python looter_shooter_dungeon.py --level 5 --render3d
  
  Generate and save 3D render to file:
    python looter_shooter_dungeon.py --level 5 --render3d-output dungeon.png
  
  Generate and export a level 10 dungeon to JSON:
    python looter_shooter_dungeon.py --level 10 --export dungeon.json
  
  Generate multiple dungeons with statistics:
    python looter_shooter_dungeon.py --level 3 --count 5 --stats
  
  Generate with both ASCII and 3D visualization:
    python looter_shooter_dungeon.py --level 7 --visualize --render3d
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
        '--render3d', '-r',
        action='store_true',
        help='Display 3D visualization of the dungeon'
    )
    
    parser.add_argument(
        '--render3d-output', '-ro',
        type=str,
        metavar='FILE',
        help='Save 3D render to image file (e.g., dungeon.png)'
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
        
        if args.render3d or args.render3d_output:
            output_file = None
            if args.render3d_output:
                output_file = args.render3d_output
                if args.count > 1:
                    # Add number to filename for multiple renders
                    base, ext = output_file.rsplit('.', 1) if '.' in output_file else (output_file, 'png')
                    output_file = f"{base}_{i + 1}.{ext}"
            
            # Don't show interactive plot if we're generating multiple dungeons
            show_plot = args.render3d and args.count == 1
            render_3d_dungeon(dungeon, output_file, show=show_plot)
        
        if args.export:
            filename = args.export
            if args.count > 1:
                # Add number to filename for multiple exports
                base, ext = filename.rsplit('.', 1) if '.' in filename else (filename, 'json')
                filename = f"{base}_{i + 1}.{ext}"
            export_dungeon(dungeon, filename)


if __name__ == '__main__':
    main()
