import { Position, Trap, SpawnPoint } from "./gameTypes";

export interface Room {
  x: number;
  z: number;
  width: number;
  height: number;
  type: 'normal' | 'treasure' | 'boss' | 'spawn';
}

export interface Corridor {
  start: Position;
  end: Position;
  width: number;
}

export interface DungeonLayout {
  rooms: Room[];
  corridors: Corridor[];
  traps: Trap[];
  spawnPoints: SpawnPoint[];
  walls: Wall[];
}

export interface Wall {
  x: number;
  z: number;
  width: number;
  height: number;
  depth: number;
}

let trapIdCounter = 0;
let spawnPointIdCounter = 0;

export class DungeonEngine {
  static generateDungeon(level: number): DungeonLayout {
    const rooms: Room[] = [];
    const corridors: Corridor[] = [];
    const traps: Trap[] = [];
    const spawnPoints: SpawnPoint[] = [];
    const walls: Wall[] = [];
    
    // Generate main spawn room
    const spawnRoom: Room = {
      x: 0,
      z: 0,
      width: 15,
      height: 15,
      type: 'spawn'
    };
    rooms.push(spawnRoom);
    
    // Generate additional rooms based on level
    const numRooms = Math.min(3 + Math.floor(level / 2), 8);
    const roomDistance = 25;
    
    for (let i = 1; i < numRooms; i++) {
      const angle = (i / numRooms) * Math.PI * 2;
      const distance = roomDistance + Math.random() * 10;
      
      const roomType = this.determineRoomType(i, numRooms);
      
      const room: Room = {
        x: Math.cos(angle) * distance,
        z: Math.sin(angle) * distance,
        width: 10 + Math.random() * 8,
        height: 10 + Math.random() * 8,
        type: roomType
      };
      rooms.push(room);
      
      // Create corridor from previous room
      if (i > 0) {
        const prevRoom = rooms[i - 1];
        corridors.push({
          start: { x: prevRoom.x, y: 0, z: prevRoom.z },
          end: { x: room.x, y: 0, z: room.z },
          width: 3
        });
      }
    }
    
    // Connect last room back to spawn
    if (rooms.length > 1) {
      const lastRoom = rooms[rooms.length - 1];
      corridors.push({
        start: { x: lastRoom.x, y: 0, z: lastRoom.z },
        end: { x: spawnRoom.x, y: 0, z: spawnRoom.z },
        width: 3
      });
    }
    
    // Generate traps based on level
    const numTraps = Math.floor(level * 1.5);
    for (let i = 0; i < numTraps; i++) {
      const room = rooms[Math.floor(Math.random() * rooms.length)];
      traps.push(this.createTrap(room, level));
    }
    
    // Generate enemy spawn points
    rooms.forEach((room, index) => {
      if (room.type !== 'spawn') {
        const spawnCount = room.type === 'boss' ? 1 : 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < spawnCount; i++) {
          spawnPoints.push(this.createSpawnPoint(room, level, room.type === 'boss'));
        }
      }
    });
    
    // Generate walls around rooms
    rooms.forEach(room => {
      walls.push(...this.generateRoomWalls(room));
    });
    
    return {
      rooms,
      corridors,
      traps,
      spawnPoints,
      walls
    };
  }
  
  private static determineRoomType(index: number, totalRooms: number): Room['type'] {
    if (index === totalRooms - 1) {
      return 'boss'; // Last room is boss room
    } else if (Math.random() < 0.2) {
      return 'treasure';
    }
    return 'normal';
  }
  
  private static createTrap(room: Room, level: number): Trap {
    const trapTypes: Trap['type'][] = ['spike', 'fire', 'arrow', 'poison'];
    const type = trapTypes[Math.floor(Math.random() * trapTypes.length)];
    
    const offsetX = (Math.random() - 0.5) * room.width * 0.8;
    const offsetZ = (Math.random() - 0.5) * room.height * 0.8;
    
    return {
      id: `trap_${++trapIdCounter}`,
      position: {
        x: room.x + offsetX,
        y: 0,
        z: room.z + offsetZ
      },
      type,
      damage: 10 + level * 5,
      triggered: false
    };
  }
  
  private static createSpawnPoint(room: Room, level: number, isBoss: boolean): SpawnPoint {
    const enemyTypes = isBoss ? ['demon'] : ['zombie', 'skeleton', 'orc'];
    const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    
    const offsetX = (Math.random() - 0.5) * room.width * 0.7;
    const offsetZ = (Math.random() - 0.5) * room.height * 0.7;
    
    return {
      position: {
        x: room.x + offsetX,
        y: 0,
        z: room.z + offsetZ
      },
      enemyType,
      cooldown: isBoss ? 60000 : 30000, // Boss spawns every 60s, normal every 30s
      lastSpawn: 0
    };
  }
  
  private static generateRoomWalls(room: Room): Wall[] {
    const walls: Wall[] = [];
    const wallThickness = 1;
    const wallHeight = 4;
    
    // North wall
    walls.push({
      x: room.x,
      z: room.z - room.height / 2 - wallThickness / 2,
      width: room.width + wallThickness * 2,
      height: wallHeight,
      depth: wallThickness
    });
    
    // South wall
    walls.push({
      x: room.x,
      z: room.z + room.height / 2 + wallThickness / 2,
      width: room.width + wallThickness * 2,
      height: wallHeight,
      depth: wallThickness
    });
    
    // East wall
    walls.push({
      x: room.x + room.width / 2 + wallThickness / 2,
      z: room.z,
      width: wallThickness,
      height: wallHeight,
      depth: room.height
    });
    
    // West wall
    walls.push({
      x: room.x - room.width / 2 - wallThickness / 2,
      z: room.z,
      width: wallThickness,
      height: wallHeight,
      depth: room.height
    });
    
    return walls;
  }
}
