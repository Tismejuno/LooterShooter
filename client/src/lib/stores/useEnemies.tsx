import { create } from "zustand";
import { Enemy, Position } from "../gameTypes";
import { getRandomInRange, generateRandomName } from "../gameUtils";

interface EnemiesState {
  enemies: Enemy[];
  
  // Actions
  spawnEnemy: (position: Position, type?: string) => void;
  moveEnemy: (enemyId: string, position: Position) => void;
  damageEnemy: (enemyId: string, damage: number) => void;
  removeEnemy: (enemyId: string) => void;
  spawnWave: (playerLevel: number) => void;
}

let enemyIdCounter = 0;

const enemyTypes = {
  zombie: {
    health: 80,
    damage: 15,
    speed: 1,
    experience: 25
  },
  skeleton: {
    health: 60,
    damage: 20,
    speed: 1.5,
    experience: 30
  },
  orc: {
    health: 120,
    damage: 25,
    speed: 0.8,
    experience: 40
  },
  demon: {
    health: 200,
    damage: 35,
    speed: 2,
    experience: 75
  }
};

export const useEnemies = create<EnemiesState>((set, get) => ({
  enemies: [],

  spawnEnemy: (position, type = 'zombie') => {
    const enemyType = enemyTypes[type as keyof typeof enemyTypes] || enemyTypes.zombie;
    const enemyId = `enemy_${++enemyIdCounter}`;
    
    const enemy: Enemy = {
      id: enemyId,
      type,
      position,
      health: enemyType.health,
      maxHealth: enemyType.health,
      damage: enemyType.damage,
      speed: enemyType.speed,
      experience: enemyType.experience,
      lastAttackTime: 0
    };
    
    set((state) => ({
      enemies: [...state.enemies, enemy]
    }));
    
    console.log(`Spawned ${type} at`, position);
  },

  moveEnemy: (enemyId, position) => {
    set((state) => ({
      enemies: state.enemies.map(enemy =>
        enemy.id === enemyId ? { ...enemy, position } : enemy
      )
    }));
  },

  damageEnemy: (enemyId, damage) => {
    set((state) => {
      const enemies = state.enemies.map(enemy => {
        if (enemy.id === enemyId) {
          const newHealth = Math.max(0, enemy.health - damage);
          return { ...enemy, health: newHealth };
        }
        return enemy;
      });
      
      // Remove dead enemies and grant experience
      const deadEnemies = enemies.filter(e => e.health <= 0);
      deadEnemies.forEach(enemy => {
        // Grant experience to player (this would ideally be handled in a different way)
        console.log(`Enemy ${enemy.id} defeated! Gained ${enemy.experience} XP`);
      });
      
      return {
        enemies: enemies.filter(e => e.health > 0)
      };
    });
  },

  removeEnemy: (enemyId) => {
    set((state) => ({
      enemies: state.enemies.filter(enemy => enemy.id !== enemyId)
    }));
  },

  spawnWave: (playerLevel) => {
    const { spawnEnemy } = get();
    const enemyCount = Math.min(3 + Math.floor(playerLevel / 2), 8);
    
    // Clear existing enemies
    set({ enemies: [] });
    
    for (let i = 0; i < enemyCount; i++) {
      // Random spawn position around player
      const angle = (i / enemyCount) * Math.PI * 2;
      const distance = getRandomInRange(8, 15);
      const position = {
        x: Math.cos(angle) * distance,
        y: 0.5,
        z: Math.sin(angle) * distance
      };
      
      // Choose enemy type based on player level
      let enemyType = 'zombie';
      if (playerLevel >= 5) {
        const types = ['zombie', 'skeleton'];
        enemyType = types[Math.floor(Math.random() * types.length)];
      }
      if (playerLevel >= 10) {
        const types = ['zombie', 'skeleton', 'orc'];
        enemyType = types[Math.floor(Math.random() * types.length)];
      }
      if (playerLevel >= 15) {
        const types = ['zombie', 'skeleton', 'orc', 'demon'];
        enemyType = types[Math.floor(Math.random() * types.length)];
      }
      
      spawnEnemy(position, enemyType);
    }
    
    console.log(`Spawned wave of ${enemyCount} enemies for level ${playerLevel} player`);
  }
}));
