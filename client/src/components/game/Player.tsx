import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { usePlayer } from "../../lib/stores/usePlayer";
import { useEnemies } from "../../lib/stores/useEnemies";
import { useLoot } from "../../lib/stores/useLoot";
import { useAudio } from "../../lib/stores/useAudio";
import { checkCollision, getRandomColor } from "../../lib/gameUtils";

export default function Player() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const [, getKeys] = useKeyboardControls();
  
  const { 
    position, 
    health, 
    mana, 
    level,
    experience,
    movePlayer, 
    takeDamage, 
    gainExperience,
    attack,
    castAbility,
    collectItem
  } = usePlayer();
  
  const { enemies, damageEnemy } = useEnemies();
  const { items, removeItem } = useLoot();
  const { playHit } = useAudio();

  // Update camera to follow player (isometric view)
  useFrame(() => {
    if (meshRef.current) {
      const playerPos = meshRef.current.position;
      
      // Isometric camera follow
      camera.position.set(
        playerPos.x + 10,
        playerPos.y + 15,
        playerPos.z + 10
      );
      camera.lookAt(playerPos);
      
      // Handle movement
      const keys = getKeys();
      let direction = new THREE.Vector3();
      
      if (keys.forward) direction.z -= 1;
      if (keys.backward) direction.z += 1;
      if (keys.leftward) direction.x -= 1;
      if (keys.rightward) direction.x += 1;
      
      if (direction.length() > 0) {
        direction.normalize();
        movePlayer(direction);
        console.log("Player moving:", direction, "Position:", position);
      }
      
      // Handle attacks
      if (keys.attack) {
        attack();
        console.log("Player attacking");
      }
      
      if (keys.ability1) {
        castAbility(1);
        console.log("Casting ability 1");
      }
      
      if (keys.ability2) {
        castAbility(2);
        console.log("Casting ability 2");
      }
      
      if (keys.ability3) {
        castAbility(3);
        console.log("Casting ability 3");
      }
      
      // Update mesh position
      meshRef.current.position.set(position.x, position.y, position.z);
      
      // Check for collisions with enemies
      enemies.forEach(enemy => {
        if (checkCollision(position, enemy.position, 1.5)) {
          takeDamage(10);
          playHit();
          console.log("Player hit by enemy, health:", health);
        }
      });
      
      // Check for loot collection
      items.forEach(item => {
        if (checkCollision(position, item.position, 1)) {
          collectItem(item);
          removeItem(item.id);
          console.log("Item collected:", item.name);
        }
      });
    }
  });

  return (
    <mesh ref={meshRef} castShadow receiveShadow position={[position.x, position.y, position.z]}>
      <boxGeometry args={[1, 2, 1]} />
      <meshStandardMaterial 
        color="#4a90e2" 
        roughness={0.3}
        metalness={0.1}
      />
      {/* Player glow effect */}
      <pointLight 
        position={[0, 1, 0]} 
        intensity={0.5} 
        color="#4a90e2" 
        distance={5} 
      />
    </mesh>
  );
}
