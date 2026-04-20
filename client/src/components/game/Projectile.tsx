import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { Projectile as ProjectileType } from "../../lib/gameTypes";
import { usePlayer } from "../../lib/stores/usePlayer";
import { useEnemies } from "../../lib/stores/useEnemies";
import { useVFX } from "../../lib/stores/useVFX";
import { checkCollision } from "../../lib/gameUtils";
import { useTelemetry } from "../../lib/stores/useTelemetry";

interface ProjectileProps {
  projectile: ProjectileType;
}

const CHAIN_MAX_RANGE = 7;

function calculateSplashDamageFalloff(baseDamage: number, distance: number, radius: number): number {
  const normalized = Math.max(0, 1 - distance / Math.max(1, radius));
  return Math.floor(baseDamage * normalized);
}

const ELEMENT_CONFIG = {
  fire: {
    color: '#ff5500',
    emissive: '#ff2200',
    lightColor: '#ff7700',
    trailColor: '#ff8800',
    size: 0.15,
    lightIntensity: 2.0,
    vfxColor: '#ff6600',
  },
  ice: {
    color: '#88ddff',
    emissive: '#44aaff',
    lightColor: '#aaddff',
    trailColor: '#66ccff',
    size: 0.14,
    lightIntensity: 1.8,
    vfxColor: '#88ccff',
  },
  lightning: {
    color: '#ffff44',
    emissive: '#ffdd00',
    lightColor: '#ffff88',
    trailColor: '#ffee44',
    size: 0.11,
    lightIntensity: 2.5,
    vfxColor: '#ffff00',
  },
  arcane: {
    color: '#cc55ff',
    emissive: '#aa22ff',
    lightColor: '#dd77ff',
    trailColor: '#bb55ff',
    size: 0.13,
    lightIntensity: 2.2,
    vfxColor: '#cc44ff',
  },
  default: {
    color: '#44ff88',
    emissive: '#22ee66',
    lightColor: '#66ffaa',
    trailColor: '#44ffaa',
    size: 0.12,
    lightIntensity: 1.5,
    vfxColor: '#44ff88',
  },
};

// Multi-point motion trail built from particle buffer
function ProjectileTrail({ projectile, config }: { projectile: ProjectileType; config: typeof ELEMENT_CONFIG.default }) {
  const TRAIL_POINTS = 8;
  const pointsRef = useRef<THREE.Points>(null);
  const posAttr = useRef<THREE.BufferAttribute>(null);
  const history = useRef<number[]>([]);

  const positions = useMemo(() => new Float32Array(TRAIL_POINTS * 3), []);

  useFrame(() => {
    if (!posAttr.current) return;
    // Push current position to front
    history.current.unshift(projectile.position.x, projectile.position.y, projectile.position.z);
    if (history.current.length > TRAIL_POINTS * 3) history.current.length = TRAIL_POINTS * 3;

    const arr = posAttr.current.array as Float32Array;
    for (let i = 0; i < history.current.length; i++) {
      arr[i] = history.current[i];
    }
    posAttr.current.needsUpdate = true;

    if (pointsRef.current) {
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      mat.size = config.size * 1.6;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute ref={posAttr} attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={config.trailColor}
        size={config.size * 1.4}
        transparent
        opacity={0.45}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export default function Projectile({ projectile }: ProjectileProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const { removeProjectile } = usePlayer();
  const { applyDamage, enemies } = useEnemies();
  const { addEffect } = useVFX();
  const { recordCombatEvent } = useTelemetry();

  const element = projectile.element || 'default';
  const config = ELEMENT_CONFIG[element as keyof typeof ELEMENT_CONFIG] || ELEMENT_CONFIG.default;

  const hitFiredRef = useRef(false);
  const piercedTargetsRef = useRef<Set<string>>(new Set());

  useFrame((state) => {
    if (meshRef.current && projectile.active) {
      const t = state.clock.elapsedTime;

      // Move projectile
      const newPos = {
        x: projectile.position.x + projectile.direction.x * projectile.speed * 0.016,
        y: projectile.position.y + projectile.direction.y * projectile.speed * 0.016,
        z: projectile.position.z + projectile.direction.z * projectile.speed * 0.016,
      };
      projectile.position = newPos;
      meshRef.current.position.set(newPos.x, newPos.y, newPos.z);

      // Element-specific animations
      if (element === 'lightning') {
        const flicker = 0.75 + Math.random() * 0.5;
        meshRef.current.scale.setScalar(flicker);
        if (outerRef.current) outerRef.current.scale.setScalar(flicker * 1.8);
        if (lightRef.current) lightRef.current.intensity = config.lightIntensity * flicker;
      } else if (element === 'fire') {
        const pulse = 1 + Math.sin(t * 18) * 0.22;
        meshRef.current.scale.setScalar(pulse);
        if (lightRef.current) lightRef.current.intensity = config.lightIntensity * (0.8 + Math.sin(t * 12) * 0.2);
      } else if (element === 'arcane') {
        meshRef.current.rotation.y += 0.14;
        meshRef.current.rotation.x += 0.09;
        if (outerRef.current) {
          outerRef.current.rotation.y -= 0.1;
          const p = 1 + Math.sin(t * 6) * 0.15;
          outerRef.current.scale.setScalar(p);
        }
      } else if (element === 'ice') {
        meshRef.current.rotation.y += 0.08;
        meshRef.current.rotation.z += 0.06;
      } else {
        meshRef.current.rotation.y += 0.12;
      }

      if (outerRef.current) outerRef.current.position.copy(meshRef.current.position);
      if (lightRef.current) lightRef.current.position.copy(meshRef.current.position);

      // Check collision with enemies
      const hitEnemy = enemies.find((enemy) =>
        !piercedTargetsRef.current.has(enemy.id) && checkCollision(newPos, enemy.position, 1)
      );

      if (hitEnemy) {
        const hitResult = applyDamage(hitEnemy.id, {
          damage: projectile.damage,
          damageType: projectile.damageType,
          hitPosition: newPos,
        });
        recordCombatEvent({
          timestamp: Date.now(),
          damage: hitResult.finalDamage,
          damageType: projectile.damageType ?? "physical",
          enemyType: hitEnemy.type,
          weakPoint: hitResult.weakPoint,
          killed: hitResult.killed,
        });

        if (!hitFiredRef.current) {
          hitFiredRef.current = true;
          addEffect({
            type: "hit",
            position: { x: newPos.x, y: newPos.y + 0.5, z: newPos.z },
            color: hitResult.weakPoint ? "#ffee88" : config.vfxColor,
            scale: hitResult.weakPoint ? 1.4 : 1,
          });
        }

        if ((projectile.splashRadius ?? 0) > 0.1) {
          enemies.forEach((enemy) => {
            if (enemy.id === hitEnemy.id) return;
            const dx = enemy.position.x - newPos.x;
            const dz = enemy.position.z - newPos.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist <= (projectile.splashRadius ?? 0)) {
              applyDamage(enemy.id, {
                damage: calculateSplashDamageFalloff(projectile.damage, dist, projectile.splashRadius ?? 1),
                damageType: projectile.damageType,
                hitPosition: enemy.position,
              });
            }
          });
          addEffect({ type: "impact", position: newPos, color: config.vfxColor, scale: 1 + (projectile.splashRadius ?? 0) * 0.2 });
        }

        piercedTargetsRef.current.add(hitEnemy.id);

        if ((projectile.chain ?? 0) > 0) {
          const chainTarget = enemies
            .filter((e) => !piercedTargetsRef.current.has(e.id))
            .map((enemy) => {
              const dx = enemy.position.x - newPos.x;
              const dz = enemy.position.z - newPos.z;
              return { enemy, distance: Math.sqrt(dx * dx + dz * dz) };
            })
            .filter(({ distance }) => distance <= CHAIN_MAX_RANGE)
            .sort((a, b) => a.distance - b.distance)[0];

          if (chainTarget) {
            const dir = new THREE.Vector3(
              chainTarget.enemy.position.x - newPos.x,
              0,
              chainTarget.enemy.position.z - newPos.z
            ).normalize();
            projectile.direction = { x: dir.x, y: 0, z: dir.z };
            projectile.chain = (projectile.chain ?? 0) - 1;
            addEffect({ type: "impact", position: newPos, color: "#88ccff", scale: 0.8 });
            return;
          }
        }

        if ((projectile.ricochet ?? 0) > 0) {
          projectile.direction = {
            x: -projectile.direction.x + (Math.random() - 0.5) * 0.2,
            y: projectile.direction.y,
            z: -projectile.direction.z + (Math.random() - 0.5) * 0.2,
          };
          projectile.ricochet = (projectile.ricochet ?? 0) - 1;
          addEffect({ type: "impact", position: newPos, color: "#ffffff", scale: 0.6 });
          return;
        }

        if ((projectile.pierce ?? 0) > 0) {
          projectile.pierce = (projectile.pierce ?? 0) - 1;
          return;
        }

        removeProjectile(projectile.id);
      }

      // Remove projectile if too far
      const dx = newPos.x - projectile.spawnPosition.x;
      const dz = newPos.z - projectile.spawnPosition.z;
      if (Math.sqrt(dx * dx + dz * dz) > (projectile.maxRange ?? 30)) {
        removeProjectile(projectile.id);
      }
    }
  });

  if (!projectile.active) return null;

  return (
    <>
      {/* Multi-point motion trail */}
      <ProjectileTrail projectile={projectile} config={config} />

      {/* Main projectile body */}
      <mesh ref={meshRef} position={[projectile.position.x, projectile.position.y, projectile.position.z]}>
        {element === 'fire' ? (
          <sphereGeometry args={[config.size, 12, 12]} />
        ) : element === 'ice' ? (
          <octahedronGeometry args={[config.size * 1.1]} />
        ) : element === 'lightning' ? (
          <tetrahedronGeometry args={[config.size * 1.3]} />
        ) : element === 'arcane' ? (
          <icosahedronGeometry args={[config.size]} />
        ) : (
          <sphereGeometry args={[config.size, 10, 10]} />
        )}
        <meshStandardMaterial
          color={config.color}
          emissive={config.emissive}
          emissiveIntensity={2.0}
          roughness={0.05}
          metalness={0.15}
          transparent
          opacity={0.97}
        />
      </mesh>

      {/* Outer soft glow shell */}
      <mesh ref={outerRef} position={[projectile.position.x, projectile.position.y, projectile.position.z]}>
        <sphereGeometry args={[config.size * 2.2, 8, 8]} />
        <meshBasicMaterial color={config.color} transparent opacity={0.1} side={THREE.BackSide} depthWrite={false} />
      </mesh>

      {/* Dynamic light source */}
      <pointLight
        ref={lightRef}
        position={[projectile.position.x, projectile.position.y, projectile.position.z]}
        color={config.lightColor}
        intensity={config.lightIntensity}
        distance={4.5}
        decay={2}
      />
    </>
  );
}
