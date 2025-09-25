import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { LootItem } from "../../lib/gameTypes";

interface LootProps {
  item: LootItem;
}

export default function Loot({ item }: LootProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Get color based on rarity
  const getColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#ffffff';
      case 'uncommon': return '#1eff00';
      case 'rare': return '#0070dd';
      case 'epic': return '#a335ee';
      case 'legendary': return '#ff8000';
      default: return '#ffffff';
    }
  };

  useFrame((state) => {
    if (meshRef.current) {
      // Floating animation
      meshRef.current.position.y = item.position.y + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      
      // Rotation animation
      meshRef.current.rotation.y = state.clock.elapsedTime;
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        position={[item.position.x, item.position.y, item.position.z]}
        castShadow
      >
        {item.type === 'weapon' ? (
          <boxGeometry args={[0.2, 1, 0.2]} />
        ) : item.type === 'armor' ? (
          <boxGeometry args={[0.8, 0.6, 0.3]} />
        ) : (
          <sphereGeometry args={[0.3]} />
        )}
        <meshStandardMaterial 
          color={getColor(item.rarity)} 
          emissive={getColor(item.rarity)}
          emissiveIntensity={0.2}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
      
      {/* Glow effect */}
      <pointLight 
        position={[item.position.x, item.position.y + 1, item.position.z]}
        color={getColor(item.rarity)}
        intensity={0.5}
        distance={3}
      />
    </group>
  );
}
