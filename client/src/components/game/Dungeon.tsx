import { useTexture } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { useDungeon } from "../../lib/stores/useDungeon";

export default function Dungeon() {
  const grassTexture = useTexture("/textures/grass.png");
  const asphaltTexture = useTexture("/textures/asphalt.png");
  const woodTexture = useTexture("/textures/wood.jpg");
  
  const { currentLevel, rooms, walls } = useDungeon();
  
  // Configure textures
  useMemo(() => {
    [grassTexture, asphaltTexture, woodTexture].forEach(texture => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(4, 4);
    });
  }, [grassTexture, asphaltTexture, woodTexture]);

  return (
    <group>
      {/* Floor */}
      <mesh receiveShadow position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial 
          map={grassTexture} 
          roughness={0.8}
        />
      </mesh>
      
      {/* Dungeon rooms */}
      {rooms.map((room, index) => (
        <mesh 
          key={index}
          receiveShadow 
          position={[room.x, -0.4, room.z]} 
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[room.width, room.height]} />
          <meshStandardMaterial 
            map={asphaltTexture} 
            roughness={0.6}
          />
        </mesh>
      ))}
      
      {/* Dungeon walls */}
      {walls.map((wall, index) => (
        <mesh 
          key={index}
          castShadow 
          receiveShadow 
          position={[wall.x, wall.height / 2, wall.z]}
        >
          <boxGeometry args={[wall.width, wall.height, wall.depth]} />
          <meshStandardMaterial 
            map={woodTexture} 
            roughness={0.7}
            color="#8B4513"
          />
        </mesh>
      ))}
      
      {/* Decorative pillars */}
      {rooms.map((room, index) => (
        <group key={`pillars-${index}`}>
          {[-1, 1].map(x => 
            [-1, 1].map(z => (
              <mesh
                key={`${x}-${z}`}
                castShadow
                position={[
                  room.x + x * (room.width / 3), 
                  1, 
                  room.z + z * (room.height / 3)
                ]}
              >
                <cylinderGeometry args={[0.3, 0.4, 2]} />
                <meshStandardMaterial 
                  color="#654321" 
                  roughness={0.9}
                />
              </mesh>
            ))
          )}
        </group>
      ))}
    </group>
  );
}
