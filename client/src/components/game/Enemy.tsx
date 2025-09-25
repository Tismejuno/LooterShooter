import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { Enemy as EnemyType } from "../../lib/gameTypes";
import { usePlayer } from "../../lib/stores/usePlayer";
import { useEnemies } from "../../lib/stores/useEnemies";

interface EnemyProps {
  enemy: EnemyType;
}

export default function Enemy({ enemy }: EnemyProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { position: playerPosition } = usePlayer();
  const { moveEnemy } = useEnemies();
  
  // Random enemy color based on type
  const color = useMemo(() => {
    switch (enemy.type) {
      case 'zombie': return '#8B4513';
      case 'skeleton': return '#F5F5DC';
      case 'orc': return '#228B22';
      case 'demon': return '#B22222';
      default: return '#696969';
    }
  }, [enemy.type]);

  useFrame((state) => {
    if (meshRef.current && enemy.health > 0) {
      // Simple AI - move towards player
      const direction = new THREE.Vector3()
        .subVectors(
          new THREE.Vector3(playerPosition.x, playerPosition.y, playerPosition.z),
          new THREE.Vector3(enemy.position.x, enemy.position.y, enemy.position.z)
        )
        .normalize();
      
      // Move enemy towards player
      const speed = enemy.speed * 0.016; // 60fps normalization
      const newPos = {
        x: enemy.position.x + direction.x * speed,
        y: enemy.position.y,
        z: enemy.position.z + direction.z * speed
      };
      
      moveEnemy(enemy.id, newPos);
      
      // Update mesh position
      meshRef.current.position.set(newPos.x, newPos.y, newPos.z);
      
      // Add some bob animation
      meshRef.current.position.y = newPos.y + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  if (enemy.health <= 0) return null;

  return (
    <group>
      <mesh 
        ref={meshRef} 
        castShadow 
        receiveShadow 
        position={[enemy.position.x, enemy.position.y, enemy.position.z]}
      >
        <boxGeometry args={[0.8, 1.5, 0.8]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Health bar */}
      <mesh position={[enemy.position.x, enemy.position.y + 2, enemy.position.z]}>
        <planeGeometry args={[1, 0.1]} />
        <meshBasicMaterial 
          color="#ff0000" 
          transparent 
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Health fill */}
      <mesh position={[
        enemy.position.x - (1 - enemy.health / enemy.maxHealth) * 0.5, 
        enemy.position.y + 2, 
        enemy.position.z
      ]}>
        <planeGeometry args={[enemy.health / enemy.maxHealth, 0.08]} />
        <meshBasicMaterial 
          color="#00ff00" 
          transparent 
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
