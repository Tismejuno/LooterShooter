import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { Projectile as ProjectileType } from "../../lib/gameTypes";
import { usePlayer } from "../../lib/stores/usePlayer";
import { useEnemies } from "../../lib/stores/useEnemies";
import { checkCollision } from "../../lib/gameUtils";

interface ProjectileProps {
  projectile: ProjectileType;
}

const ELEMENT_CONFIG = {
  fire: {
    color: '#ff4400',
    emissive: '#ff2200',
    lightColor: '#ff6600',
    trailColor: '#ff8800',
    size: 0.14,
  },
  ice: {
    color: '#88ccff',
    emissive: '#4499ff',
    lightColor: '#aaddff',
    trailColor: '#66bbff',
    size: 0.13,
  },
  lightning: {
    color: '#ffff00',
    emissive: '#ffcc00',
    lightColor: '#ffff44',
    trailColor: '#ffee00',
    size: 0.1,
  },
  arcane: {
    color: '#cc44ff',
    emissive: '#aa22ff',
    lightColor: '#dd66ff',
    trailColor: '#bb44ff',
    size: 0.12,
  },
  default: {
    color: '#44ff88',
    emissive: '#22ff66',
    lightColor: '#66ffaa',
    trailColor: '#44ffaa',
    size: 0.11,
  },
};

export default function Projectile({ projectile }: ProjectileProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const { removeProjectile } = usePlayer();
  const { damageEnemy, enemies } = useEnemies();

  const element = projectile.element || 'default';
  const config = ELEMENT_CONFIG[element as keyof typeof ELEMENT_CONFIG] || ELEMENT_CONFIG.default;

  useFrame((state) => {
    if (meshRef.current && projectile.active) {
      const t = state.clock.elapsedTime;

      // Move projectile
      const newPos = {
        x: projectile.position.x + projectile.direction.x * projectile.speed * 0.016,
        y: projectile.position.y + projectile.direction.y * projectile.speed * 0.016,
        z: projectile.position.z + projectile.direction.z * projectile.speed * 0.016
      };

      projectile.position = newPos;
      meshRef.current.position.set(newPos.x, newPos.y, newPos.z);

      // Animate projectile
      if (element === 'lightning') {
        // Lightning flicker
        const flicker = 0.8 + Math.random() * 0.4;
        meshRef.current.scale.setScalar(flicker);
        if (outerRef.current) outerRef.current.scale.setScalar(flicker * 1.5);
      } else if (element === 'fire') {
        // Fire pulsate
        const pulse = 1 + Math.sin(t * 15) * 0.2;
        meshRef.current.scale.setScalar(pulse);
      } else {
        // Gentle spin
        meshRef.current.rotation.y += 0.1;
        if (element === 'arcane') meshRef.current.rotation.x += 0.07;
      }

      // Animate trail
      if (trailRef.current) {
        trailRef.current.position.copy(meshRef.current.position);
        // Trail follows slightly behind
        trailRef.current.position.x -= projectile.direction.x * 0.2;
        trailRef.current.position.y -= projectile.direction.y * 0.2;
        trailRef.current.position.z -= projectile.direction.z * 0.2;
        (trailRef.current.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(t * 10) * 0.1;
      }

      // Check collision with enemies
      enemies.forEach(enemy => {
        if (checkCollision(newPos, enemy.position, 1)) {
          damageEnemy(enemy.id, projectile.damage);
          removeProjectile(projectile.id);
        }
      });

      // Remove projectile if it travels too far
      const distance = Math.sqrt(
        (newPos.x - projectile.position.x) ** 2 +
        (newPos.z - projectile.position.z) ** 2
      );
      const totalDist = Math.sqrt(newPos.x ** 2 + newPos.z ** 2);
      if (totalDist > 35) {
        removeProjectile(projectile.id);
      }
    }
  });

  if (!projectile.active) return null;

  return (
    <>
      {/* Trail */}
      <mesh ref={trailRef} position={[projectile.position.x, projectile.position.y, projectile.position.z]}>
        <sphereGeometry args={[config.size * 1.4, 8, 8]} />
        <meshBasicMaterial color={config.trailColor} transparent opacity={0.3} />
      </mesh>

      {/* Main projectile */}
      <mesh ref={meshRef} position={[projectile.position.x, projectile.position.y, projectile.position.z]}>
        {element === 'fire' ? (
          <sphereGeometry args={[config.size, 10, 10]} />
        ) : element === 'ice' ? (
          <octahedronGeometry args={[config.size * 1.1]} />
        ) : element === 'lightning' ? (
          <tetrahedronGeometry args={[config.size * 1.2]} />
        ) : element === 'arcane' ? (
          <icosahedronGeometry args={[config.size]} />
        ) : (
          <sphereGeometry args={[config.size, 10, 10]} />
        )}
        <meshStandardMaterial
          color={config.color}
          emissive={config.emissive}
          emissiveIntensity={1.5}
          roughness={0.1}
          metalness={0.2}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Outer glow shell */}
      <mesh ref={outerRef} position={[projectile.position.x, projectile.position.y, projectile.position.z]}>
        <sphereGeometry args={[config.size * 1.8, 8, 8]} />
        <meshBasicMaterial color={config.color} transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>

      {/* Light source */}
      <pointLight
        position={[projectile.position.x, projectile.position.y, projectile.position.z]}
        color={config.lightColor}
        intensity={element === 'legendary' ? 3 : 1.5}
        distance={3.5}
      />

      {/* Extra particles for fire/arcane */}
      {(element === 'fire' || element === 'arcane') && (
        <mesh position={[
          projectile.position.x + (Math.random() - 0.5) * 0.2,
          projectile.position.y + (Math.random() - 0.5) * 0.2,
          projectile.position.z + (Math.random() - 0.5) * 0.2
        ]}>
          <sphereGeometry args={[config.size * 0.4, 4, 4]} />
          <meshBasicMaterial color={config.trailColor} transparent opacity={0.5} />
        </mesh>
      )}
    </>
  );
}
