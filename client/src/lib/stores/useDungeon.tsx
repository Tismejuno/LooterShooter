import { create } from "zustand";
import { Position } from "../gameTypes";

interface Room {
  x: number;
  z: number;
  width: number;
  height: number;
}

interface Wall {
  x: number;
  z: number;
  width: number;
  height: number;
  depth: number;
}

interface DungeonState {
  currentLevel: number;
  rooms: Room[];
  walls: Wall[];
  
  // Actions
  generateLevel: (level: number) => void;
  nextLevel: () => void;
}

export const useDungeon = create<DungeonState>((set, get) => ({
  currentLevel: 1,
  rooms: [],
  walls: [],

  generateLevel: (level) => {
    const rooms: Room[] = [];
    const walls: Wall[] = [];
    
    // Generate main chamber
    const mainRoom = {
      x: 0,
      z: 0,
      width: 15,
      height: 15
    };
    rooms.push(mainRoom);
    
    // Generate additional rooms based on level
    const numRooms = Math.min(2 + Math.floor(level / 2), 6);
    
    for (let i = 1; i < numRooms; i++) {
      const angle = (i / numRooms) * Math.PI * 2;
      const distance = 20 + Math.random() * 10;
      
      const room = {
        x: Math.cos(angle) * distance,
        z: Math.sin(angle) * distance,
        width: 8 + Math.random() * 6,
        height: 8 + Math.random() * 6
      };
      rooms.push(room);
    }
    
    // Generate walls around rooms
    rooms.forEach((room, index) => {
      // Create walls around each room
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
    });
    
    // Add some decorative walls
    for (let i = 0; i < 5 + level; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 25 + Math.random() * 15;
      
      walls.push({
        x: Math.cos(angle) * distance,
        z: Math.sin(angle) * distance,
        width: 2 + Math.random() * 3,
        height: 3 + Math.random() * 2,
        depth: 1
      });
    }
    
    set({
      currentLevel: level,
      rooms,
      walls
    });
    
    console.log(`Generated dungeon level ${level} with ${rooms.length} rooms and ${walls.length} walls`);
  },

  nextLevel: () => {
    const { currentLevel, generateLevel } = get();
    const newLevel = currentLevel + 1;
    generateLevel(newLevel);
  }
}));
