import { useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { Projectile as ProjectileType } from "../../lib/gameTypes";
import { usePlayer } from "../../lib/stores/usePlayer";
import { useEnemies } from "../../lib/stores/useEnemies";
import { checkCollision } from "../../lib/gameUtils";

interface ProjectileProps {
  projectile: ProjectileType;
}

export default function Projectile({ projectile }: ProjectileProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { removeProjectile } = usePlayer();
  const { damageEnemy, enemies } = useEnemies();

  useFrame(() => {
    if (meshRef.current && projectile.active) {
      // Move projectile
      const newPos = {
        x: projectile.position.x + projectile.direction.x * projectile.speed * 0.016,
        y: projectile.position.y + projectile.direction.y * projectile.speed * 0.016,
        z: projectile.position.z + projectile.direction.z * projectile.speed * 0.016
      };
      
      projectile.position = newPos;
      meshRef.current.position.set(newPos.x, newPos.y, newPos.z);
      
      // Check collision with enemies
      enemies.forEach(enemy => {
        if (checkCollision(newPos, enemy.position, 1)) {
          damageEnemy(enemy.id, projectile.damage);
          removeProjectile(projectile.id);
          console.log("Projectile hit enemy for", projectile.damage, "damage");
        }
      });
      
      // Remove projectile if it travels too far
      const distance = Math.sqrt(newPos.x ** 2 + newPos.z ** 2);
      if (distance > 30) {
        removeProjectile(projectile.id);
      }
    }
  });

  if (!projectile.active) return null;

  return (
    <mesh
      ref={meshRef}
      position={[projectile.position.x, projectile.position.y, projectile.position.z]}
    >
      <sphereGeometry args={[0.1]} />
      <meshStandardMaterial 
        color="#ffff00" 
        emissive="#ffaa00"
        emissiveIntensity={0.5}
      />
      <pointLight 
        position={[0, 0, 0]}
        color="#ffaa00"
        intensity={1}
        distance={2}
      />
    </mesh>
  );
}
