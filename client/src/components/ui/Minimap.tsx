import { usePlayer } from "../../lib/stores/usePlayer";
import { useEnemies } from "../../lib/stores/useEnemies";
import { useLoot } from "../../lib/stores/useLoot";
import { useDungeon } from "../../lib/stores/useDungeon";

export default function Minimap() {
  const { position: playerPos } = usePlayer();
  const { enemies } = useEnemies();
  const { items } = useLoot();
  const { rooms } = useDungeon();

  const mapSize = 150;
  const scale = 3; // Scale factor for world to minimap coordinates

  const worldToMinimap = (worldX: number, worldZ: number) => ({
    x: mapSize / 2 + worldX / scale,
    y: mapSize / 2 + worldZ / scale
  });

  return (
    <div style={{
      width: `${mapSize}px`,
      height: `${mapSize}px`,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      border: '2px solid #666',
      borderRadius: '8px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Title */}
      <div style={{
        position: 'absolute',
        top: '5px',
        left: '5px',
        fontSize: '12px',
        color: '#fff',
        fontWeight: 'bold'
      }}>
        Minimap
      </div>

      {/* Dungeon rooms */}
      {rooms.map((room, index) => {
        const pos = worldToMinimap(room.x, room.z);
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${pos.x - room.width / (scale * 2)}px`,
              top: `${pos.y - room.height / (scale * 2)}px`,
              width: `${room.width / scale}px`,
              height: `${room.height / scale}px`,
              backgroundColor: 'rgba(100, 50, 0, 0.5)',
              border: '1px solid #654321'
            }}
          />
        );
      })}

      {/* Player dot */}
      {(() => {
        const pos = worldToMinimap(playerPos.x, playerPos.z);
        return (
          <div style={{
            position: 'absolute',
            left: `${pos.x - 3}px`,
            top: `${pos.y - 3}px`,
            width: '6px',
            height: '6px',
            backgroundColor: '#4a90e2',
            borderRadius: '50%',
            border: '1px solid #fff',
            zIndex: 10
          }} />
        );
      })()}

      {/* Enemies */}
      {enemies.filter(e => e.health > 0).map((enemy) => {
        const pos = worldToMinimap(enemy.position.x, enemy.position.z);
        if (pos.x < 0 || pos.x > mapSize || pos.y < 0 || pos.y > mapSize) return null;
        
        return (
          <div
            key={enemy.id}
            style={{
              position: 'absolute',
              left: `${pos.x - 2}px`,
              top: `${pos.y - 2}px`,
              width: '4px',
              height: '4px',
              backgroundColor: '#ff4444',
              borderRadius: '50%'
            }}
          />
        );
      })}

      {/* Loot items */}
      {items.map((item) => {
        const pos = worldToMinimap(item.position.x, item.position.z);
        if (pos.x < 0 || pos.x > mapSize || pos.y < 0 || pos.y > mapSize) return null;
        
        const color = item.rarity === 'legendary' ? '#ff8000' : 
                     item.rarity === 'epic' ? '#a335ee' :
                     item.rarity === 'rare' ? '#0070dd' : '#44ff44';
        
        return (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              left: `${pos.x - 1}px`,
              top: `${pos.y - 1}px`,
              width: '2px',
              height: '2px',
              backgroundColor: color,
              borderRadius: '50%'
            }}
          />
        );
      })}

      {/* Compass */}
      <div style={{
        position: 'absolute',
        bottom: '5px',
        right: '5px',
        fontSize: '10px',
        color: '#aaa'
      }}>
        N
      </div>
    </div>
  );
}
